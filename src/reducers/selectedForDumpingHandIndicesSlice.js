import { createSlice } from "@reduxjs/toolkit";

export const selectedForDumpingHandIndicesSlice = createSlice({
  name: "selectedForDumpingHandIndices",
  initialState: [],
  reducers: {
    toggleSelection: (state, action) => {
      const payload = action.payload;
      const idx = state.indexOf(payload);
      if (idx !== -1) {
        state.splice(idx, 1);
      } else {
        state.push(payload);
      }
    },
    removeDumpSelections: (state, action) => {
      return []
    },
  },
});

export const { toggleSelection, removeDumpSelections } =
  selectedForDumpingHandIndicesSlice.actions;

export default selectedForDumpingHandIndicesSlice.reducer;
