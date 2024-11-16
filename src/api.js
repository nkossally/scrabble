// const API_URL = "https://scrabble-backend.vercel.app"
// const API_URL = "https://scrabble-backend-xwj2.vercel.app/"
const API_URL = ""

export const setUpGame = async () => {
  try {
    const resp = await fetch(API_URL+"/start");
    const json = await resp.json();
    return json;
  } catch {}
};

export const getComputerFirstMove = async (key) => {
  try {
    const resp = await fetch(`${API_URL}/get-computer-first-move?key=${key}`);
    const json = await resp.json();
    return json;
  } catch {}
};

export const getBestMove = async (key) => {
    try {
      const resp = await fetch(`${API_URL}/get-best-move`);
      const json = await resp.json();
      console.log("resp in fetch", json)
      return json;
    } catch {}
  };

  export const insertTilesInBackend = async (lettersAndCoordinates, key) => {
    console.log("insertTilesInBackend")
    try {
      const resp = await fetch(API_URL+"/insert-letters", {
        method: "POST",
        body: JSON.stringify({letters_and_coordinates: lettersAndCoordinates, key}),
        headers: {
          "Content-type": "application/json",
        },
      });
      const json = await resp.json();
      console.log("resp in fetch", json);
      return json;
    } catch {}
  };

  export const dumpLetters = async (letters, key) => {
    try {
      const resp = await fetch(API_URL+"/dump-letters", {
        method: "POST",
        body: JSON.stringify({letters, key}),
        headers: {
          "Content-type": "application/json",
        },
      });
      const json = await resp.json();
      console.log("resp in fetch", json);
      return json;
    } catch {}
  };
