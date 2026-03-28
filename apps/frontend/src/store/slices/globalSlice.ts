import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface globalState {
  isShowModal: boolean;
}

const initialState: globalState = {
  isShowModal: false,
};

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setIsShowModal: (state, action: PayloadAction<boolean>) => {
      state.isShowModal = action.payload;
    },

    resetGlobal: () => initialState,
  },
});

export const { setIsShowModal, resetGlobal } = globalSlice.actions;
export default globalSlice.reducer;
