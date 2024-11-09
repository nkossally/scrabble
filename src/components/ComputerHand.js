import { useSelector } from "react-redux";
import classNames from "classnames";
import Letter from "./Letter";

const ComputerHand = ({selectedTiles, invisibleLeft}) => {
  const computerHand = useSelector((state) => state.computerHand);

  return (
    <div className={classNames("computer-hand", invisibleLeft ? "invisible-left" : "")}>
      {computerHand.map((letter, i) => {
        return (
          <Letter
            letter={letter}
            selected={selectedTiles.includes(i)}
            key={`draggable-${i}.${letter}`}
            handIdx={i}
            isInComputerHand={true}
          />
        );
      })}
    </div>
  );
};

export default ComputerHand;
