import jwt from "jsonwebtoken";
import usermodel from "../models/user.model.js";
import sendEmail from "../services/mail.service.js";

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret";
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const AUTH_COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 1000,
};

const createAuthToken = (userId) => jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: "1h" }
);

const renderVerificationPage = ({ title, message, status = "success" }) => {
    const isSuccess = status === "success";

    return `
  <div style="
    font-family: Arial, sans-serif;
    text-align: center;
    margin-top: 100px;
  ">
    <h1 style="color: ${isSuccess ? "#22c55e" : "#ef4444"};">${title}</h1>
    <p>${message}</p>
    <a
      href="${CLIENT_URL}/login"
      style="
        display: inline-block;
        margin-top: 12px;
        padding: 10px 20px;
        background: #2563eb;
        color: white;
        text-decoration: none;
        border-radius: 6px;
      "
    >
      Go to Login
    </a>
  </div>
`;
};

export const register = async (req, res) => {
    const username = req.body.username?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    try {
        const existingUser = await usermodel.findOne({
            $or: [
                { username },
                ...(email ? [{ email: email.toLowerCase() }] : []),
            ],
        });

        if (existingUser) {
            const field = existingUser.username === username ? "Username" : "Email";
            return res.status(400).json({ message: `${field} already exists` });
        }

        const newUser = new usermodel({
            username,
            email,
            password,
            verified: !email,
        });

        await newUser.save();

        if (email) {
            const emailVerificationToken = jwt.sign(
                { userId: newUser._id, email: newUser.email },
                JWT_SECRET,
                { expiresIn: "1h" }
            );
            const verifyUrl = `${SERVER_URL}/api/auth/verify-email?token=${emailVerificationToken}`;

            try {
                const wasEmailSent = await sendEmail({
                    to: newUser.email,
                    subject: "Welcome to Perplexity Lite - Verify Your Email",
                    html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h1>Welcome to Perplexity Lite</h1>

      <p>Hello <strong>${newUser.username}</strong>,</p>

      <p>
        Thank you for registering with Perplexity Lite. To complete your
        registration and activate your account, please verify your email
        address by clicking the button below.
      </p>

      <p>
        <a
          href="${verifyUrl}"
          style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563eb;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
          "
        >
          Verify Email
        </a>
      </p>

      <p>
        If the button does not work, copy and paste the following URL into
        your browser:
      </p>

      <p>${verifyUrl}</p>

      <p>If you did not create this account, you can safely ignore this email.</p>

      <p>
        Best regards,<br />
        <strong>Perplexity Lite Team</strong>
      </p>
    </div>
  `,
                });

                if (!wasEmailSent) {
                    await usermodel.deleteOne({ _id: newUser._id });
                    return res.status(503).json({
                        message: "Email service is not configured. Add GOOGLE_USER_EMAIL and EMAIL_PASSWORD environment variables, then register again.",
                    });
                }
            } catch (mailError) {
                console.error("Verification email error:", mailError);
                await usermodel.deleteOne({ _id: newUser._id });
                return res.status(503).json({
                    message: "Could not send verification email. Check email credentials and try again.",
                });
            }
        }

        return res.status(201).json({
            message: email
                ? "Verification email sent. Please verify your email to continue."
                : "User registered successfully",
        });
    } catch (error) {
        console.error("Register error:", error);

        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || "Account";
            return res.status(400).json({
                message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
            });
        }

        return res.status(500).json({ message: "Server error" });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).send(renderVerificationPage({
                title: "Verification Link Missing",
                message: "The verification link is missing its token. Please use the latest email we sent you.",
                status: "error",
            }));
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await usermodel.findOne({
            _id: decoded.userId,
            email: decoded.email,
        });

        if (!user) {
            return res.status(400).send(renderVerificationPage({
                title: "Invalid Verification Link",
                message: "This verification link is invalid. Please register again or request a new verification email.",
                status: "error",
            }));
        }

        if (!user.verified) {
            user.verified = true;
            await user.save();
        }

        const authToken = createAuthToken(user._id);
        res.cookie("token", authToken, AUTH_COOKIE_OPTIONS);

        return res.redirect(`${CLIENT_URL}/dashboard?verified=1`);
    } catch (error) {
        const message = error.name === "TokenExpiredError"
            ? "This verification link has expired. Please register again or request a new verification email."
            : "This verification link is invalid. Please register again or request a new verification email.";

        return res.status(400).send(renderVerificationPage({
            title: "Email Verification Failed",
            message,
            status: "error",
        }));
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const user = await usermodel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        if (!user.verified) {
            return res.status(403).json({
                message: "Please verify your email before logging in",
            });
        }

        const token = createAuthToken(user._id);
        res.cookie("token", token, AUTH_COOKIE_OPTIONS);

        return res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
};


export const getMe = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await usermodel
            .findById(userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                verified: user.verified,
            },
        });
    } catch (error) {
        console.error("Get Me Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
