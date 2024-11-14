export const setUpGame = async () => {
  try {
    const resp = await fetch("/start");
    const json = await resp.json();
    return json;
  } catch {}
};

export const getComputerFirstMove = async () => {
  try {
    const resp = await fetch("/get-computer-first-move");
    const json = await resp.json();
    return json;
  } catch {}
};

export const getBestMove = async () => {
    try {
      const resp = await fetch("/get-best-move");
      const json = await resp.json();
      console.log("resp in fetch", json)
      return json;
    } catch {}
  };

  export const insertTilesInBackend = async (lettersAndCoordinates) => {
    console.log("insertTilesInBackend")
    try {
      const resp = await fetch("/insert-letters", {
        method: "POST",
        body: JSON.stringify({letters_and_coordinates: lettersAndCoordinates}),
        headers: {
          "Content-type": "application/json",
        },
      });
      const json = await resp.json();
      console.log("resp in fetch", json);
      return json;
    } catch {}
  };