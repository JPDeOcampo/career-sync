import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface paginationState {
  pages: {
    [key: string]: number;
  };
}

const initialState: paginationState = {
  pages: {},
};

const paginationSlice = createSlice({
  name: "pagination",
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<{ key: string; value: number }>) => {
      state.pages[action.payload.key] = action.payload.value;
    },
    resetPagination: () => initialState,
  },
});

export const { setPage, resetPagination } = paginationSlice.actions;
export default paginationSlice.reducer;
