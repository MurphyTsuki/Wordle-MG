const WORD_LENGTH = 5;
const MAX_TRIES = 6;

// === DICTIONNAIRES (à compléter) ===

// Mots solutions possibles (plus tard)
const SOLUTIONS = [ "AKANY",
	"AMBOA",
	"ANTRA",
	"ATODY",
	"BAIKO",
	"ERANY",
	"FAIKA",
	"GIDRO",
	"HATRA",
	"HOANY",
	"IMASO",
	"INONA",
	"ISIKA",
	"LAMBA",
	"MAIKA",
	"MAINA",
	"MANIA",
	"MATOA",
	"HODIA",
	"JEREO",
	"KODIA",
	"LANJA",
	"LAOKA",
	"MADIO",
	"MIALA",
	"MIARA",
	"NAHOA",
	"OLONA",
	"OMEKO",
	"OROKA",
	"PAISO",
	"PAIKA",
	"RAHOA",
	"RAIKA",
	"RAOKA",
	"RITRA",
	"SAMBO",
	"SOAVA",
	"TAONA",
	"TOKOA",
	"TSARA",
	"TSENA",
	"TSIRY",
	"VAKIO",
	"VONJY",
	"ZAHAO",
	"ZIONA",
	"ADIDY",
	"AFAKA",
	"ALIKA",
	"TONGA",
  // ex: "TONGA", "ANDRO"
];

// Mots acceptés (TES 50 MOTS ICI)
const ALLOWED_WORDS = [
	"AKANY",
	"AMBOA",
	"ANTRA",
	"ATODY",
	"BAIKO",
	"ERANY",
	"FAIKA",
	"GIDRO",
	"HATRA",
	"HOANY",
	"IMASO",
	"INONA",
	"ISIKA",
	"LAMBA",
	"MAIKA",
	"MAINA",
	"MANIA",
	"MATOA",
	"HODIA",
	"JEREO",
	"KODIA",
	"LANJA",
	"LAOKA",
	"MADIO",
	"MIALA",
	"MIARA",
	"NAHOA",
	"OLONA",
	"OMEKO",
	"OROKA",
	"PAISO",
	"PAIKA",
	"RAHOA",
	"RAIKA",
	"RAOKA",
	"RITRA",
	"SAMBO",
	"SOAVA",
	"TAONA",
	"TOKOA",
	"TSARA",
	"TSENA",
	"TSIRY",
	"VAKIO",
	"VONJY",
	"ZAHAO",
	"ZIONA",
	"ADIDY",
	"AFAKA",
	"ALIKA",
	"TONGA",
  //  ajoute ici tes 50 mots
];

// MOT SECRET A TROUVER
const SECRET_WORD =  SOLUTIONS[Math.floor(Math.random() * SOLUTIONS.length)];

if (!SECRET_WORD) {
  throw new Error("SOLUTIONS est vide");
}


let currentRow = 0;
let currentCol = 0;
let grid = [];
let isGameOver = false;

// Création de la grille
const gridElement = document.getElementById("grid");

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

const keyboardLayout = [
  "QWERTYUIOP",
  "ASDFGHJKL",
  "ZXCVBNM"
];

const keyboardEl = document.getElementById("keyboard");
const keyElements = {};

keyboardLayout.forEach(row => {
  const rowEl = document.createElement("div");
  rowEl.className = "key-row";

  [...row].forEach(letter => {
    const key = document.createElement("div");
    key.className = "key";
    key.textContent = letter;

    key.addEventListener("click", () => handleVirtualKey(letter));

    key.addEventListener("mousedown", () => key.classList.add("pressed"));
    key.addEventListener("mouseup", () => key.classList.remove("pressed"));
    key.addEventListener("mouseleave", () => key.classList.remove("pressed"));


    rowEl.appendChild(key);
    keyElements[letter] = key;
  });

  keyboardEl.appendChild(rowEl);
});

// touches spéciales
addSpecialKey("ENTER", submitGuess);
addSpecialKey("⌫", removeLetter);

function addSpecialKey(label, action) {
  const key = document.createElement("div");
  key.className = "key";
  key.textContent = label;
  key.style.minWidth = "60px";
  key.onclick = action;
  keyboardEl.lastChild.appendChild(key);
}

function handleVirtualKey(letter) {
  const key = keyElements[letter];
  if (key.classList.contains("absent")) return;
  addLetter(letter);
}




// Gestion du clavier physique
document.addEventListener("keydown", handleKey);

function handleKey(e) {
  if (isGameOver) return;

  const key = e.key.toUpperCase();

  if (key === "ENTER") {
    submitGuess();
  } else if (key === "BACKSPACE") {
    removeLetter();
  } else if (/^[A-Z]$/.test(key)) {
    addLetter(key);
  }

  const keyEl = keyElements[key];
  if (keyEl) {
    keyEl.classList.add("pressed");
    setTimeout(() => keyEl.classList.remove("pressed"), 100);
  }
}

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

  const guess = grid[currentRow]
  .map(cell => cell.textContent)
  .join("")
  .toUpperCase();


  // ❌ Mot non autorisé
  if (!ALLOWED_WORDS.includes(guess)) {
  showInvalidWord();
  return; 
}


  checkGuess(guess);

  if (guess === SECRET_WORD) {
    alert("🎉 Bravo !");
    isGameOver = true;
    return;
  }

  currentRow++;
  currentCol = 0;

  if (currentRow === MAX_TRIES) {
    alert(`❌ Perdu ! Mot : ${SECRET_WORD}`);
    isGameOver = true;
  }
}


// LOGIQUE EXACTE WORDLE (lettres répétées incluses)
function checkGuess(guess) {
  const secret = SECRET_WORD.split("");
  const guessLetters = guess.split("");
  const result = Array(WORD_LENGTH).fill("absent");

  // 1ère passe : verts
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessLetters[i] === secret[i]) {
      result[i] = "correct";
      secret[i] = null;
    }
  }

  // 2ème passe : jaunes
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === "correct") continue;

    const index = secret.indexOf(guessLetters[i]);
    if (index !== -1) {
      result[i] = "present";
      secret[index] = null;
    }
  }

  // Appliquer les couleurs
  for (let i = 0; i < WORD_LENGTH; i++) {
    grid[currentRow][i].classList.add(result[i]);
  }


updateKeyboardColors(guess, result);
}
function updateKeyboardColors(guess, result) {
  for (let i = 0; i < guess.length; i++) {
    const letter = guess[i];
    const status = result[i];
    const key = keyElements[letter];

    if (!key) continue;

    if (
      key.classList.contains("correct") ||
      (key.classList.contains("present") && status === "absent")
    ) {
      continue;
    }

    key.classList.remove("correct", "present", "absent");
    key.classList.add(status);
  }
}


const messageEl = document.getElementById("message");

function showInvalidWord() {
  messageEl.textContent = "tsy ao anaty safidy";
  messageEl.classList.add("show");

  for (let i = 0; i < WORD_LENGTH; i++) {
    grid[currentRow][i].classList.add("invalid");
  }

  setTimeout(() => {
    messageEl.classList.remove("show");
    for (let i = 0; i < WORD_LENGTH; i++) {
      grid[currentRow][i].classList.remove("invalid");
    }
  }, 1000);
}

