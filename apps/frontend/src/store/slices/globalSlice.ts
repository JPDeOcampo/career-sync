"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface globalState {
  viewOnly: {
    info: boolean;
    applicationMethod: boolean;
    interviewStages: boolean;
    notes: boolean;
  };
  isJobModalShow: boolean;
  isShowModal: boolean;
  currentStep: number;
  reviewJobApplication: {
    isToReview: boolean;
    isOnReview: boolean;
  };
}

const initialState: globalState = {
  viewOnly: {
    info: false,
    applicationMethod: false,
    interviewStages: false,
    notes: false,
  },
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
    setViewOnly: (
      state,
      action: PayloadAction<Partial<typeof state.viewOnly>>,
    ) => {
      // If empty object, reset all to false
      if (Object.keys(action.payload).length === 0) {
        Object.keys(state.viewOnly).forEach((key) => {
          state.viewOnly[key as keyof typeof state.viewOnly] = false;
        });
      } else {
        // Otherwise, merge normally
        Object.assign(state.viewOnly, action.payload);
      }
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
  setViewOnly,
  setIsJobModalShow,
  setIsShowModal,
  setCurrentStep,
  setReviewJobApplication,
  resetGlobal,
} = globalSlice.actions;
export default globalSlice.reducer;
