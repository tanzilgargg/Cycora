/**
 * Dialogue lines: intro, tutorial beats, transitions, results flavor
 */
const CycoraDialogue = {
  intro() {
    return [
      { speaker: "Mentor Rio", text: "Welcome to Cycora. In this cafe, food scraps can become colors, fibers, fabric, products, and community resources." },
      { speaker: "Mentor Rio", text: "Every move has its own word: peek at what’s lit above guests, stations, scanners, and machines, then type your choice." },
      { speaker: "Mentor Rio", text: "The big idea is transformation. Serve food, collect scraps, discover material potential, make textiles, then design useful products." },
      { speaker: "Mentor Rio", text: "Practice Mode removes the timer. Mistakes just point you toward the next better choice." },
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
      { speaker: "Mentor Rio", text: "Service is done. Now look closer: peels, grounds, husks, fibers, and pits each have different material powers." },
      { speaker: "Mentor Rio", text: "Scan the scrap, read the properties, and choose the path that fits." },
    ];
  },

  resultsGrade(stars) {
    if (stars >= 3) {
      return {
        speaker: "Mentor Rio",
        text: "That was a strong shift — you turned scraps into material, material into fabric, and fabric into something useful.",
      };
    }
    if (stars >= 2) {
      return {
        speaker: "Mentor Rio",
        text: "Not bad. Stronger process choices mean better fabric and more useful products.",
      };
    }
    return {
      speaker: "Mentor Rio",
      text: "Rough one — take a breath, skim the cards again, and we’ll run it smoother next time.",
    };
  },
};

window.CycoraDialogue = CycoraDialogue;
