// Get references to score and timer elements
const scoreSpan = document.getElementById('score');
const totalScoreSpan = document.getElementById('total-score');
const timerSpan = document.getElementById('timer');
const gameOverMessage = document.getElementById('game-over-message');

// Set initial scores and time
let score = 0; // in-game score
let totalScore = 0; // total score (across games)
let time = 0; // seconds (set to 0 on load)
let timerInterval = null;

// Read total score from localStorage on page load
if (localStorage.getItem('totalScore')) {
  totalScore = parseInt(localStorage.getItem('totalScore')) || 0;
}

// Function to update the in-game score display
function updateScore(newScore) {
  score = newScore;
  scoreSpan.textContent = `Score: ${score}`;
}

// Function to update the total score display
function updateTotalScore(newTotal) {
  // Prevent negative total score
  totalScore = Math.max(0, newTotal);
  totalScoreSpan.textContent = `Total: ${totalScore}`;
  localStorage.setItem('totalScore', totalScore);
}

// Function to update the timer display
function updateTimer(newTime) {
  time = newTime;
  timerSpan.textContent = `Time: ${time}`;
}

// Helper to stop and clear the timer interval
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// Function to start the timer countdown
function startTimer() {
  // Clear any existing timer
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  timerInterval = setInterval(() => {
    if (time > 0) {
      updateTimer(time - 1);
    } else {
      clearInterval(timerInterval);
      // You can add game over logic here
    }
  }, 1000);
}


// Difficulty button event listeners and game settings
const easyBtn = document.getElementById('easy-btn');
const mediumBtn = document.getElementById('medium-btn');
const hardBtn = document.getElementById('hard-btn');
const gameControls = document.getElementById('game-controls');
const resetBtn = document.getElementById('reset-btn');

// Game settings for each difficulty
const difficulties = {
  easy: {
    time: 30,
    dropFreq: 1200,
    rockFreq: 1500,
    waveFreq: 6000,
    shieldFreq: 9000,
    dropScore: 1,
    rockPenalty: -2,
    waveScore: 10,
    shieldProtect: 1
  },
  medium: {
    time: 60,
    dropFreq: 900,
    rockFreq: 1100,
    waveFreq: 5000,
    shieldFreq: 8000,
    dropScore: 2,
    rockPenalty: -4,
    waveScore: 20,
    shieldProtect: 1
  },
  hard: {
    time: 90,
    dropFreq: 600,
    rockFreq: 800,
    waveFreq: 3500,
    shieldFreq: 6000,
    dropScore: 3,
    rockPenalty: -8,
    waveScore: 30,
    shieldProtect: 1
  }
};

let currentSettings = difficulties.easy;
let shieldActive = false;
let elementIntervals = [];

// Game element speed for each difficulty (pixels per frame)
// Increased speeds for more challenge
const GAME_ELEMENT_SPEEDS = {
  easy: 4,
  medium: 6,
  hard: 8
};
let currentElementSpeed = GAME_ELEMENT_SPEEDS.easy;

function hideButtons() {
  gameControls.style.display = 'none';
}
function showButtons() {
  gameControls.style.display = 'flex';
}

function startGameWithDifficulty(diff) {
  // Set settings
  currentSettings = difficulties[diff];
  currentElementSpeed = GAME_ELEMENT_SPEEDS[diff];
  updateScore(0); // Reset in-game score at the start of a new game
  updateTimer(currentSettings.time); // Reset timer to starting value
  shieldActive = false;
  startJerryCanFollow();
  hideButtons();
  clearGameElements();
  startSpawningElements();
  startTimer();
  resetBtn.style.display = 'block'; // Show reset button during game
  // Disable difficulty buttons during the game
  easyBtn.disabled = true;
  mediumBtn.disabled = true;
  hardBtn.disabled = true;
  // Hide game over message
  gameOverMessage.style.display = 'none';
}

easyBtn.addEventListener('click', () => startGameWithDifficulty('easy'));
mediumBtn.addEventListener('click', () => startGameWithDifficulty('medium'));
hardBtn.addEventListener('click', () => startGameWithDifficulty('hard'));

// Charity: water button event listener
const charityBtn = document.getElementById('charitywater-btn');
charityBtn.addEventListener('click', () => {
  // Open charity: water website in a new tab
  window.open('https://www.charitywater.org/', '_blank');
});


// Jerry Can logic
const jerryCan = document.getElementById('jerrycan');
const gameArea = document.getElementById('game-area');
let gameStarted = false;

// Function to show and enable the Jerry Can following the pointer
function startJerryCanFollow() {
  jerryCan.style.display = 'block';
  gameStarted = true;
}

// Function to hide the Jerry Can
function stopJerryCanFollow() {
  jerryCan.style.display = 'none';
  jerryCan.classList.remove('shielded');
  gameStarted = false;
}

// Move Jerry Can to follow mouse (desktop)
gameArea.addEventListener('mousemove', (event) => {
  if (!gameStarted) return;
  // Get mouse position relative to game area
  const rect = gameArea.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  // Offset so the can is centered on the pointer
  jerryCan.style.left = `${x - jerryCan.width / 2}px`;
  jerryCan.style.top = `${y - jerryCan.height / 2}px`;
});

// Move Jerry Can to follow touch (mobile)
gameArea.addEventListener('touchmove', (event) => {
  if (!gameStarted) return;
  // Prevent scrolling
  event.preventDefault();
  const rect = gameArea.getBoundingClientRect();
  const touch = event.touches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  jerryCan.style.left = `${x - jerryCan.width / 2}px`;
  jerryCan.style.top = `${y - jerryCan.height / 2}px`;
}, { passive: false });

// Start the game (show Jerry Can) when a difficulty is chosen
function startGame() {
  updateScore(0);
  startJerryCanFollow();
}

easyBtn.addEventListener('click', startGame);
mediumBtn.addEventListener('click', startGame);
hardBtn.addEventListener('click', startGame);


// Remove all game elements and stop intervals
function clearGameElements() {
  document.querySelectorAll('.game-element').forEach(el => el.remove());
  elementIntervals.forEach(id => clearInterval(id));
  elementIntervals = [];
}

// Game over: stop can, show buttons, clear elements
function gameOver() {
  stopJerryCanFollow();
  showButtons();
  clearGameElements();
  resetBtn.style.display = 'none'; // Hide reset button when game ends
  // Add in-game score to total, reset in-game score, and save total
  updateTotalScore(totalScore + score);
  // Show game over message
  gameOverMessage.textContent = `Game Over! Your score this round: ${score}`;
  gameOverMessage.style.display = 'block';
  // Show confetti effect
  showConfetti();
  // Re-enable difficulty buttons
  easyBtn.disabled = false;
  mediumBtn.disabled = false;
  hardBtn.disabled = false;
}

// --- Confetti effect for game over ---
function showConfetti() {
  // Remove any existing confetti
  const old = document.getElementById('confetti-container');
  if (old) old.remove();
  // Create a container for confetti
  const confettiContainer = document.createElement('div');
  confettiContainer.id = 'confetti-container';
  confettiContainer.style.position = 'fixed';
  confettiContainer.style.left = '0';
  confettiContainer.style.top = '0';
  confettiContainer.style.width = '100vw';
  confettiContainer.style.height = '100vh';
  confettiContainer.style.pointerEvents = 'none';
  confettiContainer.style.zIndex = '9999';
  document.body.appendChild(confettiContainer);

  // Simple confetti: create 60 colored circles that fall and fade
  const colors = ['#FFC907', '#2E9DF7', '#8BD1CB', '#4FCB53', '#FF902A', '#F5402C', '#F16061'];
  for (let i = 0; i < 60; i++) {
    const conf = document.createElement('div');
    const size = Math.random() * 12 + 8;
    conf.style.position = 'absolute';
    conf.style.left = `${Math.random() * 100}vw`;
    conf.style.top = `${Math.random() * 10 + 10}vh`;
    conf.style.width = `${size}px`;
    conf.style.height = `${size}px`;
    conf.style.borderRadius = '50%';
    conf.style.background = colors[Math.floor(Math.random() * colors.length)];
    conf.style.opacity = '0.85';
    conf.style.transition = 'transform 1.6s cubic-bezier(.4,1.4,.6,1), opacity 1.6s';
    confettiContainer.appendChild(conf);
    // Animate falling and fading
    setTimeout(() => {
      conf.style.transform = `translateY(${60 + Math.random() * 30}vh) rotate(${Math.random() * 360}deg)`;
      conf.style.opacity = '0';
    }, 30 + Math.random() * 200);
  }
  // Remove confetti after animation
  setTimeout(() => {
    confettiContainer.remove();
  }, 1800);
}

// Timer with game over
function startTimer() {
  stopTimer(); // Always clear any existing timer
  timerInterval = setInterval(() => {
    if (time > 0) {
      updateTimer(time - 1);
    } else {
      stopTimer();
      gameOver();
    }
  }, 1000);
}

// --- Game Elements ---


// Helper to check if a new element overlaps with existing ones
function isOverlapping(newTop) {
  const elements = document.querySelectorAll('.game-element');
  for (let el of elements) {
    const top = parseFloat(el.style.top);
    if (Math.abs(top - newTop) < 52) { // 48px element + 4px buffer
      return true;
    }
  }
  return false;
}

// Helper to create a game element (no overlap)
function createGameElement(type, imgSrc) {
  const el = document.createElement('img');
  el.src = imgSrc;
  el.className = 'game-element';
  el.dataset.type = type;
  // Start at right edge, random vertical position, avoid overlap
  let tries = 0;
  let top;
  do {
    top = Math.random() * (gameArea.offsetHeight - 48);
    tries++;
  } while (isOverlapping(top) && tries < 10);
  el.style.left = `${gameArea.offsetWidth}px`;
  el.style.top = `${top}px`;
  gameArea.appendChild(el);
  return el;
}

// Move element left, check collision, remove if out or hit
function animateElement(el, onCollide) {
  function step() {
    if (!el.parentNode) return;
    let left = parseFloat(el.style.left);
    left -= currentElementSpeed;
    el.style.left = `${left}px`;
    // Remove if out of bounds
    if (left < -48) {
      el.remove();
      return;
    }
    // Check collision with Jerry Can
    if (checkCollision(el, jerryCan)) {
      onCollide(el);
      el.remove();
      return;
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Collision detection (simple box)
function checkCollision(a, b) {
  const aRect = a.getBoundingClientRect();
  const bRect = b.getBoundingClientRect();
  return !(
    aRect.right < bRect.left ||
    aRect.left > bRect.right ||
    aRect.bottom < bRect.top ||
    aRect.top > bRect.bottom
  );
}

// Spawning logic
function startSpawningElements() {
  // Water Drop
  const dropInt = setInterval(() => {
    if (!gameStarted) return;
    const el = createGameElement('drop', document.getElementById('img-drop').src);
    animateElement(el, () => {
      updateScore(score + currentSettings.dropScore);
    });
  }, currentSettings.dropFreq);
  elementIntervals.push(dropInt);

  // Rock
  const rockInt = setInterval(() => {
    if (!gameStarted) return;
    const el = createGameElement('rock', document.getElementById('img-rock').src);
    animateElement(el, () => {
      if (shieldActive) {
        shieldActive = false;
        jerryCan.classList.remove('shielded');
      } else {
        updateScore(score + currentSettings.rockPenalty);
      }
    });
  }, currentSettings.rockFreq);
  elementIntervals.push(rockInt);

  // Water Wave
  const waveInt = setInterval(() => {
    if (!gameStarted) return;
    const el = createGameElement('wave', document.getElementById('img-wave').src);
    animateElement(el, () => {
      updateScore(score + currentSettings.waveScore);
    });
  }, currentSettings.waveFreq);
  elementIntervals.push(waveInt);

  // Shield
  const shieldInt = setInterval(() => {
    if (!gameStarted) return;
    if (shieldActive) return; // Only one shield at a time
    const el = createGameElement('shield', document.getElementById('img-shield').src);
    animateElement(el, () => {
      shieldActive = true;
      jerryCan.classList.add('shielded');
    });
  }, currentSettings.shieldFreq);
  elementIntervals.push(shieldInt);
}

// Initialize the display
updateScore(score);

updateTotalScore(totalScore);
// On page load, always stop and reset the timer to 0
stopTimer();
updateTimer(0);
// Hide reset button on page load
resetBtn.style.display = 'none';

// Reset button logic
resetBtn.addEventListener('click', () => {
  // End the game early, but do NOT add in-game score to total
  stopJerryCanFollow();
  showButtons();
  clearGameElements();
  resetBtn.style.display = 'none';
  updateScore(0); // Reset in-game score only
  stopTimer(); // Stop the timer
  updateTimer(0); // Set timer to 0
  // Re-enable difficulty buttons so user can start a new game
  easyBtn.disabled = false;
  mediumBtn.disabled = false;
  hardBtn.disabled = false;
});

// Accessibility: add aria-labels to buttons
// (Beginner-friendly: this can be at the end of the file)
easyBtn.setAttribute('aria-label', 'Start Easy Game');
mediumBtn.setAttribute('aria-label', 'Start Medium Game');
hardBtn.setAttribute('aria-label', 'Start Hard Game');
resetBtn.setAttribute('aria-label', 'Reset Game');
charityBtn.setAttribute('aria-label', 'Visit charity: water website');
