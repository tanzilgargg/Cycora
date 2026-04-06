/**
 * Dialogue lines: intro, tutorial beats, transitions, results flavor
 */
const CycoraDialogue = {
  intro() {
    return [
      { speaker: "Mentor Rio", text: "Welcome to Cycora Kitchen. Extra food doesn’t just disappear here — we try to send it somewhere useful instead of the dump." },
      { speaker: "Mentor Rio", text: "Every move has its own word: peek at what’s lit above guests and stations, then type what you see." },
      { speaker: "Mentor Rio", text: "Serve the rush first. When that window closes, you’ll sort leftovers into four paths — not random trash cans, but where stuff can actually go next." },
      { speaker: "Mentor Rio", text: "Donation is for food that’s still good for people — it stays in the loop. Hit Space whenever you want to read my tips." },
    ];
  },

  firstOrderSoup() {
    return [
      { speaker: "Mentor Rio", text: "First guest wants tomato soup. Type the word above them to take the order." },
    ];
  },

  firstSandwich() {
    return [
      { speaker: "Mentor Rio", text: "Next table ordered a sandwich — pantry and plating go quick. When it’s time to serve, watch the pass." },
    ];
  },

  toWaste() {
    return [
      { speaker: "Mentor Rio", text: "Service is done. Now route each leftover: donation if it can still help people, compost for scraps, recycle for clean packaging, trash only when it’s actually ruined." },
      { speaker: "Mentor Rio", text: "Getting donation right keeps real value in the neighborhood. Read each card and pick what you think fits." },
    ];
  },

  resultsGrade(stars) {
    if (stars >= 3) {
      return {
        speaker: "Mentor Rio",
        text: "That was a strong shift — you fed people and you didn’t waste the leftovers. The loop’s fuller because of you.",
      };
    }
    if (stars >= 2) {
      return {
        speaker: "Mentor Rio",
        text: "Not bad. Tighter sorting = more stuff that can be reused or composted. Keep drilling the four bins.",
      };
    }
    return {
      speaker: "Mentor Rio",
      text: "Rough one — take a breath, skim the cards again, and we’ll run it smoother next time.",
    };
  },
};

window.CycoraDialogue = CycoraDialogue;
