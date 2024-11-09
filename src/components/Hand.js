import { useSelector } from "react-redux";
import Letter from "./Letter";

const Hand = () => {
  const hand = useSelector((state) => state.hand);

  return (
    <div className="hand">
      {hand.map((letter, i) => {
        return (
          <Letter
            letter={letter}
            // Add a random number to the key in order to prevent a glitch.
            // Without the random number, when a tile is dragged and dropped, 
            // another tile with the same letter is also moved.
            key={`draggable-${i}.${letter}.${Math.random()}`}
            handIdx={i}
            isInHand={true}
          />
        );
      })}
    </div>
  );
};

export default Hand;
