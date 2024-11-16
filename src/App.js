import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@mui/material";
import ScrabbleBoard from "./components/ScrabbleBoard";
import InstructionsModal from "./components/InstructionsModal";
import GameOverModal from "./components/GameOverModal";
import Hand from "./components/Hand";
import ScoreCard from "./components/ScoreCard";
import AllWords from "./words.txt";
import {
  pass,
  startGame,
  submitWord,
  handleComputerStep,
  handleNewGameClick,
  handleDump,
} from "./util";
import { testSetDawg, testGetDawg} from "./api"
import { Node } from "./dataStructures";

import { setIsComputersTurn } from "./reducers/isComputersTurn.slice";

import classNames from "classnames";

import "./styles.scss";

const resetButtonStyle = {
  "text-transform": "uppercase",
  color: "#00e0ff",
  "font-size": 20,
  "border-color": "#00e0ff",
  "background-color": "#F5EBED",
  "z-index": 1,
};

const buttonStyle = {
  "text-transform": "uppercase",
  color: "#00e0ff",
  "font-size": 20,
  "font-weight": 900,
  "border-color": "#00e0ff",
  margin: "0 10px",
  "background-color": "#F5EBED",
};

const App = () => {
  const [localDictionary, setLocalDictionary] = useState(new Set());
  const [selectedComputerTiles, setSelectedComputerTiles] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [invalidWords, setInvalidWords] = useState(false);
  const [computerPasses, setComputerPasses] = useState(false);
  const redisKey = useSelector((state) => state.redisKey);
  const boardValues = useSelector((state) => state.boardValues);
  const tempBoardValues = useSelector((state) => state.tempBoardValues);
  const lettersLeft = useSelector((state) => state.lettersLeft);
  const hand = useSelector((state) => state.hand);
  const computerHand = useSelector((state) => state.computerHand);
  const playerScore = useSelector((state) => state.score);
  const computerScore = useSelector((state) => state.computerScore);
  const isComputersTurn = useSelector((state) => state.isComputersTurn);
  const selectedForDumpingHandIndices = useSelector(
    (state) => state.selectedForDumpingHandIndices
)

  const dispatch = useDispatch();

  useEffect(()=>{},[isGameOver])

  useEffect(() => {
    if (
      gameStarted &&
      lettersLeft.length === 0 &&
      (computerHand.length === 0 || hand.length === 0)
    ) {
      setIsGameOver(true);
    }
  }, [lettersLeft, computerHand, hand]);

  useEffect(() => {
    const getTrieOfDictionaryWords = async () => {
      const result = await fetch(AllWords);
      const text = await result.text();
      const wordArray = text.split("\r\n").map((elem) => elem.toUpperCase());

      const dictionaryTrie = new Node();
      wordArray.forEach(word =>{
        let curr = dictionaryTrie;
        let i = 0;
        while(i < word.length){
          const letter = word[i]
          if(!curr.children[letter]){
            curr.children[letter] = new Node(letter);
          }
          curr =  curr.children[letter];
          i++;
        }
        curr.terminal = true;
      })

      setLocalDictionary(dictionaryTrie);
    };
    getTrieOfDictionaryWords();
  }, []);

  useEffect(() => {}, [
    tempBoardValues,
    boardValues,
    isComputersTurn,
    selectedComputerTiles,
    lettersLeft,
    isGameOver,
    hand,
    computerHand,
  ]);

  useEffect(() => {
    const wrapper = async () =>{
      await  startGame(dispatch, hand, boardValues, tempBoardValues);
    }
    wrapper();
    setGameStarted(true);
  }, []);

  useEffect(() => {
    if (isComputersTurn) {
      handleComputerStep(
        dispatch,
        setSelectedComputerTiles,
        setIsComputersTurn,
        boardValues,
        tempBoardValues,
        setComputerPasses,
        localDictionary,
        computerScore,
        playerScore,
        redisKey
      );
    }
  }, [isComputersTurn]);

  let gameOverText = "";
  if (computerScore < playerScore) {
    gameOverText = "You Win";
  } else if (computerScore > playerScore) {
    gameOverText = "Computer Wins";
  } else {
    gameOverText = "It's a tie";
  }


  return (
    <div className="App">
      <div className="top-row">

        <Button
          variant="outlined"
          sx={resetButtonStyle}
          onClick={handleNewGameClick(
            dispatch,
            hand,
            boardValues,
            tempBoardValues,
            setGameStarted,
            setIsGameOver
          )}
        >
          New Game
        </Button>
        <InstructionsModal />
      </div>
      <div className="second-row">
        {" "}
        <ScoreCard />
      </div>
      {isGameOver ? <GameOverModal text={gameOverText} /> : ""}
      <div className="player-row">
        <Hand />

        <div>
          <Button
            variant="outlined"
            sx={buttonStyle}
            disabled={isComputersTurn || isGameOver}
            onClick={submitWord(
              undefined,
              setInvalidWords,
              dispatch,
              setSelectedComputerTiles,
              setIsComputersTurn,
              localDictionary,
              computerScore,
              playerScore,
              computerHand,
              lettersLeft,
              hand,
              boardValues,
              tempBoardValues,
              redisKey
            )}
          >
            {" "}
            Submit{" "}
          </Button>
          <Button
            variant="outlined"
            sx={buttonStyle}
            disabled={isComputersTurn || isGameOver}
            onClick={handleDump(
              dispatch,
              hand,
              tempBoardValues,
              selectedForDumpingHandIndices,
              lettersLeft,
              redisKey
            )}
          >
            {" "}
            Dump{" "}
          </Button>
          <Button
            variant="outlined"
            sx={buttonStyle}
            disabled={isComputersTurn || isGameOver}
            onClick={pass(dispatch, setIsComputersTurn, hand, tempBoardValues)}
          >
            {" "}
            Pass{" "}
          </Button>
        </div>
      </div>
      <div
        className={classNames(
          "notification-text",
          invalidWords || computerPasses ? "fade-in-and-out" : ""
        )}
      >
        {computerPasses && <>Computer passes</>}
        {invalidWords && <>{invalidWords}</>}
      </div>
      {/* <div
        className={classNames(
          "notification-text", "fade-in"
        )}
      >
        {isComputersTurn && !computerPasses && <>Computer is playing</>}
      </div> */}
      <div className="board-and-computer-hand">
        <ScrabbleBoard selectedTiles={selectedComputerTiles} />
      </div>
    </div>
  );
};

export default App;
