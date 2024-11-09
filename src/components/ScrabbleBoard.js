import classNames from "classnames";
import { useSelector } from "react-redux";
import { BOARD_SIZE } from "../consts";
import Letter from "./Letter";
import { getSpecialTileScoreIdx } from "../util";
import ComputerHand from "./ComputerHand";

const ScrabbleBoard = ({ selectedTiles }) => {
  const boardValues = useSelector((state) => state.boardValues);
  const tempBoardValues = useSelector((state) => state.tempBoardValues);

  var boardSize = BOARD_SIZE - 1;

  const  boardLengthArr = Array(BOARD_SIZE).fill("");

  return (
    <div className="board-and-computer-hand-container">
      <div className="board-and-computer-hand">
        <ComputerHand selectedTiles={selectedTiles} invisibleLeft={true} />
        <div id="js-board">
          <div className={classNames("board")}>
            { boardLengthArr.map((elem, i) => {
              return (
                <div className="row" key={`row${i}`}>
                  { boardLengthArr.map((elem, j) => {
                    const specialScore = getSpecialTileScoreIdx(i, j);
                    const addLetters =
                      specialScore &&
                      (i !== boardSize / 2 || j !== boardSize / 2);
                    return (
                      <span key={`col ${j}`}>
                        {typeof boardValues[i][j] === "string" && (
                          <Letter
                            letter={boardValues[i][j]}
                            boardRow={i}
                            boardCol={j}
                            permanentlyOnBoard={true}
                            key={`tile${i}.${j}.boardVal`}
                          />
                        )}
                        {typeof tempBoardValues[i][j] === "string" && (
                          <Letter
                            letter={tempBoardValues[i][j]}
                            boardRow={i}
                            boardCol={j}
                            key={`tile${i}.${j}.tempBoardVal`}
                            temporary={true}
                          />
                        )}
                        {typeof tempBoardValues[i][j] !== "string" &&
                          typeof boardValues[i][j] !== "string" && (
                            <div
                              className={classNames(
                                "tile",
                                specialScore && `tile-${specialScore}`
                              )}
                              data-row={i}
                              data-col={j}
                              key={`tile${i}.${j}`}
                            >
                              <div className="decal" data-row={i} data-col={j}>
                                {addLetters && specialScore.toUpperCase()}
                              </div>
                            </div>
                          )}
                      </span>
                    );
                  })}
                </div>
              );
            })}{" "}
          </div>{" "}
        </div>
        <ComputerHand selectedTiles={selectedTiles} />
      </div>
    </div>
  );
};

export default ScrabbleBoard;
