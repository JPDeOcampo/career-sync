"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface globalState {
  isViewOnly: boolean;
  isJobModalShow: boolean;
  isShowModal: boolean;
  currentStep: number;
  reviewJobApplication: {
    isToReview: boolean;
    isOnReview: boolean;
  };
}

const initialState: globalState = {
  isViewOnly: false,
  isJobModalShow: false,
  isShowModal: false,
  currentStep: 0,
  reviewJobApplication: {
    isToReview: false,
    isOnReview: false,
  },
};

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setIsViewOnly: (state, action: PayloadAction<boolean>) => {
      state.isViewOnly = action.payload;
    },
    setIsJobModalShow: (state, action: PayloadAction<boolean>) => {
      state.isJobModalShow = action.payload;
    },
    setIsShowModal: (state, action: PayloadAction<boolean>) => {
      state.isShowModal = action.payload;
    },
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    setReviewJobApplication: (
      state,
      action: PayloadAction<globalState["reviewJobApplication"]>,
    ) => {
      state.reviewJobApplication = action.payload;
    },
    resetGlobal: () => initialState,
  },
});

export const {
  setIsViewOnly,
  setIsJobModalShow,
  setIsShowModal,
  setCurrentStep,
  setReviewJobApplication,
  resetGlobal,
} = globalSlice.actions;
export default globalSlice.reducer;
