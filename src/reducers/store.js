import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import boardValuesReducer from "./boardValuesSlice";
import tempBoardValuesReducer from "./tempBoardValuesSlice";
import handReducer from "./handSlice";
import computerHandReducer from "./computerHandSlice";
import lettersLeftReducer from "./lettersLeftSlice";
import scoreSliceReducer from "./scoreSlice";
import computerScoreSliceReducer from "./computerScoreSlice";
import isComputersTurnSliceReducer from "./isComputersTurn.slice";
import selectedForDumpingHandIndicesReducer from "./selectedForDumpingHandIndicesSlice";

const persistConfig = {
  key: "root",
  storage,
  safelist: [
    "boardValues",
    "tempBoardValues",
    "hand",
    "computerHand",
    "lettersLeft",
    "score",
    "computerScore",
    "isComputersTurn",
  ],
};

const rootReducer = combineReducers({
  boardValues: boardValuesReducer,
  tempBoardValues: tempBoardValuesReducer,
  hand: handReducer,
  computerHand: computerHandReducer,
  lettersLeft: lettersLeftReducer,
  score: scoreSliceReducer,
  computerScore: computerScoreSliceReducer,
  isComputersTurn: isComputersTurnSliceReducer,
  selectedForDumpingHandIndices: selectedForDumpingHandIndicesReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);
