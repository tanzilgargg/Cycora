/**
 * Dialogue lines: intro, tutorial beats, transitions, results flavor
 */
const CycoraDialogue = {
  intro() {
    return [
      { speaker: "Mentor Rio", text: "Welcome to Eco Lab: Fruit Fashion Pixel Craft. Fruits can become colors, fibers, textures, and clothing pixel art." },
      { speaker: "Mentor Rio", text: "Every move has its own word: peek at what’s lit above guests, stations, scanners, and machines, then type your choice." },
      { speaker: "Mentor Rio", text: "The big idea is transformation. Receive fruit, sort the process words, make natural materials, then complete fashion pixels." },
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
      { speaker: "Mentor Rio", text: "Now look closer: strawberries, blueberries, oranges, bananas, and avocados each carry different fashion powers." },
      { speaker: "Mentor Rio", text: "Scan the fruit, read the palette properties, and choose the process path that fits." },
    ];
  },

  resultsGrade(stars) {
    if (stars >= 3) {
      return {
        speaker: "Mentor Rio",
        text: "That was a strong craft run — you turned fruit into material, material into texture, and texture into fashion pixel art.",
      };
    }
    if (stars >= 2) {
      return {
        speaker: "Mentor Rio",
        text: "Not bad. Stronger process choices mean cleaner palettes, better texture, and sharper outfit pixels.",
      };
    }
    return {
      speaker: "Mentor Rio",
      text: "Rough one — take a breath, skim the cards again, and we’ll run it smoother next time.",
    };
  },
};

window.CycoraDialogue = CycoraDialogue;
