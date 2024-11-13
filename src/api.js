export const setUpGame = async () =>{
    try{
        const resp = await fetch("/start");
        const json = await resp.json()
        return json
    } catch {

    }
}

export const getComputerFirstMove = async () =>{
    try{
        const resp = await fetch("/get-computer-first-move");
        const json = await resp.json()
        return json
    } catch {

    }
}

