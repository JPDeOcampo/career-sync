export interface RegisterUserDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UserDTO {
  firstName: string;
  lastName: string;
  email: string;
}

export interface LoginUserDTO {
  email: string;
  password: string;
}
