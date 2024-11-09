import { render, screen } from "@testing-library/react";
import App from "./App";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import { createEmptyBoard } from "./reducers/reducersUtil";

test("renders buttons correctly", () => {
  const mockStore = configureStore([]);

  const initialState = {
    boardValues: createEmptyBoard(),
    tempBoardValues: createEmptyBoard(),
    hand: [],
    computerHand: [],
    lettersLeft: [],
    score: 0,
    computerScore: 0,
    isComputersTurn: false,
    selectedForDumpingHandIndices: [],
  };
  const store = mockStore(initialState);

  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  const newGameButton = screen.getByText(/new game/i);
  const dumpButton = screen.getByText(/dump/i);

  expect(newGameButton).toBeInTheDocument();
  expect(dumpButton).toBeInTheDocument();
});
