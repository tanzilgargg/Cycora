/**
 * Eco Lab lines — casual student-ish voice, same Cycora world as Kitchen Chaos (Rio shows up).
 * Consumed by script.js; advance with Space like the restaurant game.
 */
const EcoLabDialogue = {
  intro() {
    return [
      {
        speaker: "Rio",
        text: "Hey — closet side of Cycora. Kitchen Chaos was the meal; here we’re messing with scraps after the plate.",
      },
      {
        speaker: "Jules (lab)",
        text: "Same deal: type the word that matches the station that’s glowing. Your little maker walks the line with you.",
      },
      {
        speaker: "Rio",
        text: "Watch the batch on the belt. Each step is a real textile move — sort, wash, spin, dye, whatever the recipe needs.",
      },
      {
        speaker: "Jules (lab)",
        text: "Space = next line of tips. When the box closes, type your first word and Enter to send it. Let’s roll.",
      },
    ];
  },

  /**
   * @param {{ name: string, steps: string[] }} recipe
   * @param {{ label: string } | null} material
   */
  firstShiftLine(recipe, material) {
    const mat = material && material.label ? material.label : "this batch";
    const first = recipe.steps && recipe.steps[0] ? recipe.steps[0] : "sort";
    return [
      {
        speaker: "Jules (lab)",
        text:
          "Okay — you’ve got " +
          mat +
          " and you’re trying to finish a " +
          recipe.name +
          ". First word to type is \"" +
          first +
          "\" — it’s the glow above your head.",
      },
    ];
  },

  /** One quick line when you hit Start over — no full intro. */
  restartPing() {
    return [
      {
        speaker: "Jules (lab)",
        text: "Reset — new random order. Read the glow, type the word, Enter. You’ve got it.",
      },
    ];
  },

  /**
   * Between finished deliveries; `justCompleted` is state.ordersCompleted after the rack updates.
   */
  betweenOrders(justCompleted) {
    const pool = [
      {
        speaker: "Jules (lab)",
        text: "That one’s done. Next batch is already rolling — see what you rescued this time.",
      },
      {
        speaker: "Rio",
        text: "Nice — block gets another real piece. Stay on the highlighted station.",
      },
      {
        speaker: "Jules (lab)",
        text: "Keep the streak if you can — fast, clean types bump your score.",
      },
      {
        speaker: "Rio",
        text: "Typo happens; don’t spiral. Read the prompt again and retype.",
      },
    ];
    if (justCompleted === 1) {
      return [
        {
          speaker: "Jules (lab)",
          text: "First drop — that’s literally scraps → something wearable. Ready for the next line?",
        },
      ];
    }
    var i = Math.floor(Math.random() * pool.length);
    return [pool[i]];
  },
};

window.EcoLabDialogue = EcoLabDialogue;
