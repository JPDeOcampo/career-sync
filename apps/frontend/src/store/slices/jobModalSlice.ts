import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface JobModalState {
  viewOnly: {
    info: boolean;
    applicationMethod: boolean;
    interviewStages: boolean;
    notes: boolean;
  };
  isJobModalShow: boolean;
  isFormDirty: boolean;
  currentStep: number;
  reviewJobApplication: {
    isToReview: boolean;
    isOnReview: boolean;
  };
}

const initialState: JobModalState = {
  viewOnly: {
    info: false,
    applicationMethod: false,
    interviewStages: false,
    notes: false,
  },
  isJobModalShow: false,
  currentStep: 0,
  reviewJobApplication: {
    isToReview: false,
    isOnReview: false,
  },
  isFormDirty: false,
};

const jobModalSlice = createSlice({
  name: "jobModal",
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
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    setReviewJobApplication: (
      state,
      action: PayloadAction<JobModalState["reviewJobApplication"]>,
    ) => {
      state.reviewJobApplication = action.payload;
    },
    setIsFormDirty: (state, action: PayloadAction<boolean>) => {
      state.isFormDirty = action.payload;
    },
    resetJobModal: () => initialState,
  },
});

export const {
  setViewOnly,
  setIsJobModalShow,
  setCurrentStep,
  setReviewJobApplication,
  setIsFormDirty,
  resetJobModal,
} = jobModalSlice.actions;

export default jobModalSlice.reducer;
