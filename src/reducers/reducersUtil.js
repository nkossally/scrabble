import { BOARD_SIZE } from "../consts";

// exporting to reducers from the util file breaks app
export const createEmptyBoard = () => {
    const arr = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      arr.push([]);
    }
    return arr;
  };
  