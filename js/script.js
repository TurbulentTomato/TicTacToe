const Gameboard = (function() {
  const gameboard = [];
  const add = (token, index) => {
    gameboard[index] = token;
  };
  const getBoard = () => {
    return [...gameboard];
  };
  const getIndicesFilled = () => {
    return gameboard.filter(item => item !== undefined).length;
  };
  const reset = () => {
    gameboard.splice(0);
  };
  Events.subscribe("gameReset", reset)
  return { add, getBoard, getIndicesFilled };
})();

const Game = (function() {
  let ended = false;
  const winningPatterns =
    ["012", "345", "678", "036",
      "147", "258", "048", "246"];
  const checkMove = (index) => {
    if (Gameboard.getBoard()[index] !== undefined || index > 8) {
      logError();
      return false; //denotes inavlid move
    }
    return true; //denotes valid move
  };
  const logError = () => {
    console.log("Invalid move, index cannot be greater than 8 and should not be preoccupied!!");
  };
  const getResult = (playedIndices, playerName) => {
    //checks if the played moves match with any winning pattern
    outer: for (const pattern of winningPatterns) {
      for (const digit of pattern) {
        if (!playedIndices.includes(Number(digit))) {
          continue outer; /*if a digit from a winning pattern is missing
          from playedIndices, it goes on to check for next winning pattern*/
        }
      }
      console.log(`${playerName} is Winner`)
      toggleEnded();
      return;
    }
    if (Gameboard.getIndicesFilled() === 9) {
      console.log("Tie!!!");
      toggleEnded();
      return;
    }
  };
  const toggleEnded = () => {
    ended = !ended;
    console.log(ended);
  };
  const getEnded = () => {
    return ended;
  };
  const reset = () => {
    ended = false;
    Events.trigger("gameReset");
  };
  return { checkMove, logError, getResult, toggleEnded, getEnded, reset };
})();

function createPlayer(playerName, playerToken) {
  const name = playerName;
  const token = playerToken;
  const playedIndices = []; //stores the indices where player has played
  const play = (index) => {
    if (Game.getEnded()) {
      console.log("Game has already ended");
      return;
    }
    if (!Game.checkMove(index)) {
      return;
    }
    Gameboard.add(token, index);
    playedIndices.push(index);
    if (playedIndices.length > 2) {
      Game.getResult(...[playedIndices], name);
    }
    console.log(Gameboard.getBoard());
  };
  const reset = () => {
    playedIndices.splice(0)
  };
  Events.subscribe("gameReset", reset)
  return { play };
}

const player1 = createPlayer("P1", "X");
const player2 = createPlayer("P2", "O");

