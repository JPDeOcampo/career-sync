"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface globalState {
  viewOnly: boolean;
}

const initialState: globalState = {
  viewOnly: false,
};

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setViewOnly: (state, action: PayloadAction<boolean>) => {
      state.viewOnly = action.payload;
    },
    resetGlobal: () => initialState,
  },
});

export const { setViewOnly, resetGlobal } = globalSlice.actions;
export default globalSlice.reducer;
