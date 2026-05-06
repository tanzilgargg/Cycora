(function () {
  "use strict";

  const STORAGE_KEY = "cycoraMobileProgress";

  const levels = [
    {
      title: "Restaurant / Cafe",
      short: "Serve, save, and spot the useful scraps.",
      art: "Assets/PlayerChef.png",
      story: "Guests are arriving. Keep the cafe moving and notice which leftovers can become material.",
      tasks: [
        {
          label: "Cafe prompt",
          prompt: "A lunch bowl order needs fast prep. What do you tap first?",
          choices: ["Greet the guest and confirm the bowl", "Skip the order and clean later", "Throw all scraps away"],
          correct: 0,
          reward: 10,
        },
        {
          label: "Recovery prompt",
          prompt: "The prep counter has clean orange peels. Where should they go?",
          choices: ["Material discovery tray", "Landfill bag", "Back onto plates"],
          correct: 0,
          reward: 12,
          scrap: "Orange peels",
        },
      ],
      badge: "Cafe Loop Starter",
    },
    {
      title: "Recipe / Lunch Rush",
      short: "Build recipes with taps instead of typing.",
      art: "Assets/PlatingCounter.png",
      story: "The lunch rush needs a recipe path that keeps edible food and future material separate.",
      tasks: [
        {
          label: "Recipe task",
          prompt: "Tap the recipe sequence for a vegetable wrap.",
          choices: ["Pantry -> chop -> plate -> serve", "Stove -> sink -> trash -> serve", "Serve -> fridge -> forget"],
          correct: 0,
          reward: 14,
        },
        {
          label: "Lunch rush task",
          prompt: "A sealed extra soup is still safe. What is the respectful route?",
          choices: ["Community fridge partner", "Textile dye bath", "Trash because it is extra"],
          correct: 0,
          reward: 12,
        },
      ],
      badge: "Lunch Rush Planner",
    },
    {
      title: "Waste to Material Lab",
      short: "Discover what each scrap can become.",
      art: "eco-lab-kitchen-to-closet/assets/station-extract.svg",
      story: "Now the recovered scraps enter the lab. Peels, grounds, husks, and pits each have different material potential.",
      tasks: [
        {
          label: "Discovery task",
          prompt: "Orange peels are clean and fragrant. Which material experiment fits best?",
          choices: ["Extract pigment and cellulose", "Serve them as dessert", "Hide them in landfill"],
          correct: 0,
          reward: 16,
          material: "citrus pigment + cellulose",
        },
        {
          label: "Lab safety task",
          prompt: "Coffee grounds arrive damp. What happens before making textile dye?",
          choices: ["Dry and label the batch", "Mix with finished scarves", "Leave them uncovered"],
          correct: 0,
          reward: 14,
        },
      ],
      badge: "Material Scout",
    },
    {
      title: "Fiber & Fabric Workshop",
      short: "Clean, grind, dye, spin, and weave.",
      art: "eco-lab-kitchen-to-closet/assets/station-weave.svg",
      story: "Your material batch becomes fabric through careful transformation steps.",
      tasks: [
        {
          label: "Transformation task",
          prompt: "Choose the strongest process order for plant-based fabric.",
          choices: ["Clean -> extract -> spin -> weave", "Weave -> toss -> clean -> guess", "Pack -> stain -> forget"],
          correct: 0,
          reward: 18,
          textile: "warm plant-dyed weave",
        },
        {
          label: "Quality task",
          prompt: "The fabric color is uneven. What should the workshop do?",
          choices: ["Test a small swatch and adjust the dye bath", "Ship it without checking", "Soak every product at once"],
          correct: 0,
          reward: 14,
        },
      ],
      badge: "Fabric Transformer",
    },
    {
      title: "Product Studio",
      short: "Design a textile product for real use.",
      art: "eco-lab-kitchen-to-closet/assets/tote.png",
      story: "The studio turns the fabric into something useful, durable, and easy to repair.",
      tasks: [
        {
          label: "Product task",
          prompt: "A community kitchen needs sturdy carry items. What should you make?",
          choices: ["Reinforced market tote", "Decor-only sample", "Single-use bag"],
          correct: 0,
          reward: 18,
          product: {
            name: "Reinforced market tote",
            image: "eco-lab-kitchen-to-closet/assets/tote.png",
          },
        },
        {
          label: "Repair task",
          prompt: "Which studio detail keeps the product circular?",
          choices: ["Visible repair patch and care tag", "Hidden weak seam", "No material label"],
          correct: 0,
          reward: 12,
        },
      ],
      badge: "Product Studio Builder",
    },
    {
      title: "Full Cycora Shift",
      short: "Connect cafe, lab, studio, and Eco Maker.",
      art: "eco-lab-kitchen-to-closet/assets/Eco-Maker.png",
      story: "Run the whole loop from recovered food scraps to a finished product with community impact.",
      tasks: [
        {
          label: "Full shift task",
          prompt: "What is the complete Cycora loop?",
          choices: [
            "Food waste -> material -> fabric -> product -> Eco Maker",
            "Food waste -> landfill -> new purchase",
            "Product -> mystery bin -> no tracking",
          ],
          correct: 0,
          reward: 22,
        },
        {
          label: "Community task",
          prompt: "Where should the Eco Maker deliver the finished tote?",
          choices: ["Newcomer welcome kits and community kitchens", "A locked storage room", "Back to the trash"],
          correct: 0,
          reward: 20,
          recipient: "newcomer welcome kits and community kitchens",
        },
      ],
      badge: "Full Shift Eco Maker",
    },
  ];

  const state = {
    player: "Cycora maker",
    practice: true,
    currentLevel: 0,
    currentTask: 0,
    impact: 0,
    scrap: "",
    material: "",
    textile: "",
    product: {
      name: "Reinforced market tote",
      image: "eco-lab-kitchen-to-closet/assets/tote.png",
    },
    recipient: "shelters, food banks, students, families, community kitchens, and newcomers",
    completed: new Set(),
  };

  const els = {
    screens: Array.from(document.querySelectorAll(".screen")),
    levelList: document.getElementById("level-list"),
    statLevel: document.getElementById("stat-level"),
    statImpact: document.getElementById("stat-impact"),
    statTimer: document.getElementById("stat-timer"),
    playerName: document.getElementById("player-name"),
    practiceToggle: document.getElementById("practice-toggle"),
    playTitle: document.getElementById("play-title"),
    levelKicker: document.getElementById("level-kicker"),
    levelArt: document.getElementById("level-art"),
    levelStory: document.getElementById("level-story"),
    taskLabel: document.getElementById("task-label"),
    taskPrompt: document.getElementById("task-prompt"),
    choiceGrid: document.getElementById("choice-grid"),
    scrap: document.getElementById("inventory-scrap"),
    product: document.getElementById("inventory-product"),
    achievementCopy: document.getElementById("achievement-copy"),
    achievementImage: document.getElementById("achievement-image"),
    resultProductImg: document.getElementById("result-product-img"),
    resultProductName: document.getElementById("result-product-name"),
    resultImpact: document.getElementById("result-impact"),
    resultStory: document.getElementById("result-story"),
    board: document.getElementById("board-dialog"),
    scoreList: document.getElementById("score-list"),
    badgeList: document.getElementById("badge-list"),
    achievementCount: document.getElementById("achievement-count"),
  };

  function readProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { scores: [], badges: [] };
    } catch (error) {
      return { scores: [], badges: [] };
    }
  }

  function writeProgress(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  function showScreen(id) {
    els.screens.forEach((screen) => {
      screen.classList.toggle("is-active", screen.id === id);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateStats() {
    els.statLevel.textContent = `${Math.min(state.currentLevel + 1, levels.length)}/${levels.length}`;
    els.statImpact.textContent = String(state.impact);
    els.statTimer.textContent = state.practice ? "Practice" : "Focus";
    els.scrap.textContent = state.scrap || "None yet";
    els.product.textContent = state.product.name || "Not built yet";
  }

  function renderMap() {
    els.levelList.innerHTML = "";
    levels.forEach((level, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "level-node-mobile";
      if (state.completed.has(index)) button.classList.add("done");
      button.innerHTML = `
        <span class="level-num">${index + 1}</span>
        <span>
          <strong>${level.title}</strong>
          <span>${level.short}</span>
        </span>
      `;
      button.addEventListener("click", () => startLevel(index));
      els.levelList.appendChild(button);
    });
  }

  function startLevel(index) {
    state.currentLevel = index;
    state.currentTask = 0;
    renderPlay();
    showScreen("screen-play");
  }

  function renderPlay() {
    const level = levels[state.currentLevel];
    const task = level.tasks[state.currentTask];
    els.levelKicker.textContent = `Level ${state.currentLevel + 1}`;
    els.playTitle.textContent = level.title;
    els.levelArt.src = level.art;
    els.levelStory.textContent = level.story;
    els.taskLabel.textContent = task.label;
    els.taskPrompt.textContent = task.prompt;
    els.choiceGrid.innerHTML = "";

    task.choices.forEach((choice, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice-button";
      button.textContent = choice;
      button.addEventListener("click", () => answerTask(index));
      els.choiceGrid.appendChild(button);
    });
    updateStats();
  }

  function answerTask(index) {
    const level = levels[state.currentLevel];
    const task = level.tasks[state.currentTask];
    const buttons = Array.from(els.choiceGrid.children);
    buttons.forEach((button) => {
      button.disabled = true;
    });
    buttons[index].classList.add(index === task.correct ? "correct" : "wrong");
    buttons[task.correct].classList.add("correct");

    if (index === task.correct) {
      state.impact += task.reward;
    } else {
      state.impact += Math.max(4, Math.round(task.reward / 3));
    }

    if (task.scrap) state.scrap = task.scrap;
    if (task.material) state.material = task.material;
    if (task.textile) state.textile = task.textile;
    if (task.product) state.product = task.product;
    if (task.recipient) state.recipient = task.recipient;
    updateStats();

    window.setTimeout(() => {
      state.currentTask += 1;
      if (state.currentTask < level.tasks.length) {
        renderPlay();
      } else {
        finishLevel();
      }
    }, 520);
  }

  function finishLevel() {
    const level = levels[state.currentLevel];
    state.completed.add(state.currentLevel);
    saveBadge(level.badge);
    renderMap();
    els.achievementCopy.textContent = achievementText();
    els.achievementImage.src = state.currentLevel >= 4 ? state.product.image : level.art;
    showScreen("screen-achievement");
  }

  function achievementText() {
    const pieces = [
      state.scrap ? `${state.scrap} stayed useful` : "The cafe loop is moving",
      state.material ? `became ${state.material}` : "and moved into the lab",
      state.textile ? `then became ${state.textile}` : "for the next maker",
    ];
    return `${pieces.join(", ")}. Achievement saved on this phone.`;
  }

  function continueAfterAchievement() {
    if (state.currentLevel < levels.length - 1) {
      startLevel(state.currentLevel + 1);
    } else {
      finishShift();
    }
  }

  function saveBadge(badge) {
    const progress = readProgress();
    if (!progress.badges.includes(badge)) {
      progress.badges.push(badge);
    }
    writeProgress(progress);
  }

  function finishShift() {
    const progress = readProgress();
    progress.scores.unshift({
      name: state.player,
      impact: state.impact,
      product: state.product.name,
      date: new Date().toLocaleDateString(),
    });
    progress.scores = progress.scores.sort((a, b) => b.impact - a.impact).slice(0, 8);
    writeProgress(progress);

    els.resultProductImg.src = state.product.image;
    els.resultProductName.textContent = state.product.name;
    els.resultImpact.textContent = `${state.impact} impact points`;
    els.resultStory.textContent = `The Eco Maker gives the ${state.product.name.toLowerCase()} to ${state.recipient}, supporting people through practical textiles made from recovered food materials.`;
    showScreen("screen-results");
  }

  function openBoard() {
    const progress = readProgress();
    els.scoreList.innerHTML = "";
    els.badgeList.innerHTML = "";

    if (progress.scores.length === 0) {
      const empty = document.createElement("li");
      empty.textContent = "No completed mobile shifts yet.";
      els.scoreList.appendChild(empty);
    } else {
      progress.scores.forEach((score) => {
        const item = document.createElement("li");
        item.textContent = `${score.name}: ${score.impact} impact, ${score.product}`;
        els.scoreList.appendChild(item);
      });
    }

    progress.badges.forEach((badge) => {
      const item = document.createElement("span");
      item.className = "badge";
      item.textContent = badge;
      els.badgeList.appendChild(item);
    });

    if (progress.badges.length === 0) {
      const item = document.createElement("span");
      item.className = "badge";
      item.textContent = "Play a level to save an achievement";
      els.badgeList.appendChild(item);
    }

    els.achievementCount.textContent = String(progress.badges.length);
    if (typeof els.board.showModal === "function") {
      els.board.showModal();
    } else {
      els.board.setAttribute("open", "");
    }
  }

  function closeBoard() {
    els.board.close();
  }

  function resetShift() {
    state.player = els.playerName.value.trim() || "Cycora maker";
    state.currentLevel = 0;
    state.currentTask = 0;
    state.impact = 0;
    state.scrap = "";
    state.material = "";
    state.textile = "";
    state.recipient = "newcomer welcome kits and community kitchens";
    state.completed = new Set();
    state.product = {
      name: "Reinforced market tote",
      image: "eco-lab-kitchen-to-closet/assets/tote.png",
    };
    renderMap();
    updateStats();
  }

  document.getElementById("start-shift").addEventListener("click", () => {
    resetShift();
    startLevel(0);
  });
  document.getElementById("show-map").addEventListener("click", () => {
    renderMap();
    showScreen("screen-map");
  });
  document.getElementById("continue-after-achievement").addEventListener("click", continueAfterAchievement);
  document.getElementById("play-again").addEventListener("click", () => {
    resetShift();
    showScreen("screen-home");
  });
  document.getElementById("open-board").addEventListener("click", openBoard);
  document.getElementById("results-board").addEventListener("click", openBoard);
  document.getElementById("close-board").addEventListener("click", closeBoard);
  els.practiceToggle.addEventListener("click", () => {
    state.practice = !state.practice;
    els.practiceToggle.classList.toggle("is-on", state.practice);
    els.practiceToggle.setAttribute("aria-pressed", String(state.practice));
    els.practiceToggle.textContent = state.practice ? "No timer" : "Focus timer";
    updateStats();
  });

  renderMap();
  updateStats();
})();
