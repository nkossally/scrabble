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
import { Node } from "./dataStructures";

import { setIsComputersTurn } from "./reducers/isComputersTurn.slice";

import classNames from "classnames";

import "./styles.scss";
import { kebabCase } from "lodash";

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
  );
  const [input1, setInput1] = useState(0)
  const [input2, setInput2] = useState(0)
  const [input3, setInput3] = useState("")

  const handleInput1 = e =>{
    const val = e.target.value
    setInput1(val[val.length - 1])
  }
  const handleInput2 = e =>{
    const val = e.target.value
    setInput2(val[val.length - 1])
  }
  const handleInput3 = e =>{
    const val = e.target.value
    setInput3(val[val.length - 1])
  }

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
    startGame(dispatch, hand, boardValues, tempBoardValues);
    setGameStarted(true);
  }, []);

  useEffect(() => {
    if (isComputersTurn) {
      handleComputerStep(
        setInvalidWords,
        dispatch,
        isComputersTurn,
        setSelectedComputerTiles,
        setIsComputersTurn,
        localDictionary,
        computerScore,
        lettersLeft,
        boardValues,
        tempBoardValues,
        computerHand,
        hand,
        setComputerPasses,
        playerScore,
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
  
  const testBackend = async () =>{
    // const resp = await fetch("/time");
    // const json = await resp.json()
    // console.log( json)
    // const resp2= await fetch("/dawg");
    // const json2= await resp2.json()
    // console.log( json2)

    // const resp3= await fetch("/game");
    // const json3= await resp3.json()
    // console.log( json3)
    // const resp4= await fetch("/blarg");
    // const json4= await resp4.json()
    // console.log( json4)

    // const resp5 = await fetch("/blarg2", {
    //   method: "POST",
    //   body: JSON.stringify({row: 1, col: 1, letter: "A"}),
    // });
    const resp5 = await fetch("/blarg2", {
      method: "POST",
      body: JSON.stringify({row: parseInt(input1), col: parseInt(input2), letter: input3}),
      headers:{
        "Content-Type": "application/json"
      }
    });
    const json5= await resp5.json()
    console.log( json5)
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
        <input value={input1} onChange={handleInput1}></input>
        <input value={input2} onChange={handleInput2}></input>
        <input value={input3} onChange={handleInput3}></input>

        <button onClick={testBackend}>buttony</button>
        <div>
          <Button
            variant="outlined"
            sx={buttonStyle}
            disabled={isComputersTurn || isGameOver}
            onClick={submitWord(
              undefined,
              undefined,
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
              tempBoardValues,
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
              lettersLeft
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
