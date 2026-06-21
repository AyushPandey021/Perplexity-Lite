import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const mailConfig = {
    user: process.env.GOOGLE_USER_EMAIL?.trim(),
    pass: process.env.EMAIL_PASSWORD?.trim(),
};

const hasMailConfig = mailConfig.user && mailConfig.pass;

const transporter = hasMailConfig ? nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: mailConfig.user,
        pass: mailConfig.pass,
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
