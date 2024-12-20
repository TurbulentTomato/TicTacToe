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
  Events.subscribe("restart", reset)
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
        activePlayer.increaseScore();
        DomHandler.updateScore(activePlayer.getPlayerName(), activePlayer.getPlayerScore())
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
    matchWon = false;
    Events.trigger("gameReset");
    DomHandler.updateScore();
  };
  const restart = () => {
    ended = false;
    matchWon = false;
  }
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
    activePlayer.setPlayedIndices(index);
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
  Events.subscribe("restart", restart)
  return { checkMove, logError, checkResult, toggleEnded, getEnded, reset, playMove, getResult };
})();

function createPlayer(playerName, playerToken, playerTurn = false) {
  const playedIndices = []; //stores the indices where player has played
  let score = 0;
  const toggleTurn = () => {
    playerTurn = !playerTurn;
  }
  const reset = () => {
    playedIndices.splice(0);
    score = 0;
  }
  const restart = () => {
    playedIndices.splice(0);
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
  const setPlayerName = (newName) => {
    playerName = newName;
  }
  const getPlayerScore = () => {
    return score;
  }
  const increaseScore = () => {
    if (playerTurn) {
      score++;
    }
  }
  Events.subscribe("gameReset", reset);
  Events.subscribe("toggleTurn", toggleTurn);
  Events.subscribe("restart", restart)
  return { getPlayerTurn, getPlayerToken, getPlayedIndices, getPlayerName, getPlayerScore, increaseScore, setPlayedIndices, setPlayerName };
}

const DomHandler = (function() {
  const boardContainer = document.querySelector(".board-container");
  const commentEl = document.querySelector(".comment-el");
  const playerScoreEl = Array.from(document.querySelectorAll(".name+span"));
  const restartBtn = document.querySelector(".restart-btn");
  const resetBtn = document.querySelector(".reset-btn");
  const settingsBtn = document.querySelector(".settings-btn");
  const settingsModal = document.querySelector(".settings");
  const submitBtn = document.querySelector(".submit-btn");
  const p1NameInput = document.querySelector("#p1-name-input");
  const p2NameInput = document.querySelector("#p2-name-input");
  const p1NameEl = document.querySelector(".p1 .name");
  const p2NameEl = document.querySelector(".p2 .name");
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
  const updateScore = (playerName = null, score) => {
    if (!playerName) {
      playerScoreEl[0].textContent = 0;
      playerScoreEl[1].textContent = 0;
      return;
    }
    if (playerName === document.querySelector(".name").textContent) {
      playerScoreEl[0].textContent = score;
      return;
    }
    playerScoreEl[1].textContent = score;
  }
  const clearNameInputs = () => {
    p1NameInput.value = "";
    p2NameInput.value = "";
  }
  const updateNames = () => {
    if (p1NameInput.value === p2NameInput.value && p1NameInput.value !== "" || player1.getPlayerName() === p2NameInput.value || player2.getPlayerName() === p1NameInput.value) {
      alert("Both Players cannot have same name (you can change the case of letter(s))");
      return;
    }
    if (p1NameInput.value) {
      player1.setPlayerName(p1NameInput.value);
      p1NameEl.textContent = p1NameInput.value;
    }
    if (p2NameInput.value) {
      player2.setPlayerName(p2NameInput.value);
      p2NameEl.textContent = p2NameInput.value;
    }
  }
  const submitForm = (event) => {
    event.preventDefault();
    updateNames();
    clearNameInputs();
    settingsModal.close();
  }
  const changeCellColor = (cell) => {
    if (player1.getPlayerTurn()) {
      cell.classList.toggle("p2-clicked")
      cell.style.boxShadow = "0px 0px 10px 2px #14f7ff";
    } else {
      cell.classList.toggle("p1-clicked")
      cell.style.boxShadow = "0px 0px 10px 3px rgb(0, 255, 0)";
    }
  }
  const restart = () => {
    if (Gameboard.getIndicesFilled() > 0 &&
      !Game.getEnded() &&
      (!confirm("Are you sure you want to restart without finishing current game?"))) {
      return;
    }
    createBoard();
    Events.trigger("restart");
    updateComment();
  }
  const reset = () => {
    Game.reset();
    createBoard();
    updateComment();
  }
  const bindEvents = () => {
    boardContainer.addEventListener("click", (event) => {
      if (!Game.getEnded() && Game.checkMove(event.target.dataset["index"])) {
        Game.playMove(Number(event.target.dataset["index"]));
        renderToken(event, Number(event.target.dataset["index"]));
        updateComment();
        changeCellColor(event.target);
      }
    })
    restartBtn.addEventListener("click", restart)
    resetBtn.addEventListener("click", reset)
    settingsBtn.addEventListener("click", () => {
      settingsModal.showModal();
    });
    submitBtn.addEventListener("click", submitForm);
  }
  return { createBoard, bindEvents, updateScore };
})();

DomHandler.createBoard();
DomHandler.bindEvents();

