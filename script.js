const state = {
  userScore: 0,
  computerScore: 0,
  innings: 1,
  turn: "toss",
  target: null,
  matchOver: false,
};

const userScore = document.querySelector("#user-score");
const computerScore = document.querySelector("#computer-score");
const targetLabel = document.querySelector("#target-label");
const phaseBadge = document.querySelector("#phase-badge");
const status = document.querySelector("#status");
const lastPlay = document.querySelector("#last-play");
const tossControls = document.querySelector("#toss-controls");
const choiceControls = document.querySelector("#choice-controls");
const numberControls = document.querySelector("#number-controls");
const tossButtons = [...document.querySelectorAll("[data-toss]")];
const choiceButtons = [...document.querySelectorAll("[data-choice]")];
const numberButtons = [...document.querySelectorAll("[data-number]")];

document.querySelector("#new-match").addEventListener("click", resetGame);
tossButtons.forEach((button) => button.addEventListener("click", () => startToss(button.dataset.toss)));
choiceButtons.forEach((button) => button.addEventListener("click", () => chooseFirstInnings(button.dataset.choice)));
numberButtons.forEach((button) => button.addEventListener("click", () => playBall(Number(button.dataset.number))));

function setButtons(buttons, enabled) {
  buttons.forEach((button) => { button.disabled = !enabled; });
}

function setVisible(element, visible) {
  element.classList.toggle("hidden", !visible);
}

function secureRandomInt(maxExclusive) {
  if (window.crypto && window.crypto.getRandomValues) {
    const values = new Uint32Array(1);
    const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive;
    do {
      window.crypto.getRandomValues(values);
    } while (values[0] >= limit);
    return values[0] % maxExclusive;
  }
  return Math.floor(Math.random() * maxExclusive);
}

function updateScoreboard() {
  userScore.textContent = state.userScore;
  computerScore.textContent = state.computerScore;
  phaseBadge.textContent = state.innings === 1 ? "INNINGS 1" : "INNINGS 2";

  if (state.target === null) {
    targetLabel.textContent = `Innings ${state.innings} of 2`;
    return;
  }

  const chasingUser = state.turn === "user_batting";
  const score = chasingUser ? state.userScore : state.computerScore;
  const chasing = chasingUser ? "You" : "Computer";
  targetLabel.textContent = `${chasing} need ${Math.max(0, state.target - score)} more to win`;
}

function resetGame() {
  Object.assign(state, { userScore: 0, computerScore: 0, innings: 1, turn: "toss", target: null, matchOver: false });
  status.textContent = "Choose heads or tails to begin the toss.";
  lastPlay.textContent = "No ball played yet";
  setVisible(tossControls, true);
  setVisible(choiceControls, false);
  setVisible(numberControls, false);
  setButtons(tossButtons, true);
  setButtons(choiceButtons, false);
  setButtons(numberButtons, false);
  updateScoreboard();
}

function startToss(guess) {
  const result = secureRandomInt(2) === 0 ? "heads" : "tails";
  setButtons(tossButtons, false);

  if (guess === result) {
    state.turn = "choose_turn";
    status.textContent = `Coin: ${result}. You won the toss. Choose your innings.`;
    setVisible(choiceControls, true);
    setButtons(choiceButtons, true);
    return;
  }

  const computerChoice = secureRandomInt(2) === 0 ? "bat" : "bowl";
  status.textContent = `Coin: ${result}. Computer won and chose to ${computerChoice} first.`;
  beginInnings(computerChoice === "bowl");
}

function chooseFirstInnings(choice) {
  setButtons(choiceButtons, false);
  beginInnings(choice === "bat");
}

function beginInnings(userBats) {
  state.innings = 1;
  state.target = null;
  state.turn = userBats ? "user_batting" : "user_bowling";
  status.textContent = `You are ${userBats ? "batting" : "bowling"} first. Choose a number from 1 to 10.`;
  setVisible(choiceControls, false);
  setVisible(numberControls, true);
  setButtons(numberButtons, true);
  updateScoreboard();
}

function playBall(userChoice) {
  if (state.matchOver || !["user_batting", "user_bowling"].includes(state.turn)) return;

  const computerChoice = secureRandomInt(10) + 1;
  lastPlay.textContent = `You: ${userChoice}    vs    Computer: ${computerChoice}`;

  if (userChoice === computerChoice) {
    setButtons(numberButtons, false);
    status.textContent = state.turn === "user_batting" ? "OUT! Both chose the same number." : "WICKET! You caught the computer.";
    window.setTimeout(finishInnings, 650);
    return;
  }

  if (state.turn === "user_batting") {
    state.userScore += userChoice;
    status.textContent = `You scored ${userChoice} run${userChoice === 1 ? "" : "s"}.`;
  } else {
    state.computerScore += computerChoice;
    status.textContent = `Computer scored ${computerChoice} run${computerChoice === 1 ? "" : "s"}.`;
  }

  updateScoreboard();
  const currentScore = state.turn === "user_batting" ? state.userScore : state.computerScore;
  if (state.target !== null && currentScore >= state.target) {
    setButtons(numberButtons, false);
    window.setTimeout(finishMatch, 500);
  }
}

function finishInnings() {
  if (state.innings === 1) {
    state.innings = 2;
    state.target = (state.turn === "user_batting" ? state.userScore : state.computerScore) + 1;
    state.turn = state.turn === "user_batting" ? "user_bowling" : "user_batting";
    const role = state.turn === "user_batting" ? "batting" : "bowling";
    status.textContent = `Innings 2: you are ${role}. Target: ${state.target}.`;
    setButtons(numberButtons, true);
    updateScoreboard();
    return;
  }

  finishMatch();
}

function finishMatch() {
  state.matchOver = true;
  setButtons(numberButtons, false);
  updateScoreboard();
  const result = state.userScore > state.computerScore ? "You win!" : state.computerScore > state.userScore ? "Computer wins!" : "It's a tie!";
  status.textContent = `${result} Final score: You ${state.userScore} - Computer ${state.computerScore}.`;
}

resetGame();
