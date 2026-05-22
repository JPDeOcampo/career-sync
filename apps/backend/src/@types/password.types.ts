export interface UpdatePasswordDTO {
  id: string | string[] | undefined;
  currentPassword: string;
  newPassword: string;
}

export interface VerifyResetPWVerificationCodeDTO {
  verificationToken: string | undefined;
  userId: string | string[] | undefined;
  verificationCode: string;
}

export interface RefreshResetPasswordCodeDTO {
  id: string;
  purpose: "password-reset";
  iat?: number;
  exp?: number;
}

export interface ResetPasswordDTO {
  resetToken: string | undefined;
  userId: string | string[] | undefined;
  newPassword: string;
}

export interface ResendResetVerificationCodeDTO {
  userId: string | string[] | undefined;
  resetToken: string | undefined;
}
