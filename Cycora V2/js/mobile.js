(function () {
  "use strict";

  const STORAGE_KEY = "cycoraMobileProgress";

  let levels = [];

  const baseLevels = [
    {
      title: "Fruit Sorting Studio",
      short: "Receive fruits and spot their palette potential.",
      art: "Assets/PlayerChef.png",
      story: "Fruit crates arrive at the cozy Eco Lab. Each fruit can become color, fiber, texture, or pattern.",
      tasks: [
        {
          label: "Fruit prompt",
          prompt: "A strawberry batch arrives for a hoodie design. What do you check first?",
          choices: ["Sort by color and texture", "Skip the fruit scan", "Send it to landfill"],
          correct: 0,
          reward: 10,
        },
        {
          label: "Palette prompt",
          prompt: "Clean oranges have bright citrus color. Where should they go?",
          choices: ["Fruit palette scanner", "Landfill bag", "Back onto plates"],
          correct: 0,
          reward: 12,
          scrap: "Oranges",
        },
      ],
      badge: "Fruit Palette Starter",
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
      title: "Fruit Palette Lab",
      short: "Discover what each fruit can become.",
      art: "eco-lab-kitchen-to-closet/assets/station-extract.svg",
      story: "Now fruits enter the lab. Strawberries, blueberries, oranges, bananas, and avocados each unlock different fashion materials.",
      tasks: [
        {
          label: "Discovery task",
          prompt: "Blueberries are rich and cool-toned. Which material experiment fits best?",
          choices: ["Extract cool pigment for pixel shadows", "Serve them as dessert", "Hide them in landfill"],
          correct: 0,
          reward: 16,
          material: "blueberry pigment",
        },
        {
          label: "Lab safety task",
          prompt: "Banana fiber arrives damp. What happens before weaving texture?",
          choices: ["Wash, label, and stabilize the batch", "Mix with finished outfits", "Leave it uncovered"],
          correct: 0,
          reward: 14,
        },
      ],
      badge: "Material Scout",
    },
    {
      title: "Fruit Fashion Workshop",
      short: "Wash, extract, blend, weave, dye, and craft.",
      art: "eco-lab-kitchen-to-closet/assets/station-weave.svg",
      story: "Your fruit palette becomes clothing pixel art through careful production steps.",
      tasks: [
        {
          label: "Transformation task",
          prompt: "Choose the strongest process order for fruit fashion pixels.",
          choices: ["Wash -> extract -> blend -> weave -> dye -> craft", "Weave -> toss -> clean -> guess", "Pack -> stain -> forget"],
          correct: 0,
          reward: 18,
          textile: "warm fruit-dyed pixel texture",
        },
        {
          label: "Quality task",
          prompt: "The hoodie pixels look uneven. What should the workshop do?",
          choices: ["Test a small swatch and adjust the fruit dye bath", "Ship it without checking", "Soak every outfit at once"],
          correct: 0,
          reward: 14,
        },
      ],
      badge: "Pixel Fabric Transformer",
    },
    {
      title: "Collection Studio",
      short: "Design clothing pixel art for a new collection.",
      art: "eco-lab-kitchen-to-closet/assets/tote.png",
      story: "The studio turns fruit-made materials into hoodies, dresses, sneakers, jackets, and futuristic pieces.",
      tasks: [
        {
          label: "Product task",
          prompt: "A berry palette is ready. What should you make?",
          choices: ["Cozy red pixel hoodie", "Decor-only sample", "Single-use bag"],
          correct: 0,
          reward: 18,
          product: {
            name: "Cozy red pixel hoodie",
            image: "eco-lab-kitchen-to-closet/assets/jacket-2.png",
          },
        },
        {
          label: "Repair task",
          prompt: "Which studio detail keeps the product circular?",
          choices: ["Fruit palette label and repair patch", "Hidden weak seam", "No material label"],
          correct: 0,
          reward: 12,
        },
      ],
      badge: "Collection Studio Builder",
    },
    {
      title: "Full Fruit Fashion Loop",
      short: "Connect fruit, process, pixel art, and Eco Maker.",
      art: "eco-lab-kitchen-to-closet/assets/Eco-Maker.png",
      story: "Run the whole loop from fruit source to finished clothing pixel art collection.",
      tasks: [
        {
          label: "Full shift task",
          prompt: "What is the complete Fruit Fashion Pixel Craft loop?",
          choices: [
            "Fruit -> material -> pixel texture -> outfit -> Eco Maker",
            "Fruit -> landfill -> new purchase",
            "Outfit -> mystery bin -> no tracking",
          ],
          correct: 0,
          reward: 22,
        },
        {
          label: "Community task",
          prompt: "Where should Eco Maker unlock the finished outfit?",
          choices: ["New fruit fashion collection", "A locked storage room", "Back to the trash"],
          correct: 0,
          reward: 20,
          recipient: "the new fruit fashion collection",
        },
      ],
      badge: "Full Shift Eco Maker",
    },
    {
      title: "Advanced Palette Memory",
      short: "Compare fruit palettes by property, not appearance.",
      art: "eco-lab-kitchen-to-closet/assets/station-sort.svg",
      story: "Rio asks you to compare fruit evidence before choosing a production process.",
      tasks: [
        {
          label: "Comparison task",
          prompt: "Which fruit batch has the best evidence for cool sneaker shadow pixels?",
          choices: ["Blueberries with cool blue-purple pigment", "Bananas with long fiber strands", "Corn with woven strips"],
          correct: 0,
          reward: 24,
          material: "blueberry pigment",
        },
        {
          label: "Memory task",
          prompt: "Which sentence best connects oranges to a citrus jacket palette?",
          choices: ["Bright citrus shade can become bold jacket accents", "Long fiber strands make blue shadows", "Hard shell strength creates metal trim"],
          correct: 0,
          reward: 20,
        },
      ],
      badge: "Memory Analyst",
    },
    {
      title: "Advanced Pixel Craft Control",
      short: "Protect quality through phrases, settings, and sequence.",
      art: "eco-lab-kitchen-to-closet/assets/station-dye.svg",
      story: "The workshop becomes stricter. You must protect heat, blending, dye, and craft order.",
      tasks: [
        {
          label: "Control task",
          prompt: "Avocado dye is heat sensitive. Which control sentence protects the color?",
          choices: ["Calibrate low heat carefully before dyeing", "Use highest heat for speed", "Skip the test swatch"],
          correct: 0,
          reward: 26,
          textile: "soft pink dyed cloth",
        },
        {
          label: "Sequence task",
          prompt: "Banana fiber is damp. What process phrase should happen before weaving?",
          choices: ["Wash, stabilize, blend, then weave", "Print first and dry later", "Weave the wet fiber directly"],
          correct: 0,
          reward: 22,
        },
      ],
      badge: "Workshop Controller",
    },
    {
      title: "Collection Systems Audit",
      short: "Match outfit, collection, and traceability.",
      art: "eco-lab-kitchen-to-closet/assets/apron.png",
      story: "The final challenge checks the whole system: finished outfit, clear fruit origin, and collection unlock.",
      tasks: [
        {
          label: "Product-route task",
          prompt: "A citrus jacket is finished. Which paragraph-style choice creates the clearest loop?",
          choices: ["Unlock it in the citrus streetwear collection with its fruit source label", "Lock it in storage with no label", "Throw it into a sample box"],
          correct: 0,
          reward: 28,
          product: {
            name: "Citrus pixel jacket",
            image: "eco-lab-kitchen-to-closet/assets/jacket.png",
          },
        },
        {
          label: "Traceability task",
          prompt: "What makes the collection unlock traceable instead of just decorative?",
          choices: ["Fruit source story, repair plan, and collection label", "No label and no tracking", "Only a high score"],
          correct: 0,
          reward: 24,
          recipient: "the citrus streetwear collection",
        },
      ],
      badge: "Community Systems Auditor",
    },
  ];

  function pickByLevel(items, levelIndex) {
    return items[Math.min(levelIndex, items.length - 1)];
  }

  const ageProfiles = {
    kids: {
      label: "Kids",
      choiceSuffix: ["Ask Rio first", "Guess without looking"],
      extraReward: 2,
      task: (levelIndex) => ({
        label: "Memory check",
        prompt: pickByLevel([
          "Rio asks what clean citrus peels can become. What do you remember?",
          "Which fruit should be saved for the next palette?",
          "The scanner finds color in the peel. What path fits?",
          "The cloth is drying. What keeps the color safe?",
          "Which outfit fits the berry palette?",
          "What makes the loop continue?",
          "Which fruit is best for making cool sneaker shadows?",
          "What should happen before pixel cloth is dyed or printed?",
          "What makes an outfit traceable after the game ends?",
        ], levelIndex),
        choices: pickByLevel([
          ["Natural color for cloth", "A mystery snack", "Nothing useful"],
          ["Clean peels and pits", "Dirty napkins only", "Broken plates"],
          ["Dye path", "Thread path", "Trash path"],
          ["Let it dry fully", "Fold it wet", "Hide the label"],
          ["Cozy red hoodie", "Single-use bag", "Decoration only"],
          ["Unlock the outfit in a collection", "Lock it away", "Throw it out"],
          ["Blueberries", "Plastic wrap", "Dirty tissue"],
          ["Test a small piece first", "Rush the whole batch", "Skip cleaning"],
          ["It has a fruit source label", "It stays hidden", "It has no label"],
        ], levelIndex),
        correct: 0,
        reward: 10,
      }),
    },
    teens: {
      label: "Teens",
      choiceSuffix: ["Optimize the wrong metric", "Ignore the material memory"],
      extraReward: 5,
      task: (levelIndex) => ({
        label: "Systems challenge",
        prompt: pickByLevel([
          "A fruit crate creates bright citrus material. Which decision protects both speed and future palette value?",
          "You are tracking multiple fruits. Which batch has the clearest textile pathway?",
          "The scanner reports oils, rind, and color potential. Which palette pathway has the strongest evidence?",
          "The dye bath is unstable. Which intervention protects quality without stopping production?",
          "An outfit brief asks for durability, repair, and visible origin. What studio decision fits?",
          "Eco Maker needs a collection unlock and traceability. Which plan is strongest?",
          "A sneaker print brief needs strong visual memory. Which fruit stream should move forward?",
          "A workshop station is overloaded. Which response protects quality and time?",
          "The community route is unclear. Which evidence makes the handoff strongest?",
        ], levelIndex),
        choices: pickByLevel([
          ["Sort the fruit and label the palette immediately", "Delay craft to sort every bin", "Throw fruit into mixed waste"],
          ["Labeled citrus, berry, and avocado batches", "Unlabeled wet trash", "Unknown leftovers"],
          ["Natural dye extraction", "Random weaving", "Immediate landfill"],
          ["Test a swatch, rebalance heat, then continue", "Overheat the full batch", "Skip quality checks"],
          ["Repairable jacket with fruit source label", "Unmarked fashion sample", "Disposable wrap"],
          ["Collection unlock with material story", "Private storage", "No recipient tracking"],
          ["Blueberry pigment for sneaker print", "Banana fiber for dye bath", "Mixed trash for weaving"],
          ["Split the batch and document settings", "Run all machines faster", "Ignore the failed swatch"],
          ["Recipient need plus material source", "Only a nice photo", "No repair plan"],
        ], levelIndex),
        correct: 0,
        reward: 16,
      }),
    },
    adults: {
      label: "Adults",
      choiceSuffix: ["Choose the lowest-labor option", "Prioritize speed over traceability"],
      extraReward: 7,
      task: (levelIndex) => ({
        label: "Process audit",
        prompt: pickByLevel([
          "During fruit intake, which operational choice preserves material provenance without slowing the craft handoff?",
          "Which recovered stream is most ready for a controlled material trial?",
          "The lab identifies citrus oil, soft rind, and color release. What process decision best respects those properties?",
          "Which workshop control prevents degradation while preserving dye consistency?",
          "The studio needs an outfit that closes the loop visibly. Which specification is strongest?",
          "Which collection unlock creates the clearest circular-economy outcome?",
          "A batch has strong pigment but inconsistent moisture. What audit decision should come first?",
          "The workshop has three viable pathways competing for time. Which decision reduces system risk?",
          "A partner asks for proof of usefulness, not just donation. Which handoff data matters most?",
        ], levelIndex),
        choices: pickByLevel([
          ["Tag clean fruits by palette as intake continues", "Combine all leftovers for later sorting", "Discard anything without immediate value"],
          ["Separated, labeled citrus and berry batches", "Mixed organics with no timestamp", "Unverified packaging residue"],
          ["Extract dye before textile application", "Force the rind into yarn", "Bypass scanning"],
          ["Calibrate heat, test swatches, and document the batch", "Increase heat until color changes", "Dry and dye at the same time"],
          ["Pixel jacket with repair patch and fruit label", "Unlabeled prototype", "Decor object with no use case"],
          ["Unlock the jacket in a collection with source story", "Store the item as a sample", "Send it to an undefined recipient"],
          ["Stabilize and log moisture before printing", "Print immediately to save time", "Blend it with unknown scraps"],
          ["Prioritize the pathway with verified properties", "Choose the fastest machine only", "Let all materials share one setting"],
          ["Recipient fit, repair plan, and source trace", "Total item count only", "A vague sustainability claim"],
        ], levelIndex),
        correct: 0,
        reward: 20,
      }),
    },
  };

  const state = {
    player: "Cycora maker",
    practice: true,
    ageGroup: "kids",
    currentLevel: 0,
    currentTask: 0,
    impact: 0,
    scrap: "",
    material: "",
    textile: "",
    product: {
      name: "Cozy red pixel hoodie",
      image: "eco-lab-kitchen-to-closet/assets/jacket-2.png",
    },
    recipient: "the new fruit fashion collection",
    completed: new Set(),
  };

  const els = {
    screens: Array.from(document.querySelectorAll(".screen")),
    levelList: document.getElementById("level-list"),
    statLevel: document.getElementById("stat-level"),
    statImpact: document.getElementById("stat-impact"),
    statTimer: document.getElementById("stat-timer"),
    playerName: document.getElementById("player-name"),
    ageInputs: Array.from(document.querySelectorAll('input[name="mobile-age"]')),
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

  function currentAgeProfile() {
    return ageProfiles[state.ageGroup] || ageProfiles.kids;
  }

  function cloneTask(task) {
    return {
      ...task,
      choices: [...task.choices],
      product: task.product ? { ...task.product } : undefined,
    };
  }

  function buildLevelsForAge(ageGroup) {
    const profile = ageProfiles[ageGroup] || ageProfiles.kids;
    return baseLevels.map((level, levelIndex) => {
      const tasks = level.tasks.map(cloneTask);
      const extra = profile.task(levelIndex);
      tasks.push({
        ...extra,
        reward: extra.reward + profile.extraReward,
      });
      if (ageGroup !== "kids") {
        tasks.forEach((task) => {
          const suffix = profile.choiceSuffix || [];
          task.choices = task.choices.concat(suffix).slice(0, ageGroup === "adults" ? 5 : 4);
        });
      }
      return {
        ...level,
        title: `${level.title} · ${profile.label}`,
        short: ageGroup === "kids" ? level.short : `${level.short} Harder choices, higher impact.`,
        tasks,
      };
    });
  }

  function readProgress() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      return {
        scores: Array.isArray(parsed.scores) ? parsed.scores : [],
        badges: Array.isArray(parsed.badges) ? parsed.badges : [],
      };
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
      state.scrap ? `${state.scrap} became a palette source` : "The fruit loop is moving",
      state.material ? `unlocked ${state.material}` : "and moved into the lab",
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
    els.resultStory.textContent = `Eco Maker unlocks the ${state.product.name.toLowerCase()} for ${state.recipient}, showing how fruit palettes can become crafted clothing pixel art.`;
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
    if (typeof els.board.close === "function") {
      els.board.close();
    } else {
      els.board.removeAttribute("open");
    }
  }

  function resetShift() {
    state.player = els.playerName.value.trim() || "Cycora maker";
    state.ageGroup = els.ageInputs.find((input) => input.checked)?.value || state.ageGroup || "kids";
    levels = buildLevelsForAge(state.ageGroup);
    state.currentLevel = 0;
    state.currentTask = 0;
    state.impact = 0;
    state.scrap = "";
    state.material = "";
    state.textile = "";
    state.recipient = "the new fruit fashion collection";
    state.completed = new Set();
    state.product = {
      name: "Cozy red pixel hoodie",
      image: "eco-lab-kitchen-to-closet/assets/jacket-2.png",
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
  els.ageInputs.forEach((input) => {
    input.addEventListener("change", () => {
      state.ageGroup = input.value;
      levels = buildLevelsForAge(state.ageGroup);
      renderMap();
      updateStats();
    });
  });
  els.practiceToggle.addEventListener("click", () => {
    state.practice = !state.practice;
    els.practiceToggle.classList.toggle("is-on", state.practice);
    els.practiceToggle.setAttribute("aria-pressed", String(state.practice));
    els.practiceToggle.textContent = state.practice ? "No timer" : "Focus timer";
    updateStats();
  });

  levels = buildLevelsForAge(state.ageGroup);
  renderMap();
  updateStats();
})();
