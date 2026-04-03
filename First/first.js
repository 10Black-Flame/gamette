const box = document.getElementById('box');
const scoreElement = document.getElementById('score');
const timeElement = document.getElementById('time');
const highScoreElement = document.getElementById('high-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const gameOverDiv = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');

let score = 0;
let timeLeft = 30;
let gameActive = false;
let timerInterval;
let highScore = localStorage.getItem('highScore') || 0;

highScoreElement.textContent = highScore;

function moveBox() {
    const x = Math.random() * (window.innerWidth - box.offsetWidth);
    const y = Math.random() * (window.innerHeight - box.offsetHeight);
    box.style.left = x + 'px';
    box.style.top = y + 'px';
}

function updateScore() {
    score++;
    scoreElement.textContent = score;
}

function updateTime() {
    timeLeft--;
    timeElement.textContent = timeLeft;
    if (timeLeft <= 0) {
        endGame();
    }
}

function startGame() {
    score = 0;
    timeLeft = 30;
    gameActive = true;
    scoreElement.textContent = score;
    timeElement.textContent = timeLeft;
    startBtn.style.display = 'none';
    gameOverDiv.style.display = 'none';
    box.style.display = 'block';
    moveBox();
    timerInterval = setInterval(updateTime, 1000);
}

function endGame() {
    gameActive = false;
    clearInterval(timerInterval);
    box.style.display = 'none';
    gameOverDiv.style.display = 'block';
    finalScoreElement.textContent = score;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreElement.textContent = highScore;
    }
}

box.addEventListener('click', () => {
    if (gameActive) {
        updateScore();
        moveBox();
    }
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Initialize
box.style.display = 'none';