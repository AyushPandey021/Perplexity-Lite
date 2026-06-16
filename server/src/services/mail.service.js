import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const mailConfig = {
    user: process.env.GOOGLE_USER_EMAIL?.trim(),
    clientId: process.env.GOOGLE_CLIENT_ID?.trim(),
    clientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim(),
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN?.trim(),
};

const hasMailConfig =
    mailConfig.user &&
    mailConfig.clientId &&
    mailConfig.clientSecret &&
    mailConfig.refreshToken;

const transporter = hasMailConfig ? nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: mailConfig.user,
        clientId: mailConfig.clientId,
        clientSecret: mailConfig.clientSecret,
        refreshToken: mailConfig.refreshToken,
    },
}) : null;

export default async function sendEmail({ to, subject, html, text }) {
    if (!transporter) {
        console.warn("Email not sent: mail service is not configured");
        return false;
    }

    const mailOptions = {
        from: mailConfig.user,
        to,
        subject,
        html,
        text,
    };
    await transporter.sendMail(mailOptions);
    return true;
}
