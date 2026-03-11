"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface globalState {
  isViewOnly: boolean;
  isModalOpen: boolean;
}

const initialState: globalState = {
  isViewOnly: false,
  isModalOpen: false,
};

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setIsViewOnly: (state, action: PayloadAction<boolean>) => {
      state.isViewOnly = action.payload;
    },
    setIsModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isModalOpen = action.payload;
    },
    resetGlobal: () => initialState,
  },
});

export const { setIsViewOnly, setIsModalOpen, resetGlobal } =
  globalSlice.actions;
export default globalSlice.reducer;
