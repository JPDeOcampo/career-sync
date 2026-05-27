export interface UpdatePasswordDTO {
  id: string | string[] | undefined;
  currentPassword: string;
  newPassword: string;
}

export interface VerifyResetPasswordDTO {
  signToken: string | undefined;
  userId: string | string[] | undefined;
  otp: string;
}

export interface RefreshResetPasswordDTO {
  id: string;
  purpose: "password-reset";
  iat?: number;
  exp?: number;
}

export interface ResetPasswordDTO {
  signToken: string | undefined;
  userId: string | string[] | undefined;
  newPassword: string;
}

export interface ResendResetPasswordDTO {
  ipAddress: string | undefined;
  userAgent: string | undefined;
  userId: string | string[] | undefined;
  signToken: string | undefined;
}
