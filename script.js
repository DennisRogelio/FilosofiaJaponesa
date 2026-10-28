/* =========================================================
   ENTRE JAPÓN Y MÉXICO — script.js
   Lógica completa del juego de memorama.
   ========================================================= */

// -----------------------------------------------------------
// 1. DATOS DE LAS PAREJAS
// Cada pareja combina un concepto japonés con una idea/valor
// mexicano relacionado educativamente (comparación cultural,
// no una equivalencia literal).
// -----------------------------------------------------------
const CONCEPT_PAIRS = [
  {
    id: "kaizen",
    japaneseLabel: "Kaizen 改善",
    japaneseTag: "Japón",
    japaneseImg: "img/kaisen-desc.jpg",
    mexicoLabel: "Mejora constante",
    mexicoTag: "México",
    mexicoImg: "img/kaisen.jpg", // TODO: reemplazar por una imagen que represente "mejora constante" en México
    description:
      "Kaizen es la mejora continua a través de pequeños cambios constantes. En México esta idea puede relacionarse con el esfuerzo diario, el aprendizaje y la superación personal.",
  },
  {
    id: "ikigai",
    japaneseLabel: "Ikigai 生き甲斐",
    japaneseTag: "Japón",
    japaneseImg: "img/ikigai-desc.jpg",
    mexicoLabel: "Razón de vivir",
    mexicoTag: "México",
    mexicoImg: "img/ikigai.jpg", // TODO: reemplazar por una imagen que represente "razón de vivir" en México
    description:
      "Ikigai representa el propósito o la razón de vivir. En México puede relacionarse con la búsqueda de aquello que da sentido a la vida: la familia, las metas o las pasiones.",
  },
  {
    id: "omotenashi",
    japaneseLabel: "Omotenashi おもてなし",
    japaneseTag: "Japón",
    japaneseImg: "img/Omotenashi-desc.jpg",
    mexicoLabel: "Hospitalidad",
    mexicoTag: "México",
    mexicoImg: "img/Omotenashi.jpg", // TODO: reemplazar por una imagen que represente la hospitalidad mexicana
    description:
      "Omotenashi es la hospitalidad y la atención genuina hacia los demás. En México puede relacionarse con la calidez al recibir y atender a otras personas.",
  },
  {
    id: "gaman",
    japaneseLabel: "Gaman 我慢",
    japaneseTag: "Japón",
    japaneseImg: "img/Gaman-desc.jpg",
    mexicoLabel: "Perseverancia",
    mexicoTag: "México",
    mexicoImg: "img/Gaman.jpg", // TODO: reemplazar por una imagen que represente la perseverancia mexicana
    description:
      "Gaman es la perseverancia y la paciencia frente a la adversidad. En México puede relacionarse con la capacidad de seguir adelante ante las dificultades.",
  },
  {
    id: "wa",
    japaneseLabel: "Wa 和",
    japaneseTag: "Japón",
    japaneseImg: "img/Wa-desc.jpg",
    mexicoLabel: "Comunidad y armonía",
    mexicoTag: "México",
    mexicoImg: "img/Wa.jpg", // TODO: reemplazar por una imagen que represente la comunidad mexicana
    description:
      "Wa representa la armonía y el equilibrio en la convivencia. En México puede relacionarse con la importancia de la comunidad y el apoyo mutuo.",
  },
  {
    id: "mottainai",
    japaneseLabel: "Mottainai もったいない",
    japaneseTag: "Japón",
    japaneseImg: "img/Mottainai-desc.jpg",
    mexicoLabel: "Aprovechar los recursos",
    mexicoTag: "México",
    mexicoImg: "img/Mottainai.jpg", // TODO: reemplazar por una imagen que represente el aprovechamiento de recursos en México
    description:
      "Mottainai expresa el rechazo al desperdicio y el aprovechamiento de lo que tenemos. En México puede relacionarse con evitar desperdiciar comida, objetos o materiales.",
  },
];

// -----------------------------------------------------------
// 2. ESTADO DEL JUEGO
// -----------------------------------------------------------
const state = {
  cards: [],
  flippedCards: [],
  matchedPairs: 0,
  moves: 0,
  isBoardLocked: false,
};

// -----------------------------------------------------------
// 3. REFERENCIAS AL DOM
// -----------------------------------------------------------
const boardEl = document.getElementById("memory-board");
const movesEl = document.getElementById("stat-moves");
const pairsEl = document.getElementById("stat-pairs");
const restartBtn = document.getElementById("restart-btn");
const victoryOverlay = document.getElementById("victory-overlay");
const victoryMovesEl = document.getElementById("victory-moves");
const victoryCloseBtn = document.getElementById("victory-close-btn");
const victoryRestartBtn = document.getElementById("victory-restart-btn");

// -----------------------------------------------------------
// 4. CREACIÓN DE LAS TARJETAS
// -----------------------------------------------------------

/**
 * Construye la lista de 12 tarjetas (6 parejas) a partir de
 * CONCEPT_PAIRS, generando dos tarjetas por concepto.
 */
function buildCardData() {
  const cards = [];

  CONCEPT_PAIRS.forEach((pair) => {
    cards.push({
      pairId: pair.id,
      side: "japan",
      label: pair.japaneseLabel,
      tag: pair.japaneseTag,
      img: pair.japaneseImg,
      description: pair.description,
    });
    cards.push({
      pairId: pair.id,
      side: "mexico",
      label: pair.mexicoLabel,
      tag: pair.mexicoTag,
      img: pair.mexicoImg,
      description: pair.description,
    });
  });

  return cards;
}

/**
 * Baraja un arreglo de forma aleatoria (algoritmo Fisher-Yates).
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Crea el elemento DOM de una tarjeta a partir de sus datos.
 */
function createCardElement(cardData, index) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.pairId = cardData.pairId;
  card.dataset.index = String(index);
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.setAttribute(
    "aria-label",
    `Tarjeta oculta número ${index + 1}. Presiona para voltear.`
  );

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-face card-back" aria-hidden="true">
        <span style="font-size:1.6rem;">?</span>
      </div>
      <div class="card-face card-front">
        <img src="${cardData.img}" alt="Representación visual de ${cardData.label}" />
        <span class="card-tag">${cardData.tag}</span>
        <span class="card-label">${cardData.label}</span>
      </div>
    </div>
  `;

  card.addEventListener("click", () => handleCardClick(card, cardData));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardClick(card, cardData);
    }
  });

  return card;
}

/**
 * Renderiza el tablero completo: baraja las tarjetas y las
 * inserta en el DOM.
 */
function renderBoard() {
  boardEl.innerHTML = "";
  const shuffled = shuffleArray(buildCardData());
  state.cards = shuffled;

  shuffled.forEach((cardData, index) => {
    const cardEl = createCardElement(cardData, index);
    boardEl.appendChild(cardEl);
  });
}

// -----------------------------------------------------------
// 5. LÓGICA DE VOLTEO Y COMPARACIÓN
// -----------------------------------------------------------

function handleCardClick(cardEl, cardData) {
  if (state.isBoardLocked) return;
  if (cardEl.classList.contains("is-flipped")) return;
  if (cardEl.classList.contains("is-matched")) return;
  if (state.flippedCards.length === 2) return;

  flipCard(cardEl);
  state.flippedCards.push({ el: cardEl, data: cardData });

  if (state.flippedCards.length === 2) {
    state.moves += 1;
    updateStats();
    checkForMatch();
  }
}

function flipCard(cardEl) {
  cardEl.classList.add("is-flipped");
  cardEl.setAttribute("aria-label", "Tarjeta descubierta");
}

function unflipCard(cardEl) {
  cardEl.classList.remove("is-flipped");
  cardEl.setAttribute("aria-label", "Tarjeta oculta. Presiona para voltear.");
}

/**
 * Compara las dos tarjetas actualmente volteadas.
 */
function checkForMatch() {
  const [first, second] = state.flippedCards;
  const isMatch = first.data.pairId === second.data.pairId;

  state.isBoardLocked = true;

  if (isMatch) {
    setTimeout(() => {
      markAsMatched(first.el);
      markAsMatched(second.el);
      state.matchedPairs += 1;
      updateStats();
      state.flippedCards = [];
      state.isBoardLocked = false;

      if (state.matchedPairs === CONCEPT_PAIRS.length) {
        setTimeout(showVictory, 500);
      }
    }, 450);
  } else {
    first.el.classList.add("is-wrong");
    second.el.classList.add("is-wrong");

    setTimeout(() => {
      unflipCard(first.el);
      unflipCard(second.el);
      first.el.classList.remove("is-wrong");
      second.el.classList.remove("is-wrong");
      state.flippedCards = [];
      state.isBoardLocked = false;
    }, 900);
  }
}

function markAsMatched(cardEl) {
  cardEl.classList.add("is-matched");
  cardEl.setAttribute("aria-label", "Pareja encontrada.");
}

// -----------------------------------------------------------
// 6. CONTADORES Y ESTADÍSTICAS
// -----------------------------------------------------------

function updateStats() {
  movesEl.textContent = state.moves;
  pairsEl.textContent = `${state.matchedPairs} / ${CONCEPT_PAIRS.length}`;
}

// -----------------------------------------------------------
// 7. VICTORIA
// -----------------------------------------------------------

function showVictory() {
  victoryMovesEl.textContent = state.moves;
  victoryOverlay.classList.add("is-visible");
}

function hideVictory() {
  victoryOverlay.classList.remove("is-visible");
}

// -----------------------------------------------------------
// 8. REINICIO DEL JUEGO
// -----------------------------------------------------------

function restartGame() {
  state.flippedCards = [];
  state.matchedPairs = 0;
  state.moves = 0;
  state.isBoardLocked = false;
  hideVictory();
  updateStats();
  renderBoard();
}

// -----------------------------------------------------------
// 9. EVENTOS INICIALES
// -----------------------------------------------------------

restartBtn.addEventListener("click", restartGame);
victoryCloseBtn.addEventListener("click", hideVictory);
victoryRestartBtn.addEventListener("click", restartGame);

// Inicializar el tablero al cargar la página.
document.addEventListener("DOMContentLoaded", () => {
  updateStats();
  renderBoard();
});
