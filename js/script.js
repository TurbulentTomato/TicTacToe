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

const player1 = createPlayer("P1", "X", true);
const player2 = createPlayer("P2", "O");
const Game = (function() {
  let activePlayer = player1;
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
  const playMove = (index) => {
    setActivePlayer();
    if (Game.getEnded()) {
      console.log("Game has already ended");
      return;
    }
    if (!Game.checkMove(index)) {
      return;
    }
    Gameboard.add(activePlayer.getPlayerToken(), index);
    Events.trigger("setPlayedIndices", index);
    let playedIndices = activePlayer.getPlayedIndices();
    if (playedIndices.length > 2) {
      Game.getResult(...[playedIndices], activePlayer.getPlayerName());
    }
    Events.trigger("toggleTurn");
    console.log(Gameboard.getBoard());
  };
  const setActivePlayer = () => {
    activePlayer = (player1.getPlayerTurn()) ? player1 : player2;
  };
  const getActivePlayerProperty = (property) => {
    return activePlayer[property];
  }
  return { checkMove, logError, getResult, toggleEnded, getEnded, reset, playMove, getActivePlayerProperty };
})();

function createPlayer(playerName, playerToken, playerTurn = false) {
  const playedIndices = []; //stores the indices where player has played
  const toggleTurn = () => {
    playerTurn = !playerTurn;
  }
  const reset = () => {
    playedIndices.splice(0)
  }
  const getPlayerTurn = () => {
    return playerTurn;
  }
  const getPlayerToken = () => {
    return playerToken;
  }
  const getPlayedIndices = () => {
    return [...playedIndices]
  }
  const setPlayedIndices = (index) => {
    if (playerTurn) {
      playedIndices.push(index)
    }
  }
  const getPlayerName = () => {
    return playerName;
  }
  Events.subscribe("gameReset", reset);
  Events.subscribe("toggleTurn", toggleTurn);
  Events.subscribe("setPlayedIndices", setPlayedIndices)
  return { getPlayerTurn, getPlayerToken, getPlayedIndices, getPlayerName };
}

const DomHandler = (function() {
  const boardContainer = document.querySelector(".board-container");
  const createBoard = () => {
    let i = 0;
    let board = "";
    while (i < 9) {
      board += `<div class="cell" data-index="${i}"> </div>`;
      i++;
    }
    renderBoard(board);
  }
  const renderBoard = (board) => {
    boardContainer.innerHTML = board;
  }
  const bindEvents = () => {
    boardContainer.addEventListener("click", (event) => {
      console.log(`Hello from ${event.target.dataset["index"]}`)
    });
  }
  return { createBoard, bindEvents };
})();

DomHandler.createBoard();
DomHandler.bindEvents();

