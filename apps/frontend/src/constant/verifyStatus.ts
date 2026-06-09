type VerificationMessage = {
  true: { type: "success"; message: string };
  false: { type: "error"; message: string };
};

const createVerificationEmailMessage = (
  successMessage: string,
): VerificationMessage => ({
  true: {
    type: "success",
    message: successMessage,
  },
  false: {
    type: "error",
    message: "Invalid or expired verification link, please try again later.",
  },
});

export const VERIFICATION_EMAIL_REGISTER = createVerificationEmailMessage(
  "Email verified successfully! You can now login.",
);

export const VERIFICATION_EMAIL_CHANGE = createVerificationEmailMessage(
  "Email verified successfully! Please login with your new email.",
);
