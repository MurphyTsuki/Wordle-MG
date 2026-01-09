/* =========================================
   1. CONFIGURATION & DONNÉES
   ========================================= */
const WORD_LENGTH = 5;
const MAX_TRIES = 6;

let SOLUTIONS = [];
let ALLOWED_WORDS = [];
let SECRET_WORD = "";
let isAzerty = true; 

function setupWordData() {
  const now = new Date();
  const tzOffset = 3 * 60; 
  const localTime = new Date(now.getTime() + (tzOffset + now.getTimezoneOffset()) * 60000);
  const startOfReference = new Date(2024, 0, 1);
  const dayIndex = Math.floor((localTime - startOfReference) / (1000 * 60 * 60 * 24));

  if (typeof MOTS_MALGACHES !== 'undefined') {
    SOLUTIONS = MOTS_MALGACHES;
    ALLOWED_WORDS = MOTS_MALGACHES;
    const wordIndex = dayIndex % SOLUTIONS.length;
    SECRET_WORD = SOLUTIONS[wordIndex].toUpperCase();
  } else {
    SECRET_WORD = "AKANY";
  }

  const todayLabel = localTime.toLocaleDateString();
  if (stats.lastPlayedDate === todayLabel && stats.isFinishedToday) {
    isGameOver = true;
    setTimeout(() => {
      if (welcomeEl) {
        const welcomeBox = welcomeEl.querySelector(".welcome-box");
        welcomeBox.innerHTML = `
          <h2 style="font-size: 2rem; margin-bottom: 20px;">Miverena rahampitso indray!</h2>
          <p>Efa nahavita ny lalao ianao androany.</p>
          <div id="mini-stats" style="margin-top: 20px; text-align: left; background: #121213; padding: 15px; border-radius: 8px;">
            <p>📊 Stats : ${stats.gamesPlayed} lalao</p>
            <p>🔥 Streak : ${stats.currentStreak}</p>
          </div>
          <p id="countdown-container" style="margin-top: 20px; font-weight: bold; color: #538d4e;">
            Teny vaovao afaka <span id="countdown">--:--:--</span>
          </p>
        `;
        welcomeEl.classList.remove("hidden");
        startCountdown(); // Lancement du chrono
      }
    }, 200);
  }
}

  // Chargement des mots
  if (typeof MOTS_MALGACHES !== 'undefined') {
    SOLUTIONS = MOTS_MALGACHES;
    ALLOWED_WORDS = MOTS_MALGACHES;
    // Note : Idéalement, il faudrait que le SECRET_WORD soit le même pour tout le monde chaque jour
    SECRET_WORD = SOLUTIONS[Math.floor(Math.random() * SOLUTIONS.length)];
  } else {
    SOLUTIONS = ["AKANY"]; 
    SECRET_WORD = "AKANY";
  }
}

/* =========================================
   2. ÉTAT DU JEU & ÉLÉMENTS DOM
   ========================================= */
// Initialisation des statistiques

let stats = JSON.parse(localStorage.getItem("wordle_stats")) || {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  lastPlayedDate: null // Pour vérifier si le joueur a joué aujourd'hui
};

let currentRow = 0;
let currentCol = 0;
let grid = [];
let isGameOver = false;

const gridElement = document.getElementById("grid");
const keyboardEl = document.getElementById("keyboard");
const messageEl = document.getElementById("message");
const welcomeEl = document.getElementById("welcome");
const startBtn = document.getElementById("startGame");
const openBtn = document.getElementById("openWelcome");
const layoutBtn = document.getElementById("toggleLayout"); 

const keyElements = {};

/* =========================================
   3. INITIALISATION DE L'INTERFACE
   ========================================= */

function initGrid() {
  gridElement.innerHTML = "";
  for (let r = 0; r < MAX_TRIES; r++) {
    const row = document.createElement("div");
    row.className = "row";
    grid[r] = [];
    for (let c = 0; c < WORD_LENGTH; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      row.appendChild(cell);
      grid[r][c] = cell;
    }
    gridElement.appendChild(row);
  }
}

function initKeyboard() {
  keyboardEl.innerHTML = "";
  const qwerty = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
  const azerty = ["AZERTYUIOP", "QSDFGHJKLM", "WXCVBN"];
  const layout = isAzerty ? azerty : qwerty;

  layout.forEach((row, rowIndex) => {
    const rowEl = document.createElement("div");
    rowEl.className = "key-row";

    [...row].forEach(letter => {
      const key = document.createElement("div");
      key.className = "key";
      key.textContent = letter;

      if (keyElements[letter] && keyElements[letter].className.includes(" ")) {
        key.className = keyElements[letter].className;
      }

      key.addEventListener("click", () => handleVirtualKey(letter));
      rowEl.appendChild(key);
      keyElements[letter] = key;
    });

    if (rowIndex === layout.length - 1) {
      addSpecialKey("ENTER", submitGuess, rowEl);
      addSpecialKey("⌫", removeLetter, rowEl);
    }
    keyboardEl.appendChild(rowEl);
  });
}

function addSpecialKey(label, action, parent) {
  const key = document.createElement("div");
  key.className = "key";
  key.textContent = label;
  key.style.minWidth = "60px";
  key.onclick = action;
  parent.appendChild(key);
}

/* =========================================
   4. GESTION DES ÉVÉNEMENTS
   ========================================= */

document.addEventListener("keydown", (e) => {
  // 1. Fermeture de l'écran d'accueil
  if (welcomeEl && !welcomeEl.classList.contains("hidden")) {
    if (e.key === "Enter" || e.key === "Escape") {
      startBtn.click();
      return;
    }
  }

  if (isGameOver) return;

  let key = "";

  // 2. TRADUCTION PAR POSITION PHYSIQUE (Scancode)
  // On ignore la langue du système et on regarde où le doigt appuie
  if (isAzerty) {
    const codeMap = {
      'KeyQ': 'A', 'KeyW': 'Z', 'KeyE': 'E', 'KeyR': 'R', 'KeyT': 'T', 'KeyY': 'Y', 'KeyU': 'U', 'KeyI': 'I', 'KeyO': 'O', 'KeyP': 'P',
      'KeyA': 'Q', 'KeyS': 'S', 'KeyD': 'D', 'KeyF': 'F', 'KeyG': 'G', 'KeyH': 'H', 'KeyJ': 'J', 'KeyK': 'K', 'KeyL': 'L', 'KeyM': 'M',
      'KeyZ': 'W', 'KeyX': 'X', 'KeyC': 'C', 'KeyV': 'V', 'KeyB': 'B', 'KeyN': 'N', 'Semicolon': 'M', 'Comma': 'M'
    };
    key = codeMap[e.code] || "";
  } else {
    // Mode QWERTY standard
    if (/^Key[A-Z]$/.test(e.code)) {
      key = e.code.replace('Key', '');
    }
  }

  // Touches spéciales (communes aux deux modes)
  if (e.key === "Enter") key = "ENTER";
  if (e.key === "Backspace") key = "BACKSPACE";

  // 3. Logique de saisie
  if (key === "ENTER") {
    submitGuess();
  } else if (key === "BACKSPACE") {
    removeLetter();
  } else if (/^[A-Z]$/.test(key)) {
    addLetter(key);
  }

  // 4. Animation de la touche virtuelle
  const keyEl = keyElements[key];
  if (keyEl) {
    keyEl.classList.add("pressed");
    setTimeout(() => keyEl.classList.remove("pressed"), 100);
  }
});

openBtn.addEventListener("click", () => {
  welcomeEl.querySelector(".welcome-box").classList.remove("closing");
  welcomeEl.classList.remove("hidden");
});

startBtn.addEventListener("click", () => {
  welcomeEl.querySelector(".welcome-box").classList.add("closing");
  setTimeout(() => welcomeEl.classList.add("hidden"), 300);
});

layoutBtn.addEventListener("click", () => {
  isAzerty = !isAzerty;
  layoutBtn.textContent = isAzerty ? "Q" : "A";
  initKeyboard();
});

/* =========================================
   5. LOGIQUE MÉTIER
   ========================================= */

function addLetter(letter) {
  if (currentCol < WORD_LENGTH) {
    grid[currentRow][currentCol].textContent = letter;
    currentCol++;
  }
}

function removeLetter() {
  if (currentCol > 0) {
    currentCol--;
    grid[currentRow][currentCol].textContent = "";
  }
}

function submitGuess() {
  if (currentCol < WORD_LENGTH) return;
  const guess = grid[currentRow].map(cell => cell.textContent).join("").toUpperCase();

  if (!ALLOWED_WORDS.includes(guess)) {
    showInvalidWord();
    return;
  }

  checkGuess(guess);

  // --- VICTOIRE ---
 if (guess === SECRET_WORD) {
  isGameOver = true;
  updateStats(true);
  saveEndOfDay();
  setTimeout(() => setupWordData(), 1500); // Relance setup pour afficher l'écran de fin
  return;
}

  currentRow++;
  currentCol = 0;

  // --- DÉFAITE ---
  if (currentRow === MAX_TRIES) {
  isGameOver = true;
  updateStats(false);
  saveEndOfDay();
  setTimeout(() => setupWordData(), 1500); // Relance setup pour afficher l'écran de fin
}
} // <--- L'accolade qui manquait ici !

function checkGuess(guess) {
  const secret = SECRET_WORD.split("");
  const guessLetters = guess.split("");
  const result = Array(WORD_LENGTH).fill("absent");

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessLetters[i] === secret[i]) {
      result[i] = "correct";
      secret[i] = null;
    }
  }

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === "correct") continue;
    const index = secret.indexOf(guessLetters[i]);
    if (index !== -1) {
      result[i] = "present";
      secret[index] = null;
    }
  }

  grid[currentRow].forEach((cell, i) => {
    cell.classList.add("flip");
    setTimeout(() => cell.classList.add(result[i]), 400 + (i * 100));
  });

  updateKeyboardColors(guess, result);
}

function handleVirtualKey(letter) {
  addLetter(letter);
}

function updateStats(isWin) {
  const today = new Date().toLocaleDateString();
  stats.gamesPlayed++;
  
  if (isWin) {
    stats.gamesWon++;
    stats.currentStreak++;
  } else {
    stats.currentStreak = 0;
  }

  stats.lastPlayedDate = today;
  localStorage.setItem("wordle_stats", JSON.stringify(stats));
  
  setTimeout(() => showStatsAlert(isWin), 1500);
}

/* =========================================
   6. UTILITAIRES
   ========================================= */

function showStatsAlert(isWin) {
  const title = isWin ? "🎉 Bravo !" : `❌ Perdu ! Le mot était : ${SECRET_WORD}`;
  
  // Construction du message avec les données de l'objet 'stats'
  const message = `
    ${title}
    
    📊 Statistiques :
    • Parties jouées : ${stats.gamesPlayed}
    • Victoires : ${stats.gamesWon}
    • Série actuelle : ${stats.currentStreak} 🔥
  `;
  
  alert(message);
}

function updateKeyboardColors(guess, result) {
  for (let i = 0; i < guess.length; i++) {
    const letter = guess[i];
    const status = result[i];
    const key = keyElements[letter];
    if (!key || key.classList.contains("correct")) continue;
    if (key.classList.contains("present") && status === "absent") continue;
    key.classList.remove("present", "absent");
    key.classList.add(status);
  }
}

function showInvalidWord() {
  messageEl.textContent = "tsy ao anaty safidy";
  messageEl.classList.add("show", "message-error");
  grid[currentRow].forEach(cell => cell.classList.add("invalid"));
  setTimeout(() => {
    messageEl.classList.remove("show", "message-error");
    grid[currentRow].forEach(cell => cell.classList.remove("invalid"));
  }, 2500);
}

function saveEndOfDay() {
  const now = new Date();
  const tzOffset = 3 * 60;
  const localTime = new Date(now.getTime() + (tzOffset + now.getTimezoneOffset()) * 60000);
  
  stats.lastPlayedDate = localTime.toLocaleDateString();
  stats.isFinishedToday = true;
  localStorage.setItem("wordle_stats", JSON.stringify(stats));
}

function startCountdown() {
  const countdownEl = document.getElementById("countdown");
  if (!countdownEl) return;

  const timer = setInterval(() => {
    const now = new Date();
    // Heure actuelle à Antananarivo
    const tzOffset = 3 * 60;
    const localTime = new Date(now.getTime() + (tzOffset + now.getTimezoneOffset()) * 60000);
    
    // Calcul de minuit prochain à Antananarivo
    const tomorrow = new Date(localTime);
    tomorrow.setHours(24, 0, 0, 0); 
    
    const diff = tomorrow - localTime;

    if (diff <= 0) {
      clearInterval(timer);
      location.reload(); // Recharge la page pour libérer le nouveau mot
      return;
    }

    // Formatage HH:MM:SS
    const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
    const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');

    countdownEl.textContent = `${h}:${m}:${s}`;
  }, 1000);
}

/* =========================================
   7. LANCEMENT
   ========================================= */
setupWordData();
initGrid();
initKeyboard();

if (layoutBtn) layoutBtn.textContent = isAzerty ? "Q" : "A";

// On n'affiche l'écran de bienvenue automatique que si le jeu n'est pas déjà fini
if (!isGameOver) {
  setTimeout(() => {
    if (welcomeEl) welcomeEl.classList.remove("hidden");
  }, 100);
}
