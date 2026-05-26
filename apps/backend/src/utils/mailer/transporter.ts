import nodemailer from "nodemailer";

const isProduction = process.env.NODE_ENV === "production";

export const transporter = nodemailer.createTransport({
  host: isProduction ? "smtp-relay.brevo.com" : "smtp.gmail.com",

  port: isProduction ? 587 : 465,

  secure: !isProduction,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
