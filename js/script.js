const Gameboard = (function() {
  const gameboard = [];
  const add = (move, index) => {
    gameboard[index] = move;
  };
  const getBoard = () => {
    return [...gameboard];
  };
  return { add, getBoard };
})();

const Game = (function() {
  const winningPatterns =
    ["012", "345", "678", "036",
      "147", "258", "048", "246"];
  const checkMove = (index) => {
    console.log("checking")
    if (Gameboard.getBoard()[index] !== undefined) {
      logError();
      return false; //denotes inavlid move
    }
    return true; //denotes valid move
  };
  const logError = () => {
    console.log("Invalid move, space already occupied");
  }
  return { checkMove, logError };
})();

function createPlayer(playerName, playerToken) {
  const name = playerName;
  const token = playerToken;
  const moves = [];//stores the indices where player has played
  const { checkMove } = Game;
  const play = (index) => {
    if (!checkMove(index)) {
      return;
    }
    Gameboard.add(token, index);
    console.log(Gameboard.getBoard());
  };
  return { play };
}

const player1 = createPlayer("P1", "X");
const player2 = createPlayer("P2", "O");

