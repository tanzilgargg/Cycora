/**
 * Boot, play button, keyboard routing
 */
(function () {
  function initAssetFallbacks() {
    document.querySelectorAll("img[data-asset]").forEach((img) => {
      img.addEventListener("error", () => {
        const host = img.closest(
          ".sprite-interactive, .chef-avatar, .customer, .dining-furniture",
        );
        if (host) host.classList.add("asset-missing");
        img.removeAttribute("src");
      });
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAssetFallbacks);
  } else {
    initAssetFallbacks();
  }

  const els = {
    viewport: document.getElementById("game-viewport"),
    screenMenu: document.getElementById("screen-menu"),
    screenGame: document.getElementById("screen-game"),
    screenResults: document.getElementById("screen-results"),
    scene: document.querySelector(".scene"),
    tablesContainer: document.getElementById("tables-container"),
    hudTimer: document.getElementById("hud-timer"),
    hudProfit: document.getElementById("hud-profit"),
    hudImpact: document.getElementById("hud-impact"),
    hudMeals: document.getElementById("hud-meals"),
    hudWaste: document.getElementById("hud-waste"),
    hudCombo: document.getElementById("hud-combo"),
    chefAvatar: document.getElementById("chef-avatar"),
    stationFridge: document.getElementById("station-fridge"),
    stationPantry: document.getElementById("station-pantry"),
    stationChop: document.getElementById("station-chop"),
    stationStove: document.getElementById("station-stove"),
    stationSink: document.getElementById("station-sink"),
    stationPlate: document.getElementById("station-plate"),
    stationServe: document.getElementById("station-serve"),
    wasteDock: document.getElementById("waste-dock"),
    leftoverSlot: document.getElementById("leftover-slot"),
    wasteHint: document.getElementById("waste-hint"),
    queueList: document.getElementById("queue-list"),
    wordDisplay: document.getElementById("word-display"),
    typingHint: document.getElementById("typing-hint"),
    typingLabel: document.getElementById("typing-label"),
    mobileTypingInput: document.getElementById("mobile-typing-input"),
    dialoguePanel: document.getElementById("dialogue-panel"),
    dialogueSpeaker: document.getElementById("dialogue-speaker"),
    dialogueText: document.getElementById("dialogue-text"),
    fxLayer: document.getElementById("fx-layer"),
    resultsStars: document.getElementById("results-stars"),
    resultsStats: document.getElementById("results-stats"),
    resultsFlavor: document.getElementById("results-flavor"),
    leaderboardModal: document.getElementById("leaderboard-modal"),
    leaderboardBody: document.getElementById("leaderboard-body"),
  };

  let game = null;

  function ensureGame() {
    if (game) return game;
    if (window.TypingPiano) window.TypingPiano.prime();
    const largePrompts = !!document.getElementById("opt-large-prompts")?.checked;
    const highContrast = !!document.getElementById("opt-high-contrast")?.checked;
    const practiceMode = !!document.getElementById("opt-practice-mode")?.checked;
    game = new CycoraGame(els, {
      largePrompts,
      highContrast,
      practiceMode,
    });
    return game;
  }

  function startGame() {
    const g = ensureGame();
    els.screenMenu.classList.add("hidden");
    els.screenGame.classList.remove("hidden");
    els.screenResults.classList.add("hidden");
    els.dialoguePanel.classList.remove("hidden");
    g.startIntroDialogue();
  }

  ensureGame().startIntroDialogue();

  const legacyStart = document.getElementById("btn-start-game");
  if (legacyStart) legacyStart.addEventListener("click", startGame);

  document.getElementById("btn-results-menu").addEventListener("click", () => {
    if (game) game.restartToMenu();
  });

  window.addEventListener("keydown", (e) => {
    if (!game) return;
    if (e.target === els.mobileTypingInput) return;
    if (e.key === "Escape") {
      game.hideLeaderboard();
      return;
    }
    if (game.isLeaderboardOpen()) return;
    const isSpace = e.key === " " || e.code === "Space";
    if (isSpace) {
      e.preventDefault();
      game.onSpace();
      return;
    }
    game.handleTypingKey(e);
  });

  if (els.mobileTypingInput) {
    els.mobileTypingInput.addEventListener("beforeinput", (e) => {
      if (!game || game.isLeaderboardOpen() || game.state !== "playing") return;
      if (e.inputType === "deleteContentBackward") {
        e.preventDefault();
        game.handleTypingBackspace();
        els.mobileTypingInput.value = "";
      }
    });

    els.mobileTypingInput.addEventListener("input", () => {
      if (!game || game.isLeaderboardOpen() || game.state !== "playing") {
        els.mobileTypingInput.value = "";
        return;
      }
      const chars = Array.from(els.mobileTypingInput.value).filter((ch) => /[a-zA-Z]/.test(ch));
      chars.forEach((ch) => game.handleTypingChar(ch));
      els.mobileTypingInput.value = "";
    });

    els.mobileTypingInput.addEventListener("keydown", (e) => {
      if (!game) return;
      if (e.key === "Escape") {
        game.hideLeaderboard();
        return;
      }
      if (game.isLeaderboardOpen()) return;
      if (e.key === "Enter") {
        e.preventDefault();
        els.mobileTypingInput.value = "";
        return;
      }
      if (e.key === "Backspace") {
        e.preventDefault();
        game.handleTypingBackspace();
        els.mobileTypingInput.value = "";
      }
    });

    els.mobileTypingInput.addEventListener("focus", () => {
      window.setTimeout(() => els.mobileTypingInput.scrollIntoView({ block: "nearest", inline: "nearest" }), 50);
    });
  }

  const screenGame = document.getElementById("screen-game");
  if (screenGame) {
    screenGame.addEventListener("click", (e) => {
      const hit = e.target.closest(".sprite-hit");
      if (!hit) return;
      const host = hit.closest(".sprite-interactive");
      if (!host) return;
      hit.blur();
      host.classList.remove("sprite-tapped");
      void host.offsetWidth;
      host.classList.add("sprite-tapped");
      window.clearTimeout(host._cycTapT);
      host._cycTapT = window.setTimeout(() => host.classList.remove("sprite-tapped"), 240);
      if (els.mobileTypingInput && window.matchMedia("(pointer: coarse)").matches) {
        els.mobileTypingInput.focus({ preventScroll: true });
      }
    });
  }
})();
