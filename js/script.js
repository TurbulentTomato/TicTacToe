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

const player1 = createPlayer("Player1", "X", true);
const player2 = createPlayer("Player2", "O");
const Game = (function() {
  let activePlayer = player1;
  let ended = false;
  let matchWon = false;
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
  const checkResult = (playedIndices) => {
    //checks if the played moves match with any winning pattern
    if (playedIndices.length > 2) {
      outer: for (const pattern of winningPatterns) {
        for (const digit of pattern) {
          if (!playedIndices.includes(Number(digit))) {
            continue outer; /*if a digit from a winning pattern is missing
          from playedIndices, it goes on to check for next winning pattern*/
          }
        }
        toggleEnded();
        matchWon = true;
      }
    }
    if (Gameboard.getIndicesFilled() === 9 && !matchWon) {
      toggleEnded();
    }
    console.log(getResult())
  };
  const getResult = () => {
    if (!ended) {
      return `${activePlayer === player1 ? player2.getPlayerName() : player1.getPlayerName()}'s Turn`;
    } else if (matchWon) {
      return `${activePlayer.getPlayerName()} Wins!!!`
    } else {
      return "Its a Tie!!!"
    }
  }
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
    checkResult(playedIndices);
    Events.trigger("toggleTurn");
    console.log(Gameboard.getBoard());
  };
  const setActivePlayer = () => {
    activePlayer = (player1.getPlayerTurn()) ? player1 : player2;
  };
  /* const getActivePlayerProperty = (property) => {
     if (typeof activePlayer[property] === "function") {
       return activePlayer[property]();
     }
     return activePlayer[property];
   }*/
  return { checkMove, logError, checkResult, toggleEnded, getEnded, reset, playMove, getResult };
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
  const commentEl = document.querySelector(".comment-el");
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
  const renderToken = (event, index) => {
    /*event.target.textContent = Game.getActivePlayerProperty("getPlayerToken");*/
    event.target.textContent = Gameboard.getBoard()[index];
  }
  const updateComment = () => {
    commentEl.textContent = Game.getResult();
  }
  const bindEvents = () => {
    boardContainer.addEventListener("click", (event) => {
      if (!Game.getEnded() && Game.checkMove(event.target.dataset["index"])) {
        Game.playMove(Number(event.target.dataset["index"]));
        renderToken(event, Number(event.target.dataset["index"]));
        updateComment();
      }
    });
  }
  return { createBoard, bindEvents };
})();

DomHandler.createBoard();
DomHandler.bindEvents();

