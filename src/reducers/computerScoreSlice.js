import { createSlice } from "@reduxjs/toolkit";

export const computerScoreSlice = createSlice({
  name: "computerScore",
  initialState: 0,
  reducers: {
    updateComputerScore: (state, action) => {
       return action.payload;
    },
  },
});

export const { updateComputerScore } = computerScoreSlice.actions;

export default computerScoreSlice.reducer;
