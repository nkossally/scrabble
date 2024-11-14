import {
  BOARD_SIZE,
  LETTER_TO_SCORE,
  MID_IDX,
  ANIMATION_DURATION,
  DIRS,
} from "./consts";
import { removeDumpSelections } from "./reducers/selectedForDumpingHandIndicesSlice";
import { modifyHand } from "./reducers/handSlice";
import { modifyComputerHand } from "./reducers/computerHandSlice";
import { modifyLettersLeft } from "./reducers/lettersLeftSlice";
import { updateScore } from "./reducers/scoreSlice";
import { updateComputerScore } from "./reducers/computerScoreSlice";
import {
  addLetterToBoard,
  removeLetterFromBoard,
} from "./reducers/boardValuesSlice";
import { removeTempLetterFromBoard } from "./reducers/tempBoardValuesSlice";
import { setIsComputersTurn } from "./reducers/isComputersTurn.slice";
import { setUpGame, getComputerFirstMove, getBestMove, insertTilesInBackend } from "./api";

const getIsValidWord = (word, dictionaryTrie) => {
  let i = 0;
  let curr = dictionaryTrie;
  while (i < word.length) {
    const letter = word[i];
    if (curr.children[letter]) {
      curr = curr.children[letter];
      i++;
    } else {
      break;
    }
  }
  return i === word.length && curr.terminal;
};

const shuffle = (array) => {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

const getLongestLetterAndIndexArr = (computerHand, localDictionary) => {
  let longestLetterAndIndexArr = [];
  const elemsAndIndices = computerHand.map((letter, idx) => {
    return { letter, idx };
  });
  const helper = (selections, leftovers, node) => {
    if (node.terminal && selections.length > longestLetterAndIndexArr.length) {
      longestLetterAndIndexArr = selections;
    }

    for (let i = 0; i < leftovers.length; i++) {
      const letter = leftovers[i].letter;
      if(node.children[letter]){
        helper(
          [...selections, leftovers[i]],
          leftovers.slice(0, i).concat(leftovers.slice(i + 1)),
          node.children[letter]
        );
      }
    }
  };

  helper([], elemsAndIndices, localDictionary);
  return longestLetterAndIndexArr;
};

const tileScoreIdx = {
  ct: [112],
  tw: [0, 7, 14, 105, 119, 210, 217, 224],
  tl: [20, 24, 76, 80, 84, 88, 136, 140, 144, 148, 200, 204],
  dw: [16, 28, 32, 42, 48, 56, 64, 70, 154, 160, 168, 176, 182, 192, 196, 208],
  dl: [
    3, 11, 36, 38, 45, 52, 59, 88, 92, 96, 98, 102, 108, 116, 122, 126, 128,
    132, 165, 172, 179, 186, 188, 213, 221,
  ],
};

const toTileIndex = (row, column) => {
  if (row < BOARD_SIZE && row >= 0 && column < BOARD_SIZE && column >= 0) {
    return row * BOARD_SIZE + column;
  } else {
    return -1;
  }
};

export const getSpecialTileScoreIdx = (i, j) => {
  var ti = toTileIndex(i, j);
  let result = "";
  for (var t in tileScoreIdx) {
    var idx = tileScoreIdx[t].indexOf(ti);
    if (idx >= 0) {
      result = t;
      break;
    }
  }
  return result;
};

export const pass =
  (dispatch, setIsComputersTurn, hand, tempBoardValues) => () => {
    dispatch(removeDumpSelections());
    removeAllTempLetters(
      /** putBackInHand */ true,
      dispatch,
      hand,
      tempBoardValues
    );
    dispatch(setIsComputersTurn(true));
  };

export const startGame = async (dispatch, hand, boardValues, tempBoardValues) => {
  const resp = await setUpGame();
  const tiles = resp["tiles"]
  const computerHand = resp["computer_hand"]
  const playerHand = resp["player_hand"]

  removeAllTempLetters(
    /** putBackInHand */ false,
    dispatch,
    hand,
    tempBoardValues
  );
  removeAllLetters(dispatch, boardValues);
  dispatch(modifyHand(playerHand));
  dispatch(modifyComputerHand(computerHand));
  dispatch(modifyLettersLeft(tiles));
  dispatch(updateComputerScore(0));
  dispatch(updateScore(0));
};

const handleSetInvalidWords = (text, setInvalidWords) => {
  setInvalidWords(text);
  setTimeout(() => {
    setInvalidWords("");
  }, ANIMATION_DURATION);
};

export const submitWord =
  (
    virtualBoard,
    indices,
    setInvalidWords,
    dispatch,
    isComputersTurn,
    setSelectedComputerTiles,
    setIsComputersTurn,
    localDictionary,
    computerScore,
    playerScore,
    computerHand,
    lettersLeft,
    hand,
    boardValues,
    tempBoardValues
  ) =>
  async () => {
    dispatch(removeDumpSelections());
    const lettersOnBoard = getPermanentlyPlacedLetters(boardValues);
    const isFirstPlay = lettersOnBoard.length === 0;

    const rowsAndCols = getPlacedLettersRowsAndCols(
      virtualBoard,
      tempBoardValues
    );

    let rows = rowsAndCols.rows;
    let cols = rowsAndCols.cols;

    if (rows.length === 0 && cols.length === 0) {
      handleSetInvalidWords(
        "Place letters on the board to form a word.",
        setInvalidWords
      );
      return;
    }
    if (rows.length > 1 && cols.length > 1) {
      handleSetInvalidWords(
        "Letters should be in same row or column.",
        setInvalidWords
      );
      return;
    }
    if (
      !getIsContinuousWord(
        rows,
        cols,
        virtualBoard,
        boardValues,
        tempBoardValues
      )
    ) {
      handleSetInvalidWords(
        "Letters must form a continuous word.",
        setInvalidWords
      );
      return;
    }
    if (!isFirstPlay && !getIsConnectedToPrevWord(rows, cols, boardValues)) {
      handleSetInvalidWords(
        "Words must connect to previous words.",
        setInvalidWords
      );
      return;
    }
    if (isFirstPlay && (!rows.includes(MID_IDX) || !cols.includes(MID_IDX))) {
      handleSetInvalidWords(
        "First word must have a tile in the center of board.",
        setInvalidWords
      );
      return;
    }

    const allWordsInDict = checkAllWordsOnBoard(
      virtualBoard,
      localDictionary,
      dispatch,
      computerScore,
      playerScore,
      boardValues,
      tempBoardValues
    );

    if (allWordsInDict) {
      permanentlyPlaceLetters(
        virtualBoard,
        computerHand,
        dispatch,
        lettersLeft,
        hand,
        tempBoardValues
      );
      await delay(100);
      dispatch(setIsComputersTurn(true));
    } else {
      handleSetInvalidWords(
        "Word(s) not found in dictionary.",
        setInvalidWords
      );
    }
  };

const checkAllWordsOnBoard = (
  virtualBoard,
  localDictionary,
  dispatch,
  computerScore,
  playerScore,
  boardValues,
  tempBoardValues
) => {
  const rowsAndCols = getPlacedLettersRowsAndCols(
    virtualBoard,
    tempBoardValues
  );
  let rows = rowsAndCols.rows;
  let cols = rowsAndCols.cols;
  let score = 0;

  let word = "";
  let maxWordLength = 0;
  let allWordsInDict = true;
  // if the word is vertical
  if (rows.length > 1) {
    const col = cols[0];
    const wordAndScore = getVerticalWordAtCoordinate(
      rows[0],
      col,
      virtualBoard,
      boardValues,
      tempBoardValues
    );
    word = wordAndScore.word;
    maxWordLength = Math.max(maxWordLength, word.length);
    if (word.length > 1) {
      score += wordAndScore.wordScore;
      const isValidWord = getIsValidWord(word, localDictionary);
      if (!isValidWord) return false;
    }
    // check if any of the letters in a vertical word adjoin an already placed horizontal words.
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const wordAndScore = getHorizontalWordAtCoordinate(
        row,
        col,
        virtualBoard,
        boardValues,
        tempBoardValues
      );
      if (wordAndScore) {
        const word = wordAndScore.word;
        maxWordLength = Math.max(maxWordLength, word.length);
        if (word.length > 1) {
          score += wordAndScore.wordScore;
          const isValidWord = getIsValidWord(word, localDictionary);
          if (!isValidWord) {
            allWordsInDict = false;
            break;
          }
        }
      }
    }
    if (!allWordsInDict) return false;
  } else {
    // word is horizontal
    const row = rows[0];
    const wordAndScore = getHorizontalWordAtCoordinate(
      row,
      cols[0],
      virtualBoard,
      boardValues,
      tempBoardValues
    );
    word = wordAndScore.word;
    maxWordLength = Math.max(maxWordLength, word.length);
    if (word.length > 1) {
      score += wordAndScore.wordScore;
      const isValidWord = getIsValidWord(word, localDictionary);

      if (!isValidWord) allWordsInDict = false;
    }
    if (!allWordsInDict) return false;

    for (let i = 0; i < cols.length; i++) {
      const col = cols[i];
      const wordAndScore = getVerticalWordAtCoordinate(
        row,
        col,
        virtualBoard,
        boardValues,
        tempBoardValues
      );
      if (wordAndScore) {
        const word = wordAndScore.word;
        maxWordLength = Math.max(maxWordLength, word.length);
        if (word.length > 1) {
          const isValidWord = getIsValidWord(word, localDictionary);
          score += wordAndScore.wordScore;
          if (!isValidWord) {
            allWordsInDict = false;
            break;
          }
        }
      }
    }
    if (!allWordsInDict) return false;
  }
  // don't submit any one letter words
  if (maxWordLength < 2) return false;
  if (allWordsInDict) {
    const tempLetterArr = getAllTempLetters(virtualBoard, tempBoardValues);
    const maybeFifty = tempLetterArr.length === 7 ? 50 : 0;
    if (virtualBoard) {
      dispatch(updateComputerScore(computerScore + score + maybeFifty));
    } else {
      dispatch(updateScore(playerScore + score + maybeFifty));
    }
  }

  return true;
};

const permanentlyPlaceLetters = async (
  virtualBoard,
  computerHand,
  dispatch,
  lettersLeft,
  hand,
  tempBoardValues
) => {
  let wordSoFar = "";
  let letterCount = 0;
  const computerHandCopy = Array.from(computerHand);
  const lettersAndCoordinates = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      let letter =
        getTempLetterAtCoordinate(i, j, tempBoardValues)
      if (letter) {
        wordSoFar += letter;
        dispatch(addLetterToBoard({ row: i, col: j, letter }));
        letterCount++;
        dispatch(removeTempLetterFromBoard({ row: i, col: j }));
        lettersAndCoordinates.push({letter, row: i, col: j})
      }
    }
  }
  const resp = await insertTilesInBackend(lettersAndCoordinates);
  const playerWordRack = resp["player_word_rack"];
  const tileBag = resp["tile_bag"];

  dispatch(modifyHand(playerWordRack));
  dispatch(modifyLettersLeft(tileBag));
};

const removeAllTempLetters = (
  putBackInHand,
  dispatch,
  hand,
  tempBoardValues
) => {
  const tempLetters = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      const letter = getTempLetterAtCoordinate(i, j, tempBoardValues);
      if (letter) {
        tempLetters.push(letter);
        dispatch(removeTempLetterFromBoard({ row: i, col: j }));
      }
    }
  }
  if (putBackInHand) {
    dispatch(modifyHand(hand.concat(tempLetters)));
  }
};

const removeAllLetters = (dispatch, boardValues) => {
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (getLetterAtCoordinate(i, j, boardValues)) {
        dispatch(removeLetterFromBoard({ row: i, col: j }));
      }
    }
  }
};

const getPlacedLettersRowsAndCols = (virtualBoard, tempBoardValues) => {
  const rows = new Set();
  const cols = new Set();
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (getTempLetterOnVirtualBoard(i, j, virtualBoard)) {
        rows.add(i);
        cols.add(j);
      } else if (getTempLetterAtCoordinate(i, j, tempBoardValues)) {
        rows.add(i);
        cols.add(j);
      }
    }
  }
  const rowsArr = Array.from(rows).sort((a, b) => a - b);
  const colsArr = Array.from(cols).sort((a, b) => a - b);

  return { rows: rowsArr, cols: colsArr };
};

const getIsContinuousWord = (
  rows,
  cols,
  virtualBoard,
  boardValues,
  tempBoardValues
) => {
  if (rows.length === 1 && cols.length === 1) return true;
  let dx = 0;
  let dy = 0;
  let dist;
  let result = true;
  if (rows.length > 1) {
    dx = 1;
    dist = rows[rows.length - 1] - rows[0];
  } else {
    dy = 1;
    dist = cols[cols.length - 1] - cols[0];
  }
  let x = rows[0];
  let y = cols[0];

  for (let i = 0; i < dist; i++) {
    x += dx;
    y += dy;
    if (
      !getLetterAtCoordinate(x, y, boardValues) &&
      !getTempLetterAtCoordinate(x, y, tempBoardValues) &&
      !getTempLetterOnVirtualBoard(x, y, virtualBoard)
    ) {
      result = false;
      break;
    }
  }
  return result;
};

const getLetterAtCoordinate = (x, y, boardValues) => {
  if (!boardValues) return;
  return isOnBoard(x, y) ? boardValues[x][y] : undefined;
};

const getTempLetterAtCoordinate = (x, y, tempBoardValues) => {
  if (!tempBoardValues) return;
  return isOnBoard(x, y) ? tempBoardValues[x][y] : undefined;
};

const getTempLetterOnVirtualBoard = (x, y, virtualBoard) => {
  if (!virtualBoard) return;
  if (!virtualBoard[x]) return;
  return isOnBoard(x, y) ? virtualBoard[x][y] : undefined;
};

const getIsConnectedToPrevWord = (rows, cols, boardValues) => {
  let result = false;
  if (rows.length > 1) {
    const col = cols[0];
    rows.forEach((row) => {
      if (getAdjacentToPlacedLetter(row, col, boardValues)) {
        result = true;
      }
    });
  } else {
    const row = rows[0];
    cols.forEach((col) => {
      if (getAdjacentToPlacedLetter(row, col, boardValues)) {
        result = true;
      }
    });
  }
  return result;
};

const getAdjacentToPlacedLetter = (x, y, boardValues) => {
  let result = false;
  DIRS.forEach((dir) => {
    const x1 = x + dir[0];
    const y1 = y + dir[1];
    if (isOnBoard(x1, y1) && getLetterAtCoordinate(x1, y1, boardValues)) {
      result = true;
    }
  });
  return result;
};

const isOnBoard = (x, y) => {
  return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
};

const getVerticalWordAtCoordinate = (
  x,
  y,
  virtualBoard,
  boardValues,
  tempBoardValues,
) => {
  let currX = x;
  let word = "";
  let wordScore = 0;
  let multiplier = 1;
  while (
    getTempLetterAtCoordinate(currX, y, tempBoardValues) ||
    getLetterAtCoordinate(currX, y, boardValues) ||
    getTempLetterOnVirtualBoard(currX, y, virtualBoard)
  ) {
    word +=
      getTempLetterAtCoordinate(currX, y, tempBoardValues) ||
      getLetterAtCoordinate(currX, y, boardValues) ||
      getTempLetterOnVirtualBoard(currX, y, virtualBoard);
    const letterScoreObj = calculateScoreFromLetter(
      currX,
      y,
      virtualBoard,
      undefined,
      boardValues,
      tempBoardValues,
    );
    wordScore += letterScoreObj.letterPoints;
    multiplier *= letterScoreObj.wordMultiplier;
    currX++;
  }
  currX = x - 1;
  while (
    getTempLetterAtCoordinate(currX, y, tempBoardValues) ||
    getLetterAtCoordinate(currX, y, boardValues) ||
    getTempLetterOnVirtualBoard(currX, y, virtualBoard)
  ) {
    word =
      (getTempLetterAtCoordinate(currX, y, tempBoardValues) ||
        getLetterAtCoordinate(currX, y, boardValues) ||
        getTempLetterOnVirtualBoard(currX, y, virtualBoard)) + word;
    const letterScoreObj = calculateScoreFromLetter(
      currX,
      y,
      virtualBoard,
      undefined,
      boardValues,
      tempBoardValues,
    );
    wordScore += letterScoreObj.letterPoints;
    multiplier *= letterScoreObj.wordMultiplier;
    currX--;
  }
  wordScore *= multiplier;
  return { word, wordScore };
};

const getHorizontalWordAtCoordinate = (
  x,
  y,
  virtualBoard,
  boardValues,
  tempBoardValues,
) => {
  let currY = y;
  let word = "";
  let wordScore = 0;
  let multiplier = 1;
  while (
    getTempLetterAtCoordinate(x, currY, tempBoardValues) ||
    getLetterAtCoordinate(x, currY, boardValues) ||
    getTempLetterOnVirtualBoard(x, currY, virtualBoard)
  ) {
    word +=
      getTempLetterAtCoordinate(x, currY, tempBoardValues) ||
      getLetterAtCoordinate(x, currY, boardValues) ||
      getTempLetterOnVirtualBoard(x, currY, virtualBoard);
    const letterScoreObj = calculateScoreFromLetter(
      x,
      currY,
      virtualBoard,
      undefined,
      boardValues,
      tempBoardValues,
    );
    wordScore += letterScoreObj.letterPoints;
    multiplier *= letterScoreObj.wordMultiplier;
    currY++;
  }
  currY = y - 1;
  while (
    getTempLetterAtCoordinate(x, currY, tempBoardValues) ||
    getLetterAtCoordinate(x, currY, boardValues) ||
    getTempLetterOnVirtualBoard(x, currY, virtualBoard)
  ) {
    word =
      (getTempLetterAtCoordinate(x, currY, tempBoardValues) ||
        getLetterAtCoordinate(x, currY, boardValues) ||
        getTempLetterOnVirtualBoard(x, currY, virtualBoard)) + word;
    const letterScoreObj = calculateScoreFromLetter(
      x,
      currY,
      virtualBoard,
      undefined,
      boardValues,
      tempBoardValues,
    );
    wordScore += letterScoreObj.letterPoints;
    multiplier *= letterScoreObj.wordMultiplier;
    currY--;
  }
  wordScore *= multiplier;
  return { word, wordScore };
};

const calculateScoreFromLetter = (
  i,
  j,
  virtualBoard,
  letterArg,
  boardValues,
  tempBoardValues,
) => {
  const letter =
    letterArg ||
    getTempLetterAtCoordinate(i, j, tempBoardValues) ||
    getLetterAtCoordinate(i, j, boardValues) ||
    getTempLetterOnVirtualBoard(i, j, virtualBoard);
  let letterPoints = LETTER_TO_SCORE[letter];
  let wordMultiplier = 1;

  if (
    letterArg ||
    getTempLetterAtCoordinate(i, j, tempBoardValues) ||
    getTempLetterOnVirtualBoard(i, j, virtualBoard)
  ) {
    const specialScore = getSpecialTileScoreIdx(i, j);

    switch (specialScore) {
      case "ct":
        wordMultiplier = 2;
        break;
      case "tw":
        wordMultiplier = 3;
        break;
      case "tl":
        letterPoints *= 3;
        break;
      case "dw":
        wordMultiplier = 2;
        break;
      case "dl":
        letterPoints *= 2;
        break;
    }
  }
  return { letterPoints, wordMultiplier };
};
  
export const handleComputerStep = async (
  dispatch,
  setSelectedComputerTiles,
  setIsComputersTurn,
  boardValues,
  tempBoardValues,
  setComputerPasses,
) => {
  const lettersOnBoard = getPermanentlyPlacedLetters(boardValues);

  if (lettersOnBoard.length === 0) {
    handleComputerStepOnEmptyBoard(
      boardValues,
      tempBoardValues,
      setSelectedComputerTiles,
      dispatch
    );
    return;
  }
  await delay(500);


  const resp = await getBestMove();
  console.log("resp", resp)
  let row = resp["row"];
  let col = resp["col"];
  const word = resp["word"];
  const usedLetters = resp["used_letters"];
  const tileBag = resp["tile_bag"];
  const computerWordRack = resp["computer_word_rack"];
  const isVertical =resp["is_vertical"];
  console.log(row, col, word, usedLetters, tileBag, computerWordRack);


  if (row !== undefined) {
    let count = 0;
    while (count < word.length) {
      if (!boardValues[row][col]) {
        dispatch(addLetterToBoard({ row, col, letter: word[count] }));
      }
      if (isVertical) {
        row++;
      } else {
        col++;
      }
      count++;
    }
  } else {
    setComputerPasses(true);
    setTimeout(() => {
      setComputerPasses(false);
    }, ANIMATION_DURATION);
  }

  let wordScore = 0;
  let multiplier = 1;
  row = resp.row;
  col = resp.col;
  // setSelectedComputerTiles(indices);
  // await delay(1000);
  // setSelectedComputerTiles([]);
  // for (let j = 0; j < word.length; j++) {
  //   const letter = word[j];
  //   const letterScoreObj = calculateScoreFromLetter(
  //     row + j,
  //     MID_IDX /* middle column */,
  //     null,
  //     letter,
  //     boardValues,
  //     tempBoardValues,
  //   );
  //   wordScore += letterScoreObj.letterPoints;
  //   multiplier *= letterScoreObj.wordMultiplier;

  //   dispatch(
  //     addLetterToBoard({
  //       row: row + j,
  //       col: 7,
  //       letter,
  //     })
  //   );
  // }
  // wordScore *= multiplier;
  // const maybeFifty = word.length === 7 ? 50 : 0;
  // dispatch(updateComputerScore(wordScore + maybeFifty));  

  dispatch(modifyComputerHand(computerWordRack));
  dispatch(modifyLettersLeft(tileBag));
  dispatch(setIsComputersTurn(false));

  setSelectedComputerTiles([]);
};

const lookForValidLettersPermutation = (
  permsWithData,
  boardValues,
  computerHand,
  node,
  wordSoFar,
  permWithIndices,
  indicesLeft,
  containsPlacedLetter,
  x,
  y,
  dir,
  startX,
  startY
) => {
  if (
    containsPlacedLetter &&
    wordSoFar.length > 1 &&
    permWithIndices.length > 0 &&
    node.terminal
  ) {
    permsWithData.push([permWithIndices, startX, startY, dir]);
  }
  if (!isOnBoard(x, y)) return;
  if (boardValues[x][y]) {
    const letter = boardValues[x][y];
    if (node.children[letter]) {
      lookForValidLettersPermutation(
        permsWithData,
        boardValues,
        computerHand,
        node.children[letter],
        wordSoFar + letter,
        [...permWithIndices],
        {...indicesLeft},
        true,
        x + dir[0],
        y + dir[1],
        dir,
        startX,
        startY
      );
    }
  } else {
    for (let i = 0; i < indicesLeft.length; i++) {
      const index = indicesLeft[i];
      const letter = computerHand[index];
      if (node.children[letter]) {
        const newIndicesLeft = [...indicesLeft];
        newIndicesLeft.splice(index, 1);
        const newPermWithIndices = [...permWithIndices];
        newPermWithIndices.push({ letter, index });
        lookForValidLettersPermutation(
          permsWithData,
          boardValues,
          computerHand,
          node.children[letter],
          wordSoFar + letter,
          newPermWithIndices,
          newIndicesLeft,
          containsPlacedLetter,
          x + dir[0],
          y + dir[1],
          dir,
          startX,
          startY
        );
      }
    }
  }
};

const getPermanentlyPlacedLetters = (boardValues) => {
  const arr = [];

  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      const letter = getLetterAtCoordinate(i, j, boardValues);
      if (letter) {
        arr.push({ row: i, col: j, letter });
      }
    }
  }
  return arr;
};

const placeLettersAroundSpot = (
  i,
  j,
  arr,
  localDictionary,
  boardValues,
  dir
) => {
  let result;
  // place horizontally
  const wordAndCoordinates = placeLetterArrAroundCoordinates(
    i,
    j,
    arr,
    dir[0],
    dir[1],
    boardValues
  );

  if (wordAndCoordinates) {
    const word = wordAndCoordinates.word;
    if (getIsValidWord(word, localDictionary)) {
      result = wordAndCoordinates;
    }
  }
  return result;
};

const placeLetterArrAroundCoordinates = (
  i,
  j,
  arr,
  dx,
  dy,
  boardValues
) => {
  let word = "";
  let idx = 0;
  let x = i;
  let y = j;
  let coordinates = [];

  while (idx < arr.length ) {
    if(!boardValues[x[y]]){
      word += arr[idx];
      idx++;
      coordinates.push([x, y])
    } else {
      word += boardValues[x][y]
    }
    x += dx;
    y += dy;
  }
  return { word, coordinates };
};

const handleComputerStepOnEmptyBoard = async (
  boardValues,
  tempBoardValues,
  setSelectedComputerTiles,
  dispatch,
) => {

  const resp = await getComputerFirstMove();
  console.log("resp", resp)
  const tileBag = resp['tile_bag'];
  const computerWordRack = resp['computer_word_rack'];
  const row = resp['row'];
  const col = resp['col'];
  const word = resp['word']
  // const computerWordRackCpy = [...computerWordRack];
  // const indices = [];
  // for(let i = 0; i < word.length; i++){
  //   const idx = computerWordRackCpy.indexOf(word[i])
  //   indices.push(idx);
  //   computerWordRackCpy[i] = "-";
  // }

  let wordScore = 0;
  let multiplier = 1;
  // setSelectedComputerTiles(indices);
  // await delay(1000);
  // setSelectedComputerTiles([]);
  for (let j = 0; j < word.length; j++) {
    const letter = word[j];
    const letterScoreObj = calculateScoreFromLetter(
      MID_IDX,
      col + j,
      null,
      letter,
      boardValues,
      tempBoardValues,
    );
    wordScore += letterScoreObj.letterPoints;
    multiplier *= letterScoreObj.wordMultiplier;

    dispatch(
      addLetterToBoard({
        row: MID_IDX,
        col: col + j,
        letter,
      })
    );
  }
  wordScore *= multiplier;
  const maybeFifty = word.length === 7 ? 50 : 0;
  dispatch(updateComputerScore(wordScore + maybeFifty));  

  dispatch(modifyComputerHand(computerWordRack));
  dispatch(modifyLettersLeft(tileBag));
  dispatch(setIsComputersTurn(false));
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const getAllTempLetters = (virtualBoard, tempBoardValues) => {
  const arr = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      const letter =
        getTempLetterOnVirtualBoard(i, j, virtualBoard) ||
        getTempLetterAtCoordinate(i, j, tempBoardValues);
      if (letter) {
        arr.push(letter);
      }
    }
  }
  return arr;
};

export const handleNewGameClick =
  (
    dispatch,
    hand,
    boardValues,
    tempBoardValues,
    setGameStarted,
    setIsGameOver
  ) =>
  () => {
    setGameStarted(false);
    setIsGameOver(false);
    dispatch(removeDumpSelections());
    startGame(dispatch, hand, boardValues, tempBoardValues);
  };

export const handleDump =
  (
    dispatch,
    hand,
    tempBoardValues,
    selectedForDumpingHandIndices,
    lettersLeft
  ) =>
  () => {
    const dumpNum = selectedForDumpingHandIndices.length;
    if (dumpNum > 0) {
      let newHand = [];
      for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
          if (tempBoardValues[i][j]) {
            newHand.push(tempBoardValues[i][j]);
          }
        }
      }
      const dumpedLetters = [];
      for (let i = 0; i < 7; i++) {
        if (selectedForDumpingHandIndices.includes(i)) {
          dumpedLetters.push(hand[i]);
        } else if (hand[i]) {
          newHand.push(hand[i]);
        }
      }
      newHand = newHand.concat(lettersLeft.slice(0, dumpNum));
      const newLettersLeft = shuffle(
        lettersLeft.slice(dumpNum).concat(dumpedLetters)
      );
      removeAllTempLetters(
        /** putBackInHand */ false,
        dispatch,
        hand,
        tempBoardValues
      );
      dispatch(modifyHand(newHand));
      dispatch(modifyLettersLeft(newLettersLeft));
      dispatch(removeDumpSelections());
      setTimeout(() => {
        dispatch(setIsComputersTurn(true));
      }, 30);
    }
  };
