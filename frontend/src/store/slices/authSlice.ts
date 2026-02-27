import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserType } from "@/@types/userTypes";

interface AuthState {
  user: UserType | null;
  isAuthenticated?: boolean;
  resetEmail?: string | null;
  accessToken: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  resetEmail: null,
  accessToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<AuthState>) => {
      state.user = action.payload.user;
      state.isAuthenticated = action.payload.accessToken !== null;
      state.accessToken = action.payload.accessToken;
      state.resetEmail = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.resetEmail = null;
    },
    setUserId: (state, action: PayloadAction<UserType>) => {
      state.user = {
        ...state.user,
        userId: action.payload.userId,
        email: action.payload.email,
      };
    },
    setResetEmail: (state, action: PayloadAction<string>) => {
      state.resetEmail = action.payload;
    },
    resetPassword: (state) => {
      state.resetEmail = null;
    },
  },
});

export const { login, logout, setUserId, setResetEmail, resetPassword } =
  authSlice.actions;
export default authSlice.reducer;
