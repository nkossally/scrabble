import { useSelector, useDispatch } from "react-redux";
import { modifyHand } from "../reducers/handSlice";
import {
  addTempLetterToBoard,
  removeTempLetterFromBoard,
} from "../reducers/tempBoardValuesSlice";
import {
  removeDumpSelections,
  toggleSelection,
} from "../reducers/selectedForDumpingHandIndicesSlice";
import { LETTER_TO_SCORE } from "../consts";

import Draggable from "react-draggable";
import $ from "jquery";
import classNames from "classnames";

const Letter = ({
  letter,
  handIdx,
  isInHand,
  boardRow,
  boardCol,
  permanentlyOnBoard,
  isInComputerHand,
  temporary,
  selected,
}) => {
  const hand = useSelector((state) => state.hand);
  const selectedForDumpingHandIndices = useSelector(
    (state) => state.selectedForDumpingHandIndices
  );
  const points = LETTER_TO_SCORE[letter];

  const dispatch = useDispatch();

  var getHitElements = function (e) {
    var x = e.pageX;
    var y = e.pageY;
    var hitElements = [];

    $(":visible").each(function () {
      var offset = $(this).offset();

      if (
        offset.left < x &&
        offset.left + 30 > x &&
        offset.top < y &&
        offset.top + 30 > y
      ) {
        hitElements.push($(this));
      }
    });

    return hitElements;
  };

  const handleToggle = () => {
    dispatch(toggleSelection(handIdx));
  };

  const onStop = (e) => {
    const elems = getHitElements(e);
    let row;
    let col;
    for (let i = 0; i < elems.length; i++) {
      const maybeRow = parseInt(elems[i][0].getAttribute("data-row"));
      const maybeCol = parseInt(elems[i][0].getAttribute("data-col"));
      if (!isNaN(maybeCol) && !isNaN(maybeRow)) {
        row = maybeRow;
        col = maybeCol;
        if (isInHand) {
          dispatch(
            modifyHand(hand.slice(0, handIdx).concat(hand.slice(handIdx + 1)))
          );
        } else {
          dispatch(removeTempLetterFromBoard({ row: boardRow, col: boardCol }));
        }
        dispatch(addTempLetterToBoard({ row, col, letter }));

        break;
      }
    }
    if (!(!isNaN(row) && !isNaN(col))) {
      if (isInHand) {
        handleToggle();
        // If the letter tile was not dragged to a spot on the board
        // trigger a re-render that snaps the letter back to the original hand placement.
        dispatch(modifyHand(hand.map((elem) => elem.toLowerCase())));
        setTimeout(() => {
          dispatch(modifyHand(hand));
        }, 0);
      } else {
        dispatch(removeDumpSelections());
        dispatch(modifyHand(hand.concat([letter])));
        dispatch(removeTempLetterFromBoard({ row: boardRow, col: boardCol }));
      }
    }
  };
  if (permanentlyOnBoard)
    return (
      <div className={classNames("hand-tile", "hand-tile-permanent", points === 0 ? "zero-points" : "")}>
        {
          <span>
            {letter}
          </span>
        }
        <span className="score-in-tile">{points}</span>
      </div>
    );
  if (isInComputerHand)
    return (
      <div
        className={classNames(
          "hand-tile",
          "computer-tile",
          "look-3d",
          selected ? "slide-left" : ""
        )}
      >
        {selected && letter}
        {selected && (
          <span className="score-in-tile">{LETTER_TO_SCORE[letter]}</span>
        )}
      </div>
    );
  return (
    <Draggable onStop={onStop}>
      <div
        className={classNames(
          "hand-tile",
          selectedForDumpingHandIndices.includes(handIdx)
            ? "hand-tile-selected"
            : "",
          temporary ? "hand-tile-temporary" : "look-3d"
        )}
      >
        <div>{letter}</div>
        <span className="score-in-tile">{LETTER_TO_SCORE[letter]}</span>
      </div>
    </Draggable>
  );
};

export default Letter;
