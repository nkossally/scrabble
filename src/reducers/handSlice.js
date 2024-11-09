import { createSlice } from "@reduxjs/toolkit";

export const handSlice = createSlice({
  name: "hand",
  initialState: [],
  reducers: {
    modifyHand: (state, action) => {
       return action.payload;
    },
  },
});

export const { modifyHand } = handSlice.actions;

export default handSlice.reducer;
