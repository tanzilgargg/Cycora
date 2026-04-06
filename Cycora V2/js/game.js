/**
 * Cycora: Kitchen Chaos — state machine, service phase, waste phase, customers, orders
 */
class CycoraGame {
  constructor(els, options) {
    this.els = els;
    this.largePrompts = !!options.largePrompts;
    this.highContrast = !!options.highContrast;

    this.cfg = window.CycoraConfig;
    this.phaseCfg = this.cfg.rollPhaseTimings();

    this.state = "boot";
    this.dialogueQueue = [];
    this.serviceTimeLeft = 0;
    this.wasteTimeLeft = 0;
    this.spawnTimer = 0;
    this.nextSpawnIn = 3;

    this.customers = [];
    this.orders = [];
    this.nextCustomerId = 1;
    this.nextOrderId = 1;
    this.tutorialFlags = { soupHint: false, sandwichHint: false };
    this.spawnCount = 0;

    this.stats = {
      mealsServed: 0,
      ordersTaken: 0,
      missedCustomers: 0,
      wrongSorts: 0,
      correctSorts: 0,
      profit: 0,
      impact: 0,
      wasteSorted: 0,
      /** Correct sorts into donation — supports community reuse */
      transformationMaterials: 0,
      combo: 0,
      maxCombo: 0,
    };

    this.leftovers = [];
    this.currentLeftoverIndex = 0;

    this.activePrompt = null;
    this.chefPose = "idle";
    /** When set, closing dialogue returns here instead of starting a new service */
    this.resumeState = null;
    /** Skip re-applying typing target when unchanged (avoids resetting progress every frame) */
    this._promptSig = null;
    /** Until this time (sec), patience / waste timer pause for the current prompt */
    this._typingGraceUntil = null;

    this.typing = new TypingManager({
      allowBackspace: true,
      wordDisplayEl: els.wordDisplay,
      hintEl: els.typingHint,
      onComplete: (word) => this.onWordComplete(word),
      onMistake: () => this.onTypingMistake(),
    });

    this.wasteChoice = new ChoiceTypingManager({
      allowBackspace: true,
      wordDisplayEl: els.wordDisplay,
      hintEl: els.typingHint,
      onComplete: (w) => this.onWasteTyped(w),
      onMistake: () => this.onTypingMistake(),
    });

    this._tickBound = this.tick.bind(this);
    this._lastTs = 0;
    this.animationFrame = null;

    this.applyAccessibility();
  }

  applyAccessibility() {
    const v = this.els.viewport;
    v.classList.toggle("large-prompts", this.largePrompts);
    v.classList.toggle("high-contrast", this.highContrast);
  }

  graceSeconds() {
    const n = Number(this.cfg.typingGraceSeconds);
    return n > 0 ? n : 0;
  }

  isTypingGraceActive() {
    if (this._typingGraceUntil == null) return false;
    return performance.now() / 1000 < this._typingGraceUntil;
  }

  beginTypingGrace() {
    const g = this.graceSeconds();
    if (g > 0) this._typingGraceUntil = performance.now() / 1000 + g;
    else this._typingGraceUntil = null;
  }

  /** Extra hint line: timers are paused briefly for new prompts */
  graceHint(baseText) {
    const g = this.graceSeconds();
    if (g <= 0 || !baseText) return baseText;
    return `${baseText} · chill ${g}s — timers are frozen while you read`;
  }

  startIntroDialogue() {
    this.dialogueQueue = window.CycoraDialogue.intro().map((d) => ({ ...d }));
    this.state = "dialogue";
    this.showDialogue(true);
    this.updatePrompts();
    this.advanceDialogueLine();
  }

  showDialogue(visible) {
    this.els.dialoguePanel.classList.toggle("hidden", !visible);
  }

  advanceDialogueLine() {
    if (this.dialogueQueue.length === 0) {
      this.showDialogue(false);
      if (this.state === "dialogue") {
        if (this.resumeState === "service") {
          this.state = "service";
          this.resumeState = null;
          this.startLoop();
          this.updatePrompts();
          return;
        }
        this.beginServicePhase();
        return;
      }
      if (this.state === "dialogue_waste") {
        this.beginWastePhase();
        return;
      }
      if (this.state === "dialogue_post") {
        this.showResults();
      }
      return;
    }
    const line = this.dialogueQueue.shift();
    this.els.dialogueSpeaker.textContent = line.speaker;
    this.els.dialogueText.textContent = line.text;
  }

  onSpace() {
    if (this.state === "menu" || this.state === "results") return;

    if (this.state === "dialogue" || this.state === "dialogue_waste" || this.state === "dialogue_post") {
      this.advanceDialogueLine();
      return;
    }

    if (this.state === "transition_overlay") {
      return;
    }
  }

  beginServicePhase() {
    this.state = "service";
    this._typingGraceUntil = null;
    this.serviceTimeLeft = this.phaseCfg.service;
    this.spawnTimer = 0;
    this.nextSpawnIn = 2;
    this.spawnCount = 0;
    this.ensureTables();
    this.flashPhaseBanner("Rush hour — go go go");
    this.startLoop();
    this.refreshHUD();
    this.updatePrompts();
  }

  flashPhaseBanner(text) {
    const layer = this.els.fxLayer;
    const ov = document.createElement("div");
    ov.className = "phase-overlay";
    ov.innerHTML = `<div class="banner">${text}</div>`;
    layer.appendChild(ov);
    setTimeout(() => {
      ov.style.opacity = "0";
      setTimeout(() => ov.remove(), 400);
    }, 1200);
  }

  ensureTables() {
    const host = this.els.tablesContainer;
    host.innerHTML = "";
    const furnitureHtml = `
        <div class="dining-furniture">
          <img class="furniture-chair" src="assets/Chair.png" alt="" data-asset="Chair.png" />
          <img class="furniture-table" src="assets/Table.png" alt="" data-asset="Table.png" />
        </div>
      `;
    for (let i = 0; i < this.cfg.maxTables; i += 1) {
      const slot = document.createElement("div");
      slot.className = "table-slot";
      slot.dataset.table = String(i);
      slot.innerHTML = `
        <div class="customer-slot" id="customer-${i}"></div>
        ${furnitureHtml}
      `;
      host.appendChild(slot);
    }
    const decorN = Math.max(0, Math.floor(Number(this.cfg.decorativeSeatPairs) || 0));
    for (let j = 0; j < decorN; j += 1) {
      const slot = document.createElement("div");
      slot.className = "table-slot table-slot-decor";
      slot.setAttribute("aria-hidden", "true");
      slot.innerHTML = furnitureHtml;
      host.appendChild(slot);
    }
  }

  startLoop() {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this._lastTs = performance.now();
    this.animationFrame = requestAnimationFrame(this._tickBound);
  }

  stopLoop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  tick(ts) {
    const dt = Math.min(0.05, (ts - this._lastTs) / 1000);
    this._lastTs = ts;

    if (this.state === "service") {
      this.serviceTimeLeft -= dt;
      this.spawnTimer += dt;
      this.updateCustomers(dt);
      if (this.spawnTimer >= this.nextSpawnIn) {
        this.trySpawnCustomer();
        this.spawnTimer = 0;
        const { customerSpawnMin, customerSpawnMax } = this.phaseCfg;
        this.nextSpawnIn = customerSpawnMin + Math.random() * (customerSpawnMax - customerSpawnMin);
      }
      if (this.serviceTimeLeft <= 0) {
        this.serviceTimeLeft = 0;
        this.endServicePhase();
      }
    } else if (this.state === "waste") {
      if (!this.isTypingGraceActive()) {
        this.wasteTimeLeft -= dt;
      }
      if (this.wasteTimeLeft <= 0) {
        this.wasteTimeLeft = 0;
        this.endWastePhase();
      }
    }

    this.refreshHUD();
    this.animationFrame = requestAnimationFrame(this._tickBound);
  }

  trySpawnCustomer() {
    const emptyTable = this.findEmptyTable();
    if (emptyTable === -1) return;
    const dish = this.pickDishForSpawn();
    const c = this.createCustomer(emptyTable, dish);
    this.customers.push(c);
    this.renderCustomer(c);
  }

  findEmptyTable() {
    for (let i = 0; i < this.cfg.maxTables; i += 1) {
      if (!this.customers.some((c) => c.tableIndex === i && c.state !== "gone")) return i;
    }
    return -1;
  }

  pickDishForSpawn() {
    this.spawnCount += 1;
    if (this.spawnCount === 1) return "soup";
    if (this.spawnCount === 2) return "sandwich";
    const pool = this.cfg.randomDishPool;
    if (!pool || !pool.length) return "soup";
    return pool[Math.floor(Math.random() * pool.length)];
  }

  createCustomer(tableIndex, dish) {
    const id = this.nextCustomerId++;
    const maxP = this.phaseCfg.patience;
    return {
      id,
      tableIndex,
      dish,
      state: "entering",
      patience: maxP,
      maxPatience: maxP,
      enterTimer: 0.85,
      orderId: null,
    };
  }

  renderCustomer(c) {
    const wrap = document.getElementById(`customer-${c.tableIndex}`);
    if (!wrap) return;
    wrap.innerHTML = "";
    const el = document.createElement("div");
    el.className = "customer entering";
    el.dataset.cid = String(c.id);
    const colors = ["#6b8ce8", "#c76b9e", "#5cb8a8", "#c9a24d"];
    const color = colors[c.id % colors.length];
    el.innerHTML = `
      <div class="patience-bar"><div class="patience-fill" style="width:100%"></div></div>
      <div class="customer-head"></div>
      <div class="customer-body" style="background:${color}"></div>
      <div class="order-bubble empty" id="bubble-${c.id}">?</div>
      <div class="speech-order hidden" id="speech-${c.id}"></div>
    `;
    wrap.appendChild(el);
  }

  updateCustomers(dt) {
    for (const c of this.customers) {
      if (c.state === "gone") continue;

      if (c.state === "entering") {
        c.enterTimer -= dt;
        if (c.enterTimer <= 0) {
          c.state = "seated";
          c.seatTimer = 0.4 + Math.random() * 0.35;
        }
        continue;
      }

      if (c.state === "seated") {
        c.seatTimer -= dt;
        if (c.seatTimer <= 0) {
          c.state = "want_order";
          this.maybeEnqueueTutorialDialogue(c);
          this.showOrderSpeech(c);
        }
        continue;
      }

      if (c.state === "want_order" || c.state === "waiting_food") {
        if (!this.isTypingGraceActive()) {
          c.patience -= dt;
        }
        if (c.patience <= 0) {
          this.abandonCustomer(c);
        }
      }

      this.updatePatienceUI(c);
    }
    this.customers = this.customers.filter((c) => c.state !== "gone");
    this.updatePrompts();
  }

  maybeEnqueueTutorialDialogue(c) {
    if (c.dish === "soup" && !this.tutorialFlags.soupHint) {
      this.tutorialFlags.soupHint = true;
      this.pushDialogueFront(window.CycoraDialogue.firstOrderSoup());
    } else if (c.dish === "sandwich" && !this.tutorialFlags.sandwichHint) {
      this.tutorialFlags.sandwichHint = true;
      this.pushDialogueFront(window.CycoraDialogue.firstSandwich());
    }
  }

  pushDialogueFront(lines) {
    const incoming = lines.map((d) => ({ ...d }));
    if (this.state === "service") {
      this.resumeState = "service";
      this.dialogueQueue = incoming.concat(this.dialogueQueue);
      this.state = "dialogue";
      this.showDialogue(true);
      this.typing.clear();
      this.wasteChoice.clear();
      this.stopLoop();
      this.updatePrompts();
      this.advanceDialogueLine();
      return;
    }
    this.dialogueQueue = incoming.concat(this.dialogueQueue);
  }

  showOrderSpeech(c) {
    if (!c.orderPromptWord) {
      c.orderPromptWord = window.cycoraPick(this.cfg.wordPools.order);
    }
    const sp = document.getElementById(`speech-${c.id}`);
    if (!sp) return;
    sp.textContent = c.orderPromptWord.toUpperCase();
    sp.classList.remove("hidden");
  }

  updatePatienceUI(c) {
    const el = document.querySelector(`[data-cid="${c.id}"]`);
    if (!el) return;
    const bar = el.querySelector(".patience-fill");
    if (!bar) return;
    const pct = Math.max(0, (c.patience / c.maxPatience) * 100);
    bar.style.width = `${pct}%`;
    bar.classList.toggle("low", pct < 35);
    const head = el.querySelector(".customer-head");
    if (head) {
      head.classList.remove("customer-face-happy", "customer-face-sad");
      if (c.state === "eating") head.classList.add("customer-face-happy");
      else if (
        pct < 35 &&
        (c.state === "want_order" || c.state === "waiting_food")
      ) {
        head.classList.add("customer-face-sad");
      }
    }
  }

  abandonCustomer(c) {
    if (c.state === "want_order" || c.state === "waiting_food") {
      this.stats.missedCustomers += 1;
      this.stats.impact += this.cfg.impact.missedCustomer;
      this.stats.combo = 0;
      if (c.orderId) {
        const o = this.orders.find((x) => x.id === c.orderId);
        if (o) o.cancelled = true;
      }
    }
    c.state = "gone";
    const wrap = document.getElementById(`customer-${c.tableIndex}`);
    if (wrap) wrap.innerHTML = "";
    this.updatePrompts();
  }

  endServicePhase() {
    this.stopLoop();
    this._typingGraceUntil = null;
    this.typing.clear();
    this.wasteChoice.clear();
    this.clearStationHighlights();
    this.clearPromptAnchors();
    for (const c of this.customers) {
      if (c.state !== "gone") this.abandonCustomer(c);
    }
    this.orders = [];
    this.dialogueQueue = window.CycoraDialogue.toWaste().map((d) => ({ ...d }));
    this.state = "dialogue_waste";
    this.showDialogue(true);
    this.updatePrompts();
    this.advanceDialogueLine();
  }

  fillRecoveryLegend() {
    const host = document.getElementById("recovery-legend-body");
    if (!host || host.dataset.filled === "1") return;
    host.dataset.filled = "1";
    host.innerHTML = this.cfg.recoveryChannels
      .map(
        (c) =>
          `<p><strong>${c.label}</strong> — ${c.playerGuide}</p>`,
      )
      .join("");
  }

  beginWastePhase() {
    this.state = "waste";
    this._typingGraceUntil = null;
    this.wasteTimeLeft = this.phaseCfg.waste;
    this.buildLeftovers();
    this.fillRecoveryLegend();
    const titleEl = document.getElementById("recovery-dock-title");
    if (titleEl) titleEl.textContent = this.cfg.recoveryCopy.dockTitle;
    this.els.wasteDock.classList.remove("hidden");
    if (this.els.screenGame) this.els.screenGame.classList.add("waste-phase");
    this.flashPhaseBanner(this.cfg.recoveryCopy.phaseBanner);
    this.currentLeftoverIndex = 0;
    this.updateWasteUI();
    this.updatePrompts();
    this.startLoop();
  }

  buildLeftovers() {
    const n = 5 + Math.floor(Math.random() * 3);
    const pool = [
      {
        bin: "donation",
        icon: "\u{1F35E}",
        hint: "Still good — someone could eat this. Donation keeps it in the community loop.",
      },
      {
        bin: "donation",
        icon: "\u{1F966}",
        hint: "Packaged leftovers that are still safe — fine for donation, not for the compost pile.",
      },
      {
        bin: "compost",
        icon: "\u{1F346}",
        hint: "Veggie scraps — won’t work as a meal, but perfect for compost.",
      },
      {
        bin: "compost",
        icon: "\u{1F33F}",
        hint: "Coffee grounds / peels — chuck in compost, not the blue bin.",
      },
      {
        bin: "recycle",
        icon: "\u{1F4E6}",
        hint: "Clean cardboard or packaging — dry enough that recycling can handle it.",
      },
      {
        bin: "recycle",
        icon: "\u{267B}",
        hint: "Rinsed can or bottle — no gunk stuck inside.",
      },
      {
        bin: "trash",
        icon: "\u{1F37D}",
        hint: "Gross mixed plate scrap — too contaminated for donation or compost.",
      },
      {
        bin: "trash",
        icon: "\u{1F9F2}",
        hint: "Greasy plastic wrap — basically unrecyclable; trash it.",
      },
    ];
    this.leftovers = [];
    for (let i = 0; i < n; i += 1) {
      const pick = pool[Math.floor(Math.random() * pool.length)];
      this.leftovers.push({
        id: i,
        correctBin: pick.bin,
        icon: pick.icon,
        hint: pick.hint,
      });
    }
  }

  updateWasteUI() {
    const slot = this.els.leftoverSlot;
    const cur = this.leftovers[this.currentLeftoverIndex];
    if (!cur) {
      slot.innerHTML = `<p class="leftover-meta">All sorted!</p>`;
      this.els.wasteHint.textContent =
        "That’s the whole pile — nice. What you picked changes how much actually gets reused.";
      return;
    }
    slot.innerHTML = `
      <div class="leftover-card leftover-card-recovery">
        <span class="leftover-icon">${cur.icon}</span>
        <p class="leftover-meta">${cur.hint}</p>
      </div>
    `;
    this.els.wasteHint.textContent =
      "Where should this go? Type donation, compost, recycle, or trash — donation is for food people can still use.";
  }

  endWastePhase() {
    if (this.state !== "waste") return;
    while (this.currentLeftoverIndex < this.leftovers.length) {
      this.stats.impact += this.cfg.impact.sortWrong;
      this.stats.wrongSorts += 1;
      this.currentLeftoverIndex += 1;
    }
    try {
      localStorage.setItem(
        "cycora_transformation_materials",
        String(this.stats.transformationMaterials),
      );
    } catch (_) {
      /* ignore quota / private mode */
    }
    this.state = "dialogue_post";
    this.els.wasteDock.classList.add("hidden");
    if (this.els.screenGame) this.els.screenGame.classList.remove("waste-phase");
    this._typingGraceUntil = null;
    this.typing.clear();
    this.wasteChoice.clear();
    this.clearStationHighlights();
    this.clearPromptAnchors();

    const stars = this.computeStars();
    const grade = window.CycoraDialogue.resultsGrade(stars);
    this.dialogueQueue = [grade];
    this.showDialogue(true);
    this.updatePrompts();
    this.advanceDialogueLine();
  }

  computeStars() {
    let s = 1;
    if (this.stats.mealsServed >= 3) s += 1;
    if (this.stats.correctSorts >= 4 && this.stats.wrongSorts <= 1) s += 1;
    if (this.stats.missedCustomers === 0 && this.stats.mealsServed >= 4) s += 1;
    if (this.stats.transformationMaterials >= 4) s += 1;
    return Math.min(5, s);
  }

  showResults() {
    this.state = "results";
    this.stopLoop();
    this.showDialogue(false);
    this.els.screenGame.classList.add("hidden");
    this.els.screenResults.classList.remove("hidden");

    const stars = this.computeStars();
    this.els.resultsStars.textContent = "\u2605".repeat(stars) + "\u2606".repeat(5 - stars);

    const items = [
      ["Meals you got out", String(this.stats.mealsServed)],
      ["Guests you lost", String(this.stats.missedCustomers)],
      ["Sorts you nailed", String(this.stats.correctSorts)],
      ["Sorts you missed", String(this.stats.wrongSorts)],
      [
        "Donation-bound stuff",
        String(this.stats.transformationMaterials),
      ],
      ["Money in the drawer", `$${this.stats.profit}`],
      ["Impact points", String(this.stats.impact)],
      ["Longest combo", String(this.stats.maxCombo)],
    ];
    this.els.resultsStats.innerHTML = items
      .map(([k, v]) => `<li><span>${k}</span><strong>${v}</strong></li>`)
      .join("");

    this.els.resultsFlavor.textContent =
      "Here, leftovers aren’t invisible — you routed them somewhere. Stuff you donated can still feed people. Keep leaning on that bin when it fits.";
  }

  restartToMenu() {
    this.els.screenResults.classList.add("hidden");
    this.els.screenMenu.classList.remove("hidden");
    this.state = "menu";
  }

  /** Stable id for the current typing task — only full refresh when this changes */
  computePromptSignature() {
    if (this.state === "dialogue" || this.state === "dialogue_waste" || this.state === "dialogue_post") {
      return `D|${this.state}`;
    }
    if (this.state === "waste") {
      const cur = this.leftovers[this.currentLeftoverIndex];
      if (!cur) return "W|done";
      return `W|${this.currentLeftoverIndex}|${cur.correctBin}`;
    }
    if (this.state !== "service") {
      return `X|${this.state}`;
    }
    const op = this.findOrderTakingPrompt();
    if (op) {
      const w = op.customer.orderPromptWord || "pending";
      return `S|ord|${op.customer.id}|${w}`;
    }
    const pr = this.findPrepPrompt();
    if (pr) {
      const { word } = this.getOrAssignStepWord(pr.order);
      return `S|prep|${pr.order.id}|${pr.station}|${pr.order.stepIndex}|${word}`;
    }
    const sv = this.findServePrompt();
    if (sv) {
      const { word } = this.getOrAssignStepWord(sv.order);
      return `S|srv|${sv.order.id}|${word}`;
    }
    return "S|idle";
  }

  getOrAssignStepWord(order) {
    const steps = this.cfg.recipeSteps[order.dish];
    const i = order.stepIndex;
    if (i >= steps.length) return { station: null, word: "" };
    const station = steps[i];
    if (!order.stepWords) order.stepWords = {};
    const k = `${i}|${station}`;
    if (!order.stepWords[k]) {
      const pool = this.cfg.wordPools[station];
      order.stepWords[k] = window.cycoraPick(pool);
    }
    return { station, word: order.stepWords[k] };
  }

  /** Resolve next typing target */
  updatePrompts() {
    const nextSig = this.computePromptSignature();
    if (nextSig === this._promptSig) return;
    this._promptSig = nextSig;

    this.clearPromptAnchors();
    this.clearStationHighlights();

    if (this.state === "dialogue" || this.state === "dialogue_waste" || this.state === "dialogue_post") {
      this._typingGraceUntil = null;
      this.typing.clear();
      this.wasteChoice.clear();
      this.els.typingLabel.textContent = "Reading — Space for next line";
      return;
    }

    if (this.state === "waste") {
      const cur = this.leftovers[this.currentLeftoverIndex];
      if (!cur) {
        this._typingGraceUntil = null;
        this.typing.clear();
        this.wasteChoice.clear();
        this.els.typingLabel.textContent = "All sorted";
        return;
      }
      this.typing.clear();
      this.activePrompt = { kind: "waste", leftover: cur };
      this.els.typingLabel.textContent = "Pick a bin — type the word";
      this.highlightBins();
      this.setChefPose("at-waste");
      this.wasteChoice.setChoices(this.cfg.sortTypeWords);
      this.beginTypingGrace();
      this.els.typingHint.textContent = this.graceHint(
        "donation · compost · recycle · trash — donation = still-good food for people.",
      );
      return;
    }

    if (this.state !== "service") {
      this.typing.clear();
      this.wasteChoice.clear();
      return;
    }

    this.wasteChoice.clear();

    const orderPrompt = this.findOrderTakingPrompt();
    if (orderPrompt) {
      this.applyCustomerPrompt(orderPrompt);
      return;
    }

    const prep = this.findPrepPrompt();
    if (prep) {
      this.applyStationPrompt(prep);
      return;
    }

    const serve = this.findServePrompt();
    if (serve) {
      this.applyServePrompt(serve);
      return;
    }

    this.activePrompt = null;
    this._typingGraceUntil = null;
    this.typing.setTarget("", "Hang tight for the next guest…");
    this.els.typingLabel.textContent = "Waiting";
    this.setChefPose("idle");
  }

  findOrderTakingPrompt() {
    const candidates = this.customers.filter((c) => c.state === "want_order");
    if (candidates.length === 0) return null;
    candidates.sort((a, b) => a.patience - b.patience);
    return { customer: candidates[0] };
  }

  findPrepPrompt() {
    const activeOrders = this.orders.filter((o) => !o.cancelled && !o.done);
    const needs = [];
    for (const o of activeOrders) {
      const steps = this.cfg.recipeSteps[o.dish];
      const idx = o.stepIndex;
      if (idx >= steps.length) continue;
      const station = steps[idx];
      if (station === "serve") continue;
      const cust = this.customers.find((c) => c.id === o.customerId);
      const urgency = cust ? cust.patience : 0;
      needs.push({ order: o, station, urgency });
    }
    if (needs.length === 0) return null;
    needs.sort((a, b) => a.urgency - b.urgency);
    return needs[0];
  }

  findServePrompt() {
    const activeOrders = this.orders.filter((o) => !o.cancelled && !o.done);
    for (const o of activeOrders) {
      const steps = this.cfg.recipeSteps[o.dish];
      if (o.stepIndex < steps.length && steps[o.stepIndex] === "serve") {
        const cust = this.customers.find((c) => c.id === o.customerId);
        return { order: o, customer: cust };
      }
    }
    return null;
  }

  applyCustomerPrompt({ customer }) {
    if (!customer.orderPromptWord) {
      customer.orderPromptWord = window.cycoraPick(this.cfg.wordPools.order);
    }
    const word = customer.orderPromptWord;
    this.activePrompt = { kind: "order", customer, word };
    this.els.typingLabel.textContent = "Grab the order";
    this.highlightCustomer(customer.id);
    this.setChefPose("at-serve");
    this.beginTypingGrace();
    this.typing.setTarget(word, this.graceHint(`Table ${customer.tableIndex + 1}`));
  }

  applyStationPrompt({ order, station }) {
    const { word } = this.getOrAssignStepWord(order);
    this.activePrompt = { kind: "prep", order, station, word };
    const stationLabels = {
      fridge: "Fridge",
      pantry: "Pantry",
      chop: "Chopping block",
      stove: "Stove",
      sink: "Sink",
      plate: "Plating counter",
    };
    this.els.typingLabel.textContent = `Line — ${stationLabels[station] || station}`;
    this.highlightStation(station);
    this.setChefPose(`at-${station}`);
    const dish =
      this.cfg.dishLabels && this.cfg.dishLabels[order.dish]
        ? this.cfg.dishLabels[order.dish]
        : order.dish;
    this.beginTypingGrace();
    this.typing.setTarget(word, this.graceHint(`${dish} · step ${order.stepIndex + 1}`));
    const anchor = document.getElementById(`prompt-${station}`);
    if (anchor) anchor.innerHTML = `<span class="prompt-chip">${word}</span>`;
  }

  applyServePrompt({ order, customer }) {
    const { word } = this.getOrAssignStepWord(order);
    this.activePrompt = { kind: "serve", order, customer, word };
    this.els.typingLabel.textContent = "Bring it out";
    this.highlightStation("serve");
    if (customer) this.highlightCustomer(customer.id);
    this.setChefPose("at-serve");
    this.beginTypingGrace();
    this.typing.setTarget(
      word,
      this.graceHint(`Table ${customer ? customer.tableIndex + 1 : "?"}`),
    );
    const anchor = document.getElementById("prompt-serve");
    if (anchor) anchor.innerHTML = `<span class="prompt-chip">${word}</span>`;
  }

  onWordComplete() {
    const p = this.activePrompt;
    if (!p) return;

    if (p.kind === "order") {
      const c = p.customer;
      c.state = "waiting_food";
      c.patience = Math.min(c.maxPatience, c.patience + 4);
      const sp = document.getElementById(`speech-${c.id}`);
      if (sp) sp.classList.add("hidden");
      const bubble = document.getElementById(`bubble-${c.id}`);
      if (bubble) {
        bubble.textContent = this.cfg.dishEmoji[c.dish];
        bubble.classList.remove("empty");
      }
      const order = {
        id: this.nextOrderId++,
        customerId: c.id,
        dish: c.dish,
        stepIndex: 0,
        cancelled: false,
        done: false,
      };
      c.orderId = order.id;
      this.orders.push(order);
      this.stats.ordersTaken += 1;
      this.bumpCombo();
      this.floatScore(document.getElementById(`customer-${c.tableIndex}`), "Order!", true);
      this.updateQueueUI();
      this.updatePrompts();
      return;
    }

    if (p.kind === "prep") {
      const o = p.order;
      o.stepIndex += 1;
      this.fxPrep(p.station);
      this.bumpCombo();
      this.floatScore(document.getElementById(`station-${p.station}`), "Nice", true);
      this.updateQueueUI();
      this.updatePrompts();
      return;
    }

    if (p.kind === "serve") {
      const o = p.order;
      o.done = true;
      o.stepIndex += 1;
      const c = this.customers.find((x) => x.id === o.customerId);
      if (c) {
        c.state = "eating";
        c.patience = c.maxPatience;
        setTimeout(() => {
          if (c.state === "eating") {
            c.state = "gone";
            const wrap = document.getElementById(`customer-${c.tableIndex}`);
            if (wrap) wrap.innerHTML = "";
          }
        }, 2.8);
      }
      this.stats.mealsServed += 1;
      const profit = this.cfg.rollMealProfit();
      this.stats.profit += profit + this.stats.combo * this.cfg.impact.comboBonusPerTier;
      this.stats.impact += this.cfg.impact.meal + this.stats.combo;
      this.bumpCombo();
      this.floatScore(this.els.stationServe, `+$${profit}`, true);
      this.updateQueueUI();
      this.updatePrompts();
    }
  }

  binIdForTypedSortWord(w) {
    const def = this.cfg.recoveryChannels.find((b) => b.typeWord === w);
    return def ? def.id : null;
  }

  onWasteTyped(typeWord) {
    if (this.state !== "waste") return;
    const cur = this.leftovers[this.currentLeftoverIndex];
    if (!cur) return;

    const chosen = this.binIdForTypedSortWord(typeWord);
    const ok = chosen != null && chosen === cur.correctBin;
    const channel = chosen != null ? this.cfg.recoveryChannels.find((c) => c.id === chosen) : null;

    this.stats.wasteSorted += 1;

    if (ok) {
      this.stats.correctSorts += 1;
      const bonus = channel ? channel.impactOnCorrect : 6;
      this.stats.impact += bonus;
      if (cur.correctBin === "donation") {
        this.stats.transformationMaterials += 1;
      }
      this.bumpCombo();
      const msg = channel ? channel.feedbackCorrect : "Nice — sorted";
      const celebrate = chosen === "donation";
      this.floatScore(this.els.wasteDock, msg, true, celebrate);
    } else {
      this.stats.wrongSorts += 1;
      this.stats.impact += this.cfg.impact.sortWrong;
      this.stats.combo = 0;
      this.refreshHUD();
      this.floatScore(this.els.wasteDock, "Wrong bin", false, false);
    }

    this.currentLeftoverIndex += 1;
    this.updateWasteUI();
    this.stationPulse("bin");
    if (this.currentLeftoverIndex >= this.leftovers.length) {
      this.endWastePhase();
    } else {
      this._promptSig = null;
      this.updatePrompts();
    }
  }

  onTypingMistake() {
    this.stats.combo = 0;
    this.refreshHUD();
  }

  bumpCombo() {
    this.stats.combo += 1;
    this.stats.maxCombo = Math.max(this.stats.maxCombo, this.stats.combo);
  }

  handleTypingKey(e) {
    if (this.state === "dialogue" || this.state === "dialogue_waste" || this.state === "dialogue_post") {
      return;
    }
    if (this.state === "waste") {
      this.wasteChoice.handleKeydown(e);
      return;
    }
    this.typing.handleKeydown(e);
  }

  floatScore(anchor, text, good, celebrate) {
    if (!anchor) return;
    const fx = this.els.fxLayer;
    const r = anchor.getBoundingClientRect();
    const vr = this.els.viewport.getBoundingClientRect();
    const el = document.createElement("div");
    el.className = "float-score";
    if (celebrate) el.classList.add("float-score-strong");
    if (!good) el.classList.add("float-score-weak");
    el.textContent = text;
    el.style.left = `${r.left - vr.left + r.width / 2}px`;
    el.style.top = `${r.top - vr.top}px`;
    el.style.color = good ? "" : "#f88";
    fx.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }

  highlightCustomer(cid) {
    const el = document.querySelector(`[data-cid="${cid}"]`);
    if (el) el.style.filter = "drop-shadow(0 0 8px rgba(232,168,56,0.9))";
  }

  highlightStation(station) {
    const map = {
      fridge: this.els.stationFridge,
      pantry: this.els.stationPantry,
      chop: this.els.stationChop,
      stove: this.els.stationStove,
      sink: this.els.stationSink,
      plate: this.els.stationPlate,
      serve: this.els.stationServe,
    };
    const el = map[station];
    if (el) el.classList.add("active-target");
  }

  highlightBins() {
    this.cfg.recoveryChannels.forEach((b) => {
      const binEl = document.getElementById(`bin-${b.id}`);
      if (binEl) binEl.classList.add("active-target");
      const pa = document.getElementById(`prompt-${b.id}`);
      if (pa) {
        pa.innerHTML = `<span class="prompt-chip">${b.typeWord}</span><span class="prompt-chip-sub">${b.roleShort}</span>`;
      }
    });
  }

  clearStationHighlights() {
    document.querySelectorAll(".active-target").forEach((n) => n.classList.remove("active-target"));
    document.querySelectorAll(".customer").forEach((n) => {
      n.style.filter = "";
    });
  }

  clearPromptAnchors() {
    document.querySelectorAll(".prompt-anchor").forEach((a) => {
      a.innerHTML = "";
    });
  }

  setChefPose(pose) {
    const chef = this.els.chefAvatar;
    chef.className = "chef-avatar";
    if (pose === "idle") return;
    const slug = pose.replace(/^at-/, "");
    chef.classList.add(`at-${slug}`);
    if (slug === "chop") chef.classList.add("state-chop");
    if (slug === "stove") chef.classList.add("state-cook");
    if (slug === "serve") chef.classList.add("state-serve");
    if (slug === "sink") chef.classList.add("state-sink");
  }

  fxPrep(station) {
    const el = document.getElementById(`station-${station}`);
    const wrap = el ? el.querySelector(".sprite-fx-wrap") : null;
    if (station === "stove" && wrap) {
      wrap.classList.add("fx-steam");
      setTimeout(() => wrap.classList.remove("fx-steam"), 1400);
    }
    if (station === "plate" && wrap) {
      wrap.classList.add("fx-sparkle");
      setTimeout(() => wrap.classList.remove("fx-sparkle"), 900);
    }
    if (station === "sink" && wrap) {
      wrap.classList.add("fx-ripple");
      setTimeout(() => wrap.classList.remove("fx-ripple"), 1000);
    }
    if (el) {
      el.classList.add("flash-success");
      setTimeout(() => el.classList.remove("flash-success"), 500);
    }
  }

  stationPulse() {
    /* optional */
  }

  updateQueueUI() {
    const ul = this.els.queueList;
    ul.innerHTML = "";
    for (const o of this.orders) {
      if (o.cancelled || o.done) continue;
      const c = this.customers.find((x) => x.id === o.customerId);
      const steps = this.cfg.recipeSteps[o.dish];
      const st = steps[o.stepIndex] || "done";
      const stepLabels = {
        fridge: "fridge",
        pantry: "pantry",
        chop: "chop",
        stove: "stove",
        sink: "sink",
        plate: "plate",
        serve: "serve",
      };
      const li = document.createElement("li");
      li.innerHTML = `<span>${this.cfg.dishEmoji[o.dish]}</span><span>T${c ? c.tableIndex + 1 : "?"} · ${stepLabels[st] || st}</span>`;
      ul.appendChild(li);
    }
  }

  refreshHUD() {
    const t =
      this.state === "service"
        ? Math.max(0, this.serviceTimeLeft).toFixed(0)
        : this.state === "waste"
          ? Math.max(0, this.wasteTimeLeft).toFixed(0)
          : "—";
    this.els.hudTimer.textContent = t + "s";
    this.els.hudProfit.textContent = `$${this.stats.profit}`;
    this.els.hudImpact.textContent = String(this.stats.impact);
    this.els.hudMeals.textContent = String(this.stats.mealsServed);
    this.els.hudWaste.textContent = String(this.stats.wasteSorted);
    const redirectLab = document.getElementById("hud-redirect-label");
    if (redirectLab && this.cfg.recoveryCopy) {
      redirectLab.textContent = this.cfg.recoveryCopy.hudRedirectLabel;
    }
    this.els.hudCombo.textContent = this.stats.combo > 0 ? String(this.stats.combo) : "—";
  }
}

window.CycoraGame = CycoraGame;
