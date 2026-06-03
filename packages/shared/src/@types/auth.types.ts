export type OAuthProviderDTO = "LOCAL" | "GOOGLE" | "GITHUB";

export interface RegisterUserDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserDTO {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  loginCount?: number;
  accounts?: {
    provider: string;
    providerAccountId: string;
  }[];
  profile?: {
    coverType: string;
    coverValue: string;
    profileType: string;
    profileValue: string;
  };
  settings?: { darkMode: boolean };
}

export interface UserUpdateDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface UserUpdateSettingsDTO {
  darkMode: boolean;
}

export interface LoginUserDTO {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UpdatePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
