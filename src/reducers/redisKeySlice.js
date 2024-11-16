import { createSlice } from "@reduxjs/toolkit";

export const redisKeySlice = createSlice({
  name: "key",
  initialState: "",
  reducers: {
    setRedisKey: (state, action) => {
       return action.payload;
    },
  },
});

export const { setRedisKey } = redisKeySlice.actions;

export default redisKeySlice.reducer;
