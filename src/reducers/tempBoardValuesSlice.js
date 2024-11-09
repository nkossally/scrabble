import { createSlice } from "@reduxjs/toolkit";
import { createEmptyBoard } from "./reducersUtil";

export const tempBoardValuesSlice = createSlice({
  name: "tempBoardValues",
  initialState: createEmptyBoard(),
  reducers: {
    addTempLetterToBoard: (state, action) => {
      const row = action.payload.row;
      const col = action.payload.col;
      state[row][col] = action.payload.letter;
    },
    removeTempLetterFromBoard: (state, action) => {
      const row = action.payload.row;
      const col = action.payload.col;
      state[row][col] = undefined;
    },
  },
});

export const { addTempLetterToBoard, removeTempLetterFromBoard } =
  tempBoardValuesSlice.actions;

export default tempBoardValuesSlice.reducer;
