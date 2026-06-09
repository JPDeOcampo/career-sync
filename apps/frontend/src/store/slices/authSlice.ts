import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserDTO, EmailChangeRequestDTO } from "@career-sync/shared";

interface AuthState {
  user: UserDTO | null;
  newEmail?: string | null;
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
        id: action.payload.id,
        email: action.payload.email,
      };
    },
    updateSettings: (state, action: PayloadAction<UserDTO>) => {
      state.user = {
        ...state.user,
        settings: action.payload.settings,
      };
    },
    addEmailChangeRequest: (
      state,
      action: PayloadAction<EmailChangeRequestDTO>,
    ) => {
      if (!state.user) {
        return;
      }
      state.user = {
        ...state.user,
        emailChangeRequests: [
          ...(state.user.emailChangeRequests ?? []),
          action.payload,
        ],
      };
    },
    clearEmailChangeRequests: (
      state,
      action: PayloadAction<EmailChangeRequestDTO[]>,
    ) => {
      if (!state.user) return;

      state.user.emailChangeRequests = action.payload;
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
  updateSettings,
  addEmailChangeRequest,
  clearEmailChangeRequests,
  setResetEmail,
  setSessionExpiry,
  resetPassword,
} = authSlice.actions;
export default authSlice.reducer;
