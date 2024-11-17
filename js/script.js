const Gameboard = (function() {
  const gameboard = [];
  const add = (move) => {
    gameboard.push(move);
  }
  return { add };
})();

function createPlayer(playerName, playerToken) {
  const name = playerName;
  const token = playerToken;
  const moves = [];
  const play = () => {
    Gameboard.add(token)
  }
  return { play }
}


