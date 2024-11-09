import { useSelector } from "react-redux";
import classNames from "classnames";

const ScoreCard = () => {
  const score = useSelector((state) => state.score);
  const computerScore = useSelector((state) => state.computerScore);
  const lettersLeftCount = useSelector((state) => state.lettersLeft.length);

  return (
    <div className={classNames("score-card", "look-3d")}>
      <div>Player Score: &nbsp; {score}</div>
    
      <div >Computer Score:&nbsp; {computerScore}</div>
      <div >Letters In Bag: &nbsp; {lettersLeftCount}</div>
    </div>
  );
};

export default ScoreCard;
