/**
 * Eco Lab: Kitchen to Closet
 * Typing-driven conveyor game — circular economy prototype.
 * Separation: config → state → rendering → input handlers
 */

(function () {
  "use strict";

  // --- Configuration: materials, recipes, scoring ---
  /** Base path for SVG / image assets (swap in PNGs with the same filenames if you like). */
  const ASSETS = "assets/";

  function asset(file) {
    return ASSETS + file;
  }

  /** @typedef {{ id: string, label: string, image: string, story: string }} Material */
  /** @typedef {{ id: string, name: string, recipient: string, peoplePerItem: number, steps: string[], labels: string[], image: string }} Recipe */

  /** @type {Material[]} */
  const MATERIALS = [
    {
      id: "orange",
      label: "Orange peels",
      image: asset("material-orange.svg"),
      story: "Peels = extra plant stuff that can loop back into soil and experiments.",
    },
    {
      id: "avocado",
      label: "Avocado pits",
      image: asset("material-avocado.svg"),
      story: "Pits are weird little rocks you can prep for plant-based dyes later.",
    },
    {
      id: "banana",
      label: "Banana fibers",
      image: asset("material-banana.svg"),
      story: "Banana bits are basically a fiber source for community textile projects.",
    },
    {
      id: "corn",
      label: "Corn husks",
      image: asset("material-corn.svg"),
      story: "Husks = structure for pulp and mats — way better than the trash can.",
    },
    {
      id: "coffee",
      label: "Coffee grounds",
      image: asset("material-coffee.svg"),
      story: "Grounds stain stuff brown and feed gardens — win-win.",
    },
  ];

  /** Product art (reused across many random recipe rolls). */
  const PRODUCT_IMG = {
    tote: asset("product-tote.svg"),
    scarf: asset("product-scarf.svg"),
    blanket: asset("product-blanket.svg"),
  };

  const RECIPIENT_POOL = [
    "folks using the community fridge",
    "kids between homes",
    "people at the shelter",
    "newcomer welcome kits",
    "the mutual-aid closet",
    "the youth hiking crew",
    "seniors at lunch",
    "the downtown free store",
    "neighbors crashing somewhere short-term",
    "community fridge volunteers",
    "the warming center",
    "after-school sewing club",
  ];

  const NAMES = {
    tote: [
      "Woven tote",
      "Saturday market tote",
      "Canvas carryall",
      "Community swap tote",
      "Harvest tote",
      "Downtown shopper",
    ],
    scarf: [
      "Cozy scarf",
      "Hand-dyed scarf",
      "Winter wrap",
      "Kids’ neck warmer",
      "Color-block scarf",
      "Stripy muffler",
    ],
    blanket: [
      "Chunky blanket",
      "Shelter quilt",
      "Family blanket",
      "Heavy throw",
      "Community blanket",
      "Quilted throw",
    ],
  };

  /**
   * Step patterns × product kinds — each new order rolls one at random (name + recipient too).
   * @type {{ kind: keyof typeof PRODUCT_IMG, people: number, steps: string[], labels: string[] }[]}
   */
  const PATTERNS = [
    {
      kind: "tote",
      people: 3,
      steps: ["clean", "extract", "weave", "stitch", "pack"],
      labels: ["Wash", "Pull out", "Weave", "Sew", "Pack"],
    },
    {
      kind: "tote",
      people: 3,
      steps: ["sort", "clean", "extract", "weave", "stitch", "pack"],
      labels: ["Sort", "Wash", "Pull out", "Weave", "Sew", "Pack"],
    },
    {
      kind: "scarf",
      people: 2,
      steps: ["sort", "clean", "extract", "dye", "weave", "stitch", "pack"],
      labels: ["Sort", "Wash", "Pull out", "Dye", "Weave", "Sew", "Pack"],
    },
    {
      kind: "scarf",
      people: 2,
      steps: ["clean", "extract", "dye", "weave", "stitch", "pack"],
      labels: ["Wash", "Pull out", "Dye", "Weave", "Sew", "Pack"],
    },
    {
      kind: "scarf",
      people: 2,
      steps: ["sort", "clean", "extract", "weave", "stitch", "pack"],
      labels: ["Sort", "Wash", "Pull out", "Weave", "Sew", "Pack"],
    },
    {
      kind: "blanket",
      people: 5,
      steps: ["sort", "clean", "dry", "grind", "extract", "spin", "dye", "weave", "stitch", "pack"],
      labels: [
        "Sort",
        "Wash",
        "Dry",
        "Grind",
        "Pull out",
        "Spin",
        "Dye",
        "Weave",
        "Sew",
        "Pack",
      ],
    },
    {
      kind: "blanket",
      people: 4,
      steps: ["sort", "clean", "extract", "spin", "dye", "weave", "stitch", "pack"],
      labels: ["Sort", "Wash", "Pull out", "Spin", "Dye", "Weave", "Sew", "Pack"],
    },
    {
      kind: "blanket",
      people: 4,
      steps: ["clean", "dry", "grind", "extract", "dye", "weave", "stitch", "pack"],
      labels: ["Wash", "Dry", "Grind", "Pull out", "Dye", "Weave", "Sew", "Pack"],
    },
  ];

  function rollRandomRecipe() {
    const pat = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
    const kind = pat.kind;
    const img = PRODUCT_IMG[kind];
    const nameList = NAMES[kind];
    const name = nameList[Math.floor(Math.random() * nameList.length)];
    const recipient = RECIPIENT_POOL[Math.floor(Math.random() * RECIPIENT_POOL.length)];
    return {
      id: "r-" + Date.now().toString(36) + "-" + Math.floor(Math.random() * 10000),
      name: name,
      recipient: recipient,
      peoplePerItem: pat.people,
      steps: pat.steps.slice(),
      labels: pat.labels.slice(),
      image: img,
    };
  }

  /** Avoid an identical roll back-to-back when possible. */
  function pickRandomRecipe() {
    var next;
    var guard = 0;
    do {
      next = rollRandomRecipe();
      guard++;
    } while (
      state.activeRecipe &&
      next.name === state.activeRecipe.name &&
      next.recipient === state.activeRecipe.recipient &&
      next.steps.length === state.activeRecipe.steps.length &&
      guard < 20
    );
    state.activeRecipe = next;
  }

  const SCORE = {
    correctType: 12,
    delivery: 40,
    streakBonus: 4,
    speedBonusWindowMs: 4500,
    speedBonus: 6,
  };

  /** How each rescued input contributes to the textile (shown in conversion panel). */
  const MATERIAL_CONTRIBUTION = {
    orange: "Orange peel = plant fiber + oils — good for softer yarn and messing with natural dyes.",
    avocado: "Pits have starch and tannins — helps dye stick and fibers hold together.",
    banana: "Banana fiber is long and strong — you can actually spin and weave it.",
    corn: "Husks are chunky cellulose — pulp it and you can press mats or fake-yarn stuff.",
    coffee: "Grounds = warm browns and a bit of grit — folks blend them into recycled fiber batches.",
  };

  /**
   * Educational copy for each action: what changes in the conversion.
   * afterStep = what the batch *becomes* once this step is successfully completed.
   */
  const STEP_EXPLAIN = {
    sort: {
      title: "Sort it",
      body: "Toss what can’t turn into cloth; keep the bits that can — fiber, dye-y stuff, pulp.",
      afterStep: "Okay, now the pile isn’t chaos for the rest of the line.",
    },
    clean: {
      title: "Wash it",
      body: "Scrub off dirt and germs so the next steps don’t get messy — do this before you pull color or fiber.",
      afterStep: "Clean-ish (lol) — safe to run through machines or chemistry.",
    },
    dry: {
      title: "Dry it",
      body: "Even out the damp so grinders don’t clog and spins don’t slip.",
      afterStep: "Not a swamp, not dust — easier to grind and extract evenly.",
    },
    grind: {
      title: "Grind it",
      body: "Break husks/pits down so the good stuff can wash out next.",
      afterStep: "Even crumbs / pulp that won’t fight the extractor.",
    },
    extract: {
      title: "Pull stuff out",
      body: "Cellulose, color, sticky bits go into a slurry — kinda soup that becomes yarn or dye.",
      afterStep: "Thick fiber or color gunk — spin it, dye with it, or felt it.",
    },
    spin: {
      title: "Spin thread",
      body: "Twists fibers into one long string so weaving and sewing aren’t impossible.",
      afterStep: "Actual yarn on bobbins — starts feeling like real fabric.",
    },
    dye: {
      title: "Dye it",
      body: "Locks color into yarn or cloth — often from the same scraps you rescued.",
      afterStep: "Color that won’t vanish the second you rinse it.",
    },
    weave: {
      title: "Weave cloth",
      body: "Crosses threads into fabric — this is when a tote / scarf / blanket looks legit.",
      afterStep: "Flat cloth you can cut, fold, or sew.",
    },
    stitch: {
      title: "Sew it",
      body: "Panels, hems, handles — flat sheet turns into something you can hold.",
      afterStep: "Basically what the order asked for.",
    },
    pack: {
      title: "Pack it",
      body: "Wrap it so it survives shipping — label it for the shelf.",
      afterStep: "Ready for the neighborhood side.",
    },
  };

  // Map action word → visual stage class on belt item
  const ACTION_TO_STAGE = {
    sort: "stage-sorted",
    clean: "stage-clean",
    dry: "stage-clean",
    grind: "stage-extract",
    boil: "stage-extract",
    extract: "stage-extract",
    spin: "stage-weave",
    dye: "stage-dye",
    weave: "stage-weave",
    stitch: "stage-stitch",
    pack: "stage-pack",
    deliver: "stage-finished",
  };

  // --- DOM refs ---
  const el = {
    screenMenu: document.getElementById("screen-menu"),
    screenGame: document.getElementById("screen-game"),
    scene: document.getElementById("scene"),
    ecoMaker: document.getElementById("eco-maker"),
    fiberStations: document.getElementById("fiber-stations"),
    btnStart: document.getElementById("btn-start"),
    btnRestart: document.getElementById("btn-restart"),
    statTime: document.getElementById("stat-time"),
    statImpact: document.getElementById("stat-impact"),
    statItems: document.getElementById("stat-items"),
    statPeople: document.getElementById("stat-people"),
    statWaste: document.getElementById("stat-waste"),
    statStreak: document.getElementById("stat-streak"),
    requestItem: document.getElementById("request-item"),
    requestGroup: document.getElementById("request-group"),
    requestThumb: document.getElementById("request-thumb"),
    orderProgress: document.getElementById("order-progress"),
    orderProgressLabel: document.getElementById("order-progress-label"),
    communityPeople: document.getElementById("community-people"),
    communityDelivered: document.getElementById("community-delivered"),
    rackItems: document.getElementById("rack-items"),
    materialChip: document.getElementById("material-chip"),
    materialChipImg: document.getElementById("material-chip-img"),
    materialChipText: document.getElementById("material-chip-text"),
    conveyorBelt: document.getElementById("conveyor-belt"),
    beltItem: document.getElementById("belt-item"),
    beltItemVisual: document.getElementById("belt-item-visual"),
    beltItemImg: document.getElementById("belt-item-img"),
    outputSlot: document.getElementById("output-slot"),
    consoleInstruction: document.getElementById("console-instruction"),
    promptWord: document.getElementById("prompt-word"),
    typingInput: document.getElementById("typing-input"),
    feedbackStrip: document.getElementById("feedback-strip"),
    deliveryToast: document.getElementById("delivery-toast"),
    deliveryFly: document.getElementById("delivery-fly"),
    deliveryFlyImg: document.getElementById("delivery-fly-img"),
    conversionPanel: document.getElementById("conversion-panel"),
    conversionSummary: document.getElementById("conversion-summary"),
    conversionStepBadge: document.getElementById("conversion-step-badge"),
    conversionFromImg: document.getElementById("conversion-from-img"),
    conversionFromLabel: document.getElementById("conversion-from-label"),
    conversionMaterialRole: document.getElementById("conversion-material-role"),
    conversionToImg: document.getElementById("conversion-to-img"),
    conversionToLabel: document.getElementById("conversion-to-label"),
    conversionStepTitle: document.getElementById("conversion-step-title"),
    conversionStepBody: document.getElementById("conversion-step-body"),
    conversionOutcome: document.getElementById("conversion-outcome"),
    conversionNext: document.getElementById("conversion-next"),
    conversionDots: document.getElementById("conversion-dots"),
    conversionBridgeCap: document.getElementById("conversion-bridge-cap"),
    dialoguePanel: document.getElementById("dialogue-panel"),
    dialogueSpeaker: document.getElementById("dialogue-speaker"),
    dialogueText: document.getElementById("dialogue-text"),
  };

  /** @type {{ queue: { speaker: string, text: string }[], onDone: (function (): void) | null }} */
  var dialogueBuf = {
    queue: [],
    onDone: null,
  };

  function getEcoDialogue() {
    return typeof window !== "undefined" && window.EcoLabDialogue ? window.EcoLabDialogue : null;
  }

  function runDialogue(lines, onDone) {
    if (!lines || !lines.length) {
      if (onDone) onDone();
      return;
    }
    dialogueBuf.queue = lines.slice();
    dialogueBuf.onDone = onDone || null;
    state.inputLocked = true;
    if (el.dialoguePanel) {
      el.dialoguePanel.classList.remove("hidden");
      el.dialoguePanel.setAttribute("aria-hidden", "false");
    }
    advanceDialogueLine();
  }

  function advanceDialogueLine() {
    if (!dialogueBuf.queue.length) {
      if (el.dialoguePanel) {
        el.dialoguePanel.classList.add("hidden");
        el.dialoguePanel.setAttribute("aria-hidden", "true");
      }
      var cb = dialogueBuf.onDone;
      dialogueBuf.onDone = null;
      if (cb) cb();
      return;
    }
    var line = dialogueBuf.queue.shift();
    if (el.dialogueSpeaker) el.dialogueSpeaker.textContent = line.speaker;
    if (el.dialogueText) el.dialogueText.textContent = line.text;
  }

  function onDialogueKeydown(e) {
    if (!el.dialoguePanel || el.dialoguePanel.classList.contains("hidden")) return;
    var isSpace = e.key === " " || e.code === "Space";
    if (!isSpace) return;
    e.preventDefault();
    e.stopPropagation();
    advanceDialogueLine();
  }

  // --- Game state ---
  const state = {
    startedAt: 0,
    timerId: null,
    /** @type {Recipe | null} */
    activeRecipe: null,
    ordersCompleted: 0,
    material: /** @type {Material | null} */ (null),
    phase: /** @type {'conveyor' | 'delivery'} */ ("conveyor"),
    stepIndex: 0,
    impact: 0,
    itemsCreated: 0,
    peopleHelped: 0,
    wasteRescued: 0,
    streak: 0,
    itemsDelivered: 0,
    stepStartedAt: 0,
    inputLocked: false,
  };

  function currentRecipe() {
    return /** @type {Recipe} */ (state.activeRecipe);
  }

  function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ":" + (r < 10 ? "0" : "") + r;
  }

  function updateHUD() {
    const elapsed = state.startedAt ? Date.now() - state.startedAt : 0;
    el.statTime.textContent = formatTime(elapsed);
    el.statImpact.textContent = String(state.impact);
    el.statItems.textContent = String(state.itemsCreated);
    el.statPeople.textContent = String(state.peopleHelped);
    el.statWaste.textContent = String(state.wasteRescued);
    el.statStreak.textContent = String(state.streak);
    el.communityPeople.textContent = String(state.peopleHelped);
    el.communityDelivered.textContent = String(state.itemsDelivered);
  }

  function setFeedback(text, kind) {
    el.feedbackStrip.textContent = text;
    el.feedbackStrip.className =
      "typing-hint feedback-strip" + (kind ? " " + kind : "");
  }

  function setPromptHTML(word) {
    if (!word) {
      el.promptWord.innerHTML = '<span class="prompt-placeholder">—</span>';
      return;
    }
    el.promptWord.innerHTML = '<span class="highlight">' + escapeHtml(word) + "</span>";
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function pickMaterial() {
    const i = Math.floor(Math.random() * MATERIALS.length);
    state.material = MATERIALS[i];
  }

  function renderRequestCard() {
    const r = currentRecipe();
    el.requestItem.textContent = r.name;
    el.requestGroup.textContent = r.recipient;
    el.requestThumb.src = r.image;
    el.requestThumb.alt = r.name;
    var cycle = state.ordersCompleted % 10;
    el.orderProgress.style.width = ((cycle / 10) * 100).toString() + "%";
    el.orderProgressLabel.textContent =
      "Order " + (state.ordersCompleted + 1) + " · random build · " + r.steps.length + " steps";
  }

  function renderConversionDots(allComplete) {
    if (!el.conversionDots) return;
    const r = currentRecipe();
    el.conversionDots.innerHTML = "";
    const n = r.steps.length;
    for (let i = 0; i < n; i++) {
      const dot = document.createElement("span");
      dot.className = "conversion-dot";
      if (allComplete) {
        dot.classList.add("done");
      } else if (i < state.stepIndex) {
        dot.classList.add("done");
      } else if (i === state.stepIndex) {
        dot.classList.add("current");
      }
      dot.title = r.labels[i] || r.steps[i];
      el.conversionDots.appendChild(dot);
    }
  }

  /**
   * Full “waste → garment” readout: poles, step copy, after-state, next preview, dot track.
   * @param {{ complete?: boolean }} [opt]
   */
  function updateConversionReadout(opt) {
    if (!el.conversionPanel) return;
    const complete = opt && opt.complete;
    const r = currentRecipe();
    const mat = state.material;
    if (!mat) return;

    el.conversionFromImg.src = mat.image;
    el.conversionFromImg.alt = mat.label;
    el.conversionFromLabel.textContent = mat.label;
    el.conversionMaterialRole.textContent = MATERIAL_CONTRIBUTION[mat.id] || "";

    el.conversionToImg.src = r.image;
    el.conversionToImg.alt = r.name;
    el.conversionToLabel.textContent = r.name;

    el.conversionSummary.textContent =
      "You’re turning " +
      mat.label.toLowerCase() +
      " into a " +
      r.name.toLowerCase() +
      " — each station changes what’s on the belt.";

    if (complete) {
      el.conversionPanel.classList.add("conversion-complete");
      el.conversionStepBadge.textContent = "Line cleared";
      if (el.conversionBridgeCap) el.conversionBridgeCap.textContent = "Done";
      el.conversionStepTitle.textContent = "You ran the whole thing";
      el.conversionStepBody.textContent =
        "You started with " +
        mat.label.toLowerCase() +
        ", hit every step, and now it’s a real " +
        r.name.toLowerCase() +
        " — stick it on the shelf.";
      el.conversionOutcome.textContent = "Junk in → something wearable. Sick.";
      el.conversionNext.textContent = "";
      renderConversionDots(true);
      return;
    }

    el.conversionPanel.classList.remove("conversion-complete");
    const n = r.steps.length;
    const idx = state.stepIndex;
    el.conversionStepBadge.textContent = "Step " + (idx + 1) + " of " + n;
    if (el.conversionBridgeCap) el.conversionBridgeCap.textContent = "On belt";

    const word = r.steps[idx];
    const info = STEP_EXPLAIN[word] || {
      title: r.labels[idx] || word,
      body: "Run the batch through here so the line doesn’t stall.",
      afterStep: "Ready for the next step.",
    };

    el.conversionStepTitle.textContent = info.title;
    el.conversionStepBody.textContent = info.body;
    el.conversionOutcome.textContent = "After this step: " + info.afterStep;

    if (idx + 1 < n) {
      const nw = r.steps[idx + 1];
      const ni = STEP_EXPLAIN[nw];
      el.conversionNext.textContent =
        "Up next: " + (r.labels[idx + 1] || nw) + " — " + (ni ? ni.title : nw) + ".";
    } else {
      el.conversionNext.textContent = "Last step — then pack and ship it.";
    }

    renderConversionDots(false);
  }

  function stationImageForAction(word) {
    return asset("station-" + word + ".svg");
  }

  /** Kitchen Chaos–style station sprites — one per recipe step */
  function renderFiberStations() {
    const r = currentRecipe();
    el.fiberStations.innerHTML = "";
    r.steps.forEach(function (word, i) {
      const wrap = document.createElement("div");
      wrap.className = "sprite-interactive station-slot";
      wrap.dataset.stepIndex = String(i);
      const hit = document.createElement("button");
      hit.type = "button";
      hit.className = "sprite-hit";
      hit.setAttribute("aria-hidden", "true");
      hit.tabIndex = -1;
      const fx = document.createElement("div");
      fx.className = "sprite-fx-wrap";
      const img = document.createElement("img");
      img.className = "sprite-img";
      img.src = stationImageForAction(word);
      img.alt = "";
      img.addEventListener("error", function once() {
        img.removeEventListener("error", once);
        img.src = asset("station-sort.svg");
      });
      fx.appendChild(img);
      const lbl = document.createElement("span");
      lbl.className = "sprite-label";
      lbl.textContent = r.labels[i];
      wrap.appendChild(hit);
      wrap.appendChild(fx);
      wrap.appendChild(lbl);
      el.fiberStations.appendChild(wrap);
    });
    updateStationActive();
  }

  function updateStationActive() {
    const r = currentRecipe();
    const slots = el.fiberStations.querySelectorAll(".station-slot");
    slots.forEach(function (slot, i) {
      slot.classList.remove("active-target", "done-step");
      if (state.stepIndex >= r.steps.length) {
        slot.classList.add("done-step");
      } else if (i < state.stepIndex) {
        slot.classList.add("done-step");
      } else if (i === state.stepIndex) {
        slot.classList.add("active-target");
      }
    });
    positionEcoMaker();
  }

  function positionEcoMaker() {
    if (!el.ecoMaker || !el.scene) return;
    const scene = el.scene;
    const r = currentRecipe();
    const sr = scene.getBoundingClientRect();
    if (state.stepIndex >= r.steps.length) {
      el.ecoMaker.style.left = "50%";
      el.ecoMaker.style.bottom = "14%";
      el.ecoMaker.style.transform = "translateX(-50%)";
      return;
    }
    const active = el.fiberStations.querySelector(
      '.station-slot[data-step-index="' + state.stepIndex + '"]'
    );
    if (!active) {
      el.ecoMaker.style.left = "18%";
      el.ecoMaker.style.bottom = "14%";
      el.ecoMaker.style.transform = "translateX(-50%)";
      return;
    }
    const ar = active.getBoundingClientRect();
    const cx = ar.left + ar.width / 2 - sr.left;
    let leftPct = (cx / sr.width) * 100;
    leftPct = Math.max(8, Math.min(90, leftPct));
    el.ecoMaker.style.left = leftPct + "%";
    el.ecoMaker.style.bottom = "13%";
    el.ecoMaker.style.transform = "translateX(-50%)";
  }

  function beltPositionPercent() {
    const r = currentRecipe();
    const n = r.steps.length;
    if (n <= 1) return 50;
    const t = state.stepIndex >= n ? n : state.stepIndex;
    return 8 + (t / n) * 84;
  }

  function updateBeltItemPosition() {
    el.beltItem.style.left = beltPositionPercent() + "%";
  }

  /** Strip one-off animation classes so the next step can retrigger. */
  function stripBeltAnimClasses() {
    if (!el.beltItemVisual) return;
    var keep = el.beltItemVisual.className.split(/\s+/).filter(function (c) {
      return c.indexOf("belt-anim--") !== 0 && c !== "belt-anim-run";
    });
    el.beltItemVisual.className = keep.join(" ");
  }

  /**
   * Plays a short process animation matching the current action (food → fiber story beat).
   */
  function triggerBeltProcessAnim(word) {
    if (!el.beltItemVisual || !word) return;
    stripBeltAnimClasses();
    void el.beltItemVisual.offsetWidth;
    el.beltItemVisual.classList.add("belt-anim-run", "belt-anim--" + word);
    function onEnd() {
      el.beltItemVisual.classList.remove("belt-anim-run", "belt-anim--" + word);
      el.beltItemVisual.removeEventListener("animationend", onEnd);
    }
    el.beltItemVisual.addEventListener("animationend", onEnd, { once: true });
  }

  function setBeltVisualForStep() {
    const r = currentRecipe();
    const word = r.steps[state.stepIndex];
    const cls = ACTION_TO_STAGE[word] || "stage-raw";
    el.beltItemVisual.className = "belt-item-visual " + cls;
    const mat = state.material;
    if (el.beltItemImg && mat) {
      el.beltItemImg.src = mat.image;
      el.beltItemImg.alt = mat.label;
    }
    requestAnimationFrame(function () {
      triggerBeltProcessAnim(word);
    });
  }

  /**
   * New order: pick rescued material and start at first conveyor step.
   * @param {{ skipFocus?: boolean }} [opt]
   */
  function beginNewOrder(opt) {
    var skipFocus = opt && opt.skipFocus;
    state.phase = "conveyor";
    state.stepIndex = 0;
    pickRandomRecipe();
    renderRequestCard();
    pickMaterial();
    state.wasteRescued += 1;

    const r = currentRecipe();
    if (state.material && el.materialChipImg && el.materialChipText) {
      el.materialChipImg.src = state.material.image;
      el.materialChipImg.alt = state.material.label;
      el.materialChipText.textContent = state.material.label + " → this run";
    }
    el.consoleInstruction.textContent = "Type the lit word to move forward";
    setPromptHTML(r.steps[0]);
    setFeedback("", "");

    el.outputSlot.classList.remove("has-piece");
    el.outputSlot.innerHTML = '<span class="output-placeholder">Shows up after pack</span>';

    renderFiberStations();
    setBeltVisualForStep();
    updateBeltItemPosition();

    el.materialChip.classList.add("stage-pulse");
    setTimeout(function () {
      el.materialChip.classList.remove("stage-pulse");
    }, 600);

    if (el.ecoMaker) {
      el.ecoMaker.classList.add("state-pulse");
      setTimeout(function () {
        el.ecoMaker.classList.remove("state-pulse");
      }, 500);
    }

    state.stepStartedAt = Date.now();
    el.typingInput.value = "";
    if (!skipFocus) {
      el.typingInput.focus();
    }
    updateHUD();
    updateConversionReadout();
  }

  function addImpact(amount, reason) {
    state.impact += amount;
    if (state.impact < 0) state.impact = 0;
    updateHUD();
    if (reason && window.console && console.debug) console.debug(reason, amount);
  }

  function normalizeWord(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function handleConveyorInput(raw) {
    const r = currentRecipe();
    const expected = r.steps[state.stepIndex];
    const typed = normalizeWord(raw);
    if (!typed) return;

    if (typed !== expected) {
      state.streak = 0;
      setFeedback("Nope — try again", "err");
      addImpact(-3, "wrong word");
      updateHUD();
      state.inputLocked = true;
      setTimeout(function () {
        state.inputLocked = false;
        el.typingInput.value = "";
        el.typingInput.focus();
      }, 500);
      return;
    }

    // Speed bonus
    const dt = Date.now() - state.stepStartedAt;
    if (dt < SCORE.speedBonusWindowMs) {
      addImpact(SCORE.speedBonus, "speed");
    }
    addImpact(SCORE.correctType + state.streak, "correct type");
    state.streak += 1;
    setFeedback("Yup — next step", "ok");

    const doneSlot = el.fiberStations.querySelector(
      '.station-slot[data-step-index="' + state.stepIndex + '"]'
    );
    if (doneSlot) {
      doneSlot.classList.add("flash-success");
      setTimeout(function () {
        doneSlot.classList.remove("flash-success");
      }, 450);
    }

    state.stepIndex += 1;
    el.materialChip.classList.add("stage-pulse");
    setTimeout(function () {
      el.materialChip.classList.remove("stage-pulse");
    }, 400);

    if (state.stepIndex >= r.steps.length) {
      finishRecipe();
      return;
    }

    setPromptHTML(r.steps[state.stepIndex]);
    updateConversionReadout();
    updateStationActive();
    setBeltVisualForStep();
    updateBeltItemPosition();
    if (el.ecoMaker) {
      el.ecoMaker.classList.add("state-pulse");
      setTimeout(function () {
        el.ecoMaker.classList.remove("state-pulse");
      }, 420);
    }
    state.stepStartedAt = Date.now();
    el.typingInput.value = "";
    updateHUD();
  }

  function finishRecipe() {
    state.inputLocked = true;
    /** @type {Recipe} */
    const r = currentRecipe();
    updateConversionReadout({ complete: true });
    stripBeltAnimClasses();
    el.beltItemVisual.className = "belt-item-visual stage-finished";
    if (el.beltItemImg) {
      el.beltItemImg.src = r.image;
      el.beltItemImg.alt = r.name;
    }
    requestAnimationFrame(function () {
      el.beltItemVisual.classList.add("belt-anim-run", "belt-anim--complete");
      function done() {
        el.beltItemVisual.classList.remove("belt-anim-run", "belt-anim--complete");
        el.beltItemVisual.removeEventListener("animationend", done);
      }
      el.beltItemVisual.addEventListener("animationend", done, { once: true });
    });
    updateStationActive();
    updateBeltItemPosition();

    el.outputSlot.classList.add("has-piece");
    el.outputSlot.innerHTML = "";
    const outWrap = document.createElement("div");
    outWrap.className = "output-piece";
    const outImg = document.createElement("img");
    outImg.className = "output-thumb";
    outImg.src = r.image;
    outImg.alt = r.name;
    outImg.width = 48;
    outImg.height = 48;
    const outName = document.createElement("span");
    outName.className = "output-name";
    outName.textContent = r.name;
    outWrap.appendChild(outImg);
    outWrap.appendChild(outName);
    el.outputSlot.appendChild(outWrap);

    state.itemsCreated += 1;
    const helped = r.peoplePerItem;
    state.peopleHelped += helped;
    addImpact(SCORE.delivery + helped * 2, "delivery");

    setFeedback("Crushed it — sending it out", "done");
    updateHUD();

    state.phase = "delivery";
    runDeliveryAnimation(r.image, function () {
      state.itemsDelivered += 1;
      const li = document.createElement("li");
      const thumb = document.createElement("img");
      thumb.className = "rack-thumb";
      thumb.src = r.image;
      thumb.alt = "";
      thumb.width = 26;
      thumb.height = 26;
      const name = document.createElement("span");
      name.textContent = r.name;
      li.appendChild(thumb);
      li.appendChild(name);
      el.rackItems.appendChild(li);
      el.deliveryToast.textContent = "Delivered — " + r.name + " for " + r.recipient;
      el.deliveryToast.classList.remove("hidden");
      setTimeout(function () {
        el.deliveryToast.classList.add("hidden");
      }, 2800);

      state.ordersCompleted += 1;
      updateHUD();

      setTimeout(function () {
        var D = getEcoDialogue();
        state.inputLocked = true;
        if (D && typeof D.betweenOrders === "function") {
          runDialogue(D.betweenOrders(state.ordersCompleted), function () {
            beginNewOrder();
            state.inputLocked = false;
            el.typingInput.focus();
          });
        } else {
          state.inputLocked = false;
          beginNewOrder();
        }
      }, 900);
    });
  }

  /**
   * @param {string} imageSrc
   * @param {() => void} done
   */
  function runDeliveryAnimation(imageSrc, done) {
    const fly = el.deliveryFly;
    const rectOut = el.outputSlot.getBoundingClientRect();
    const rectRack = el.rackItems.getBoundingClientRect();

    fly.classList.remove("hidden", "animating");
    if (el.deliveryFlyImg) {
      el.deliveryFlyImg.src = imageSrc;
      el.deliveryFlyImg.alt = "";
    }
    fly.style.left = rectOut.left + rectOut.width / 2 - 28 + "px";
    fly.style.top = rectOut.top + rectOut.height / 2 - 28 + "px";

    const tx = rectRack.left + rectRack.width / 2 - (rectOut.left + rectOut.width / 2);
    const ty = rectRack.top + rectRack.height / 2 - (rectOut.top + rectOut.height / 2);
    fly.style.setProperty("--tx", tx + "px");
    fly.style.setProperty("--ty", ty + "px");

    requestAnimationFrame(function () {
      fly.classList.add("animating");
    });

    setTimeout(function () {
      fly.classList.add("hidden");
      fly.classList.remove("animating");
      done();
    }, 1100);
  }

  function onInputSubmit() {
    if (state.inputLocked) return;
    const v = el.typingInput.value;
    if (state.phase === "conveyor") {
      handleConveyorInput(v);
    }
  }

  function tick() {
    updateHUD();
  }

  function startGame() {
    if (typeof TypingPiano !== "undefined") TypingPiano.prime();
    el.screenMenu.classList.add("hidden");
    el.screenGame.classList.remove("hidden");
    state.startedAt = Date.now();
    state.ordersCompleted = 0;
    state.activeRecipe = null;
    state.impact = 0;
    state.itemsCreated = 0;
    state.peopleHelped = 0;
    state.wasteRescued = 0;
    state.streak = 0;
    state.itemsDelivered = 0;
    el.rackItems.innerHTML = "";
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = setInterval(tick, 500);
    updateHUD();

    var D = getEcoDialogue();
    if (D && typeof D.intro === "function") {
      runDialogue(D.intro(), function () {
        beginNewOrder({ skipFocus: true });
        if (D.firstShiftLine) {
          runDialogue(D.firstShiftLine(currentRecipe(), state.material), function () {
            state.inputLocked = false;
            el.typingInput.focus();
          });
        } else {
          state.inputLocked = false;
          el.typingInput.focus();
        }
      });
    } else {
      beginNewOrder();
      state.inputLocked = false;
      el.typingInput.focus();
    }
  }

  function restartGame() {
    state.ordersCompleted = 0;
    state.activeRecipe = null;
    state.impact = 0;
    state.itemsCreated = 0;
    state.peopleHelped = 0;
    state.wasteRescued = 0;
    state.streak = 0;
    state.itemsDelivered = 0;
    el.rackItems.innerHTML = "";
    updateHUD();

    var D = getEcoDialogue();
    if (D && typeof D.restartPing === "function") {
      runDialogue(D.restartPing(), function () {
        beginNewOrder();
        state.inputLocked = false;
        el.typingInput.focus();
        updateHUD();
      });
    } else {
      beginNewOrder();
      el.typingInput.focus();
    }
  }

  // --- Events ---
  document.addEventListener("keydown", onDialogueKeydown, true);

  el.btnStart.addEventListener("click", startGame);
  el.btnRestart.addEventListener("click", restartGame);

  el.typingInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      onInputSubmit();
      return;
    }
    if (el.dialoguePanel && !el.dialoguePanel.classList.contains("hidden")) return;
    if (state.inputLocked) return;
    if (e.key.length === 1 && /[a-zA-Z]/.test(e.key) && typeof TypingPiano !== "undefined") {
      TypingPiano.playKey(e.key, { wrong: false });
    }
  });

  // Prevent losing focus from breaking flow
  el.screenGame.addEventListener("click", function (e) {
    if (el.dialoguePanel && !el.dialoguePanel.classList.contains("hidden")) return;
    if (e.target.closest("button")) return;
    if (e.target === el.typingInput) return;
    el.typingInput.focus();
  });

  window.addEventListener("resize", function () {
    positionEcoMaker();
  });
})();
