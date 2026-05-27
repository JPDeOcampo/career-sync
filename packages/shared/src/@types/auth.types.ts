export interface RegisterUserDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UserDTO {
  userId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  loginCount?: number;
}

export interface LoginUserDTO {
  email: string;
  password: string;
}

export interface UpdatePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
