import { emailLayout } from "../emailLayout";

interface VerifyEmailTemplateParams {
  firstName: string;
  verificationLink: string;
}

export const verifyEmailTemplate = ({
  firstName,
  verificationLink,
}: VerifyEmailTemplateParams) => {
  const content = `
    <div
      style="
        font-size:16px;
        line-height:1.6;
        margin-bottom:20px;
      "
    >
      <p>Hi ${firstName},</p>

      <p>
        Welcome to CareerSync!
      </p>

      <p>
        Please verify your email address by clicking
        the link below:
      </p>

      <p
        style="
          word-break:break-all;
          color:#2b7fff;
          font-size:14px;
        "
      >
        ${verificationLink}
      </p>

      <p>
        This link will expire in 15 minutes.
      </p>

      <p>
        If you did not create a CareerSync account,
        you can safely ignore this email.
      </p>
    </div>
  `;

  return emailLayout({
    title: "Verify Your Email",
    content,
  });
};
