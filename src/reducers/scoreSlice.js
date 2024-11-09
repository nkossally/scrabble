import { createSlice } from "@reduxjs/toolkit";

export const scoreSlice = createSlice({
  name: "score",
  initialState: 0,
  reducers: {
    updateScore: (state, action) => {
       return action.payload;
    },
  },
});

export const { updateScore } = scoreSlice.actions;

export default scoreSlice.reducer;
