/**
 * Typing: single-target prompts (service) + multi-choice prefix typing (waste bins)
 */
class TypingManager {
  constructor(options) {
    this.allowBackspace = options.allowBackspace ?? false;
    this.onComplete = options.onComplete ?? (() => {});
    this.onMistake = options.onMistake ?? (() => {});
    this.target = "";
    this.index = 0;
    this.wrongStreak = 0;
    this.el = options.wordDisplayEl;
    this.hintEl = options.hintEl ?? null;
  }

  setTarget(word, hint) {
    this.target = (word || "").toLowerCase();
    this.index = 0;
    this.wrongStreak = 0;
    if (this.hintEl) this.hintEl.textContent = hint || "";
    this.render();
  }

  clear() {
    this.target = "";
    this.index = 0;
    if (this.el) this.el.innerHTML = "";
    if (this.hintEl) this.hintEl.textContent = "";
  }

  hasTarget() {
    return this.target.length > 0;
  }

  handleKeydown(e) {
    if (!this.target) return false;

    if (e.key === " " || e.key === "Spacebar") {
      return false;
    }

    if (e.key === "Backspace") {
      if (this.allowBackspace && this.index > 0) {
        e.preventDefault();
        this.index -= 1;
        this.render();
        return true;
      }
      e.preventDefault();
      return true;
    }

    if (e.key.length !== 1 || !/[a-zA-Z]/.test(e.key)) {
      return false;
    }

    e.preventDefault();
    const expected = this.target[this.index];
    const typed = e.key.toLowerCase();

    if (typed === expected) {
      if (globalThis.TypingPiano) globalThis.TypingPiano.playKey(e.key, { wrong: false });
      this.index += 1;
      this.wrongStreak = 0;
      this.render();
      if (this.index >= this.target.length) {
        const w = this.target;
        this.target = "";
        this.index = 0;
        this.onComplete(w);
      }
      return true;
    }

    if (globalThis.TypingPiano) globalThis.TypingPiano.playKey(e.key, { wrong: true });
    this.wrongStreak += 1;
    this.onMistake();
    this.flashWrongAt(this.index);
    return true;
  }

  flashWrongAt(i) {
    if (!this.el) return;
    const spans = this.el.querySelectorAll(".ch");
    const node = spans[i];
    if (!node) return;
    node.classList.remove("wrong");
    void node.offsetWidth;
    node.classList.add("wrong");
    setTimeout(() => node.classList.remove("wrong"), 280);
  }

  render() {
    if (!this.el) return;
    const t = this.target;
    this.el.innerHTML = "";
    for (let i = 0; i < t.length; i += 1) {
      const span = document.createElement("span");
      span.className = "ch";
      span.textContent = t[i];
      if (i < this.index) span.classList.add("correct");
      else span.classList.add("pending");
      this.el.appendChild(span);
    }
  }
}

/**
 * Type any one of several words; buffer must stay a prefix of at least one option.
 */
class ChoiceTypingManager {
  constructor(options) {
    this.words = [];
    this.buffer = "";
    this.allowBackspace = options.allowBackspace ?? true;
    this.onComplete = options.onComplete ?? (() => {});
    this.onMistake = options.onMistake ?? (() => {});
    this.el = options.wordDisplayEl;
    this.hintEl = options.hintEl ?? null;
  }

  setChoices(words) {
    this.words = (words || []).map((w) => String(w).toLowerCase());
    this.buffer = "";
    this.render();
    if (this.hintEl) {
      this.hintEl.textContent = `Your choice — type: ${this.words.join(" · ")}`;
    }
  }

  clear() {
    this.words = [];
    this.buffer = "";
    if (this.el) this.el.innerHTML = "";
    if (this.hintEl) this.hintEl.textContent = "";
  }

  handleKeydown(e) {
    if (this.words.length === 0) return false;

    if (e.key === " " || e.key === "Spacebar") {
      return false;
    }

    if (e.key === "Backspace") {
      if (this.allowBackspace && this.buffer.length > 0) {
        e.preventDefault();
        this.buffer = this.buffer.slice(0, -1);
        this.render();
        return true;
      }
      e.preventDefault();
      return true;
    }

    if (e.key.length !== 1 || !/[a-zA-Z]/.test(e.key)) {
      return false;
    }

    e.preventDefault();
    const next = this.buffer + e.key.toLowerCase();
    const prefixOk = this.words.some((w) => w.startsWith(next));
    if (!prefixOk) {
      if (globalThis.TypingPiano) globalThis.TypingPiano.playKey(e.key, { wrong: true });
      this.onMistake();
      this.buffer = "";
      this.render();
      return true;
    }

    if (globalThis.TypingPiano) globalThis.TypingPiano.playKey(e.key, { wrong: false });
    this.buffer = next;
    this.render();
    const exact = this.words.find((w) => w === this.buffer);
    if (exact) {
      this.buffer = "";
      this.onComplete(exact);
    }
    return true;
  }

  render() {
    if (!this.el) return;
    this.el.innerHTML = "";
    for (let i = 0; i < this.buffer.length; i += 1) {
      const span = document.createElement("span");
      span.className = "ch correct";
      span.textContent = this.buffer[i];
      this.el.appendChild(span);
    }
    const pending = document.createElement("span");
    pending.className = "ch pending";
    pending.textContent = "\u00a0";
    pending.style.opacity = "0.35";
    this.el.appendChild(pending);
  }
}

window.TypingManager = TypingManager;
window.ChoiceTypingManager = ChoiceTypingManager;