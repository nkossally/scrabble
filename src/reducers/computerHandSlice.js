import { createSlice } from "@reduxjs/toolkit";

export const computerHandSlice = createSlice({
  name: "computerHand",
  initialState: [],
  reducers: {
    modifyComputerHand: (state, action) => {
       return action.payload;
    },
  },
});

export const { modifyComputerHand } = computerHandSlice.actions;

export default computerHandSlice.reducer;
