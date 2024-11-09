import { createSlice } from "@reduxjs/toolkit";

export const lettersLeftSlice = createSlice({
  name: "lettersLeft",
  initialState: [],
  reducers: {
    modifyLettersLeft: (state, action) => {
       return action.payload;
    },
  },
});

export const { modifyLettersLeft } = lettersLeftSlice.actions;

export default lettersLeftSlice.reducer;
