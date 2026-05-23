import nodemailer from "nodemailer";

interface SendResetEmailParams {
  firstName: string;
  email: string;
  resetCode: string;
}

const isProduction = process.env.NODE_ENV === "production";

const transporter = nodemailer.createTransport({
  host: isProduction ? "smtp-relay.brevo.com" : "smtp.gmail.com",
  port: isProduction ? 587 : 465,
  secure: isProduction ? false : true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendResetPassword = async ({
  firstName,
  email,
  resetCode,
}: SendResetEmailParams): Promise<boolean> => {
  const htmlContent = `
    <html>
      <body
        style="
          margin:0;
          padding:24px 0;
          background-color:#f4f4f4;
          font-family:Arial,sans-serif;
          color:#333333;
        "
      >
        <div
          style="
            max-width:600px;
            margin:0 auto;
            padding:20px;
            background-color:#ffffff;
            border-radius:8px;
          "
        >

          <!-- Header -->
          <div style="text-align:center; margin-bottom:20px;">

            <table
              role="presentation"
              cellpadding="0"
              cellspacing="0"
              border="0"
              align="center"
              style="margin:auto;"
            >
              <tr>
                <td
                  style="
                    vertical-align:middle;
                    padding-right:8px;
                  "
                >
                  <img
                    src="cid:careersynclogo"
                    alt="CareerSync Logo"
                    width="48"
                    height="48"
                    style="display:block;"
                  />
                </td>

                <td style="vertical-align:middle;">
                  <h1
                    style="
                      margin:0;
                      color:#2b7fff;
                      font-size:32px;
                      font-weight:bold;
                    "
                  >
                    CareerSync
                  </h1>
                </td>
              </tr>
            </table>

            <h2
              style="
                color:#003366;
                margin-top:16px;
                margin-bottom:0;
                font-size:22px;
              "
            >
              Password Reset Request
            </h2>

          </div>

          <!-- Content -->
          <div
            style="
              font-size:16px;
              line-height:1.6;
              margin-bottom:20px;
            "
          >
            <p>Hi, ${firstName}</p>

            <p>
              You requested a password reset.
              Please use the one-time code below to reset your password:
            </p>

            <div
              style="
                font-size:24px;
                font-weight:bold;
                color:#003366;
                background-color:#f0f0f0;
                padding:14px;
                border-radius:5px;
                text-align:center;
                letter-spacing:18px;
                margin:20px 0;
              "
            >
              ${resetCode}
            </div>

            <p>
              This code will expire in 2 minutes.
              If you didn't request a password reset,
              please ignore this email.
            </p>
          </div>

          <!-- Footer -->
          <div
            style="
              text-align:center;
              font-size:14px;
              color:#888888;
              margin-top:20px;
            "
          >
            <p>
              &copy; ${new Date().getFullYear()}
              CareerSync. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: isProduction ? process.env.EMAIL_FROM : process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: htmlContent,
      attachments: [
        {
          filename: "logo.png",
          path: "../../apps/backend/public/images/logo/logo.png",
          cid: "careersynclogo",
        },
      ],
    });

    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
};
