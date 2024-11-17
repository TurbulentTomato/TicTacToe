const Gameboard = (function() {
  const gameboard = [];
  const add = (move) => {
    gameboard.push(move);
  };
  const getBoard = () => {
    return [...gameboard];
  };
  return { add, getBoard };
})();

function createPlayer(playerName, playerToken) {
  const name = playerName;
  const token = playerToken;
  const moves = [];//stores the indices where player has played
  const play = () => {
    Gameboard.add(token);
    console.log(Gameboard.getBoard());
  };
  return { play };
}

const player1 = createPlayer("P1", "X");
const player2 = createPlayer("P2", "O");

