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

export const getComputerFirstMove = async () => {
  try {
    const resp = await fetch(API_URL+"/get-computer-first-move");
    const json = await resp.json();
    return json;
  } catch {}
};

export const getBestMove = async () => {
    try {
      const resp = await fetch(API_URL+"/get-best-move");
      const json = await resp.json();
      console.log("resp in fetch", json)
      return json;
    } catch {}
  };

  export const insertTilesInBackend = async (lettersAndCoordinates) => {
    console.log("insertTilesInBackend")
    try {
      const resp = await fetch(API_URL+"/insert-letters", {
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

  export const dumpLetters = async (letters) => {
    try {
      const resp = await fetch(API_URL+"/dump-letters", {
        method: "POST",
        body: JSON.stringify({letters}),
        headers: {
          "Content-type": "application/json",
        },
      });
      const json = await resp.json();
      console.log("resp in fetch", json);
      return json;
    } catch {}
  };

  export const testSetDawg = async (letters) => {
    try {
      const resp = await fetch(API_URL+"/test-set-redis-data");
      const json = await resp.json();
      console.log("resp in fetch", json);
      return json;
    } catch {}
  };

  export const testGetDawg = async (letters) => {
    try {
      const resp = await fetch(API_URL+"/test-get-redis-data");
      const json = await resp.json();
      console.log("resp in fetch", json);
      return json;
    } catch {}
  };