import { transporter } from "./transporter";

interface SendEmailProps {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailProps) => {
  try {
    await transporter.sendMail({
      from:
        process.env.NODE_ENV === "production"
          ? process.env.EMAIL_FROM
          : process.env.EMAIL_USER,

      to,
      subject,
      html,
    });

    return true;
  } catch (err) {
    console.error(err);

    return false;
  }
};
