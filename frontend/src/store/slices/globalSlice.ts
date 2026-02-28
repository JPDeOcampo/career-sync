"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TextFieldRequired {
  firstName: string;
  lastName: string;
  email: string;
  currentPassword: string;
  password: string;
  confirmPassword: string;
}

interface globalState {
  textFieldRequired: TextFieldRequired;
}

const initialState: globalState = {
  textFieldRequired: {
    firstName: "",
    lastName: "",
    email: "",
    currentPassword: "",
    password: "",
    confirmPassword: "",
  },
};

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setTextFieldRequired: (
      state,
      action: PayloadAction<Partial<TextFieldRequired>>,
    ) => {
      state.textFieldRequired = {
        ...state.textFieldRequired,
        ...action.payload,
      };
    },

    resetGlobal: () => initialState,
  },
});

export const { setTextFieldRequired, resetGlobal } = globalSlice.actions;
export default globalSlice.reducer;
