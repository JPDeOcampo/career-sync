import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserDTO } from "@career-sync/shared";

interface AuthState {
  user: UserDTO | null;
  isAuthenticated?: boolean;
  resetEmail?: string | null;
  accessToken: string | null;
  isAuthLoading?: boolean;
  sessionExpiry: number;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  resetEmail: null,
  accessToken: null,
  isAuthLoading: true,
  sessionExpiry: 0,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{ user: UserDTO; accessToken: string }>,
    ) => {
      state.user = action.payload.user;
      state.isAuthenticated = action.payload.accessToken !== null;
      state.accessToken = action.payload.accessToken;
      state.resetEmail = null;
      state.isAuthLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.resetEmail = null;
      state.isAuthLoading = false;
    },
    setUser: (state, action: PayloadAction<UserDTO>) => {
      state.user = action.payload;
    },
    setUserId: (state, action: PayloadAction<UserDTO>) => {
      state.user = {
        ...state.user,
        userId: action.payload.userId,
        email: action.payload.email,
      };
    },
    setResetEmail: (state, action: PayloadAction<string>) => {
      state.resetEmail = action.payload;
    },
    setSessionExpiry: (state, action: PayloadAction<number>) => {
      state.sessionExpiry = action.payload;
    },
    resetPassword: (state) => {
      state.resetEmail = null;
    },
  },
});

export const {
  login,
  logout,
  setUser,
  setUserId,
  setResetEmail,
  setSessionExpiry,
  resetPassword,
} = authSlice.actions;
export default authSlice.reducer;
