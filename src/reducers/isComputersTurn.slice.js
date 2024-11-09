import { createSlice } from "@reduxjs/toolkit";

export const isComputersTurnSlice = createSlice({
  name: "isComputersTurn",
  initialState: 0,
  reducers: {
    setIsComputersTurn: (state, action) => {
       return action.payload;
    },
  },
});

export const { setIsComputersTurn } = isComputersTurnSlice.actions;

export default isComputersTurnSlice.reducer;
