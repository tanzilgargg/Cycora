/**
 * Soft piano-style plucks for typing feedback (Web Audio API).
 * Shared by the Cycora browser games. No external assets.
 */
(function (global) {
  var ctx = null;

  function getCtx() {
    if (!ctx) {
      var Ctx = global.AudioContext || global.webkitAudioContext;
      if (!Ctx) return null;
      ctx = new Ctx();
    }
    return ctx;
  }

  /** Resume AudioContext after first user gesture (browser autoplay rules). */
  function resumeIfNeeded() {
    var ac = getCtx();
    if (ac && ac.state === "suspended") {
      ac.resume();
    }
    return ac;
  }

  /** C major pentatonic; repeats across ~3 octaves so a–z stays musical. */
  var PENT = [0, 2, 4, 7, 9];

  function freqForLetter(ch) {
    var i = ch.toLowerCase().charCodeAt(0) - 97;
    if (i < 0 || i > 25) return null;
    var idx = i % 15;
    var semi = PENT[idx % 5] + 12 * Math.floor(idx / 5);
    return 261.63 * Math.pow(2, semi / 12);
  }

  /**
   * @param {string} key - single character
   * @param {{ wrong?: boolean }} [opts]
   */
  function playKey(key, opts) {
    var wrong = opts && opts.wrong;
    var ac = resumeIfNeeded();
    if (!ac || !key || key.length !== 1) return;
    var freq = freqForLetter(key);
    if (freq == null) return;

    if (wrong) {
      freq *= 0.94;
    }

    var t0 = ac.currentTime;
    var dur = wrong ? 0.07 : 0.11;
    var peak = wrong ? 0.07 : 0.11;

    var osc1 = ac.createOscillator();
    var osc2 = ac.createOscillator();
    var g1 = ac.createGain();
    var g2 = ac.createGain();
    var master = ac.createGain();

    osc1.type = "triangle";
    osc2.type = "sine";
    osc1.frequency.setValueAtTime(freq, t0);
    osc2.frequency.setValueAtTime(freq * 2, t0);

    g1.gain.setValueAtTime(0, t0);
    g1.gain.linearRampToValueAtTime(peak * 0.85, t0 + 0.008);
    g1.gain.exponentialRampToValueAtTime(0.0008, t0 + dur + 0.04);

    g2.gain.setValueAtTime(0, t0);
    g2.gain.linearRampToValueAtTime(peak * 0.22, t0 + 0.01);
    g2.gain.exponentialRampToValueAtTime(0.0008, t0 + dur + 0.05);

    osc1.connect(g1);
    osc2.connect(g2);
    g1.connect(master);
    g2.connect(master);
    master.connect(ac.destination);

    osc1.start(t0);
    osc2.start(t0);
    osc1.stop(t0 + dur + 0.08);
    osc2.stop(t0 + dur + 0.08);
  }

  global.TypingPiano = {
    playKey: playKey,
    prime: resumeIfNeeded,
  };
})(typeof window !== "undefined" ? window : global);
