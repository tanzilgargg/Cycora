/**
 * Cycora: Kitchen Chaos — random word pools, circular-economy recovery channels
 */
function cycoraPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function cycoraRandRange(min, max) {
  return min + Math.random() * (max - min);
}

const CycoraConfig = {
  viewport: { width: 1280, height: 720 },

  /** UI framing — not “municipal bins,” but redirect paths into the Cycora network */
  recoveryCopy: {
    dockTitle: "Sort the leftovers",
    dockSubtitle: "Pick where each scrap should go in Cycora — not just ‘trash’ by default.",
    phaseBanner: "Leftover sort",
    hudRedirectLabel: "Sorted",
  },

  /**
   * Four recovery channels (order = display left-to-right: transformation-first).
   * Type words stay: donation, compost, recycle, trash.
   * correctBin on leftovers uses id.
   */
  recoveryChannels: [
    {
      id: "donation",
      typeWord: "donation",
      /** Visual bin art in assets/ (recovery phase only — guests use abstract avatars). */
      binSprite: "Yellow.png",
      label: "Donation",
      role: "Transformation",
      roleShort: "→ Reuse",
      impactOnCorrect: 9,
      feedbackCorrect: "Went to reuse",
      playerGuide:
        "Type donation when the food is still okay for people — sealed, not sketchy — so it can go to community programs instead of the bin.",
    },
    {
      id: "compost",
      typeWord: "compost",
      binSprite: "Green.png",
      label: "Compost",
      role: "Organic cycle",
      roleShort: "Soil path",
      impactOnCorrect: 6,
      feedbackCorrect: "Back to soil",
      playerGuide:
        "Type compost for peels, cores, coffee grounds — stuff that won’t feed people but can rot into compost instead of landfill.",
    },
    {
      id: "recycle",
      typeWord: "recycle",
      binSprite: "Blue.png",
      label: "Recycle",
      role: "Material recovery",
      roleShort: "Mills",
      impactOnCorrect: 5,
      feedbackCorrect: "Sent to recycling",
      playerGuide:
        "Type recycle for rinsed cans, bottles, clean cardboard — dry-ish packaging that a facility can actually process.",
    },
    {
      id: "trash",
      typeWord: "trash",
      binSprite: "Red.png",
      label: "Trash",
      role: "Final discard",
      roleShort: "Last resort",
      impactOnCorrect: 2,
      feedbackCorrect: "Trashed (last resort)",
      playerGuide:
        "Type trash when it’s greasy, mixed, or unsafe — nothing left to donate, compost, or recycle cleanly.",
    },
  ],

  get sortTypeWords() {
    return this.recoveryChannels.map((c) => c.typeWord);
  },

  /** Legacy lookup — use recoveryChannels */
  get sortBinDefs() {
    return this.recoveryChannels;
  },

  /**
   * After each *new* typing prompt appears, guest patience and the recovery timer
   * stay paused for this many seconds so players can read and learn — you can type anytime.
   */
  typingGraceSeconds: 10,

  rollPhaseTimings() {
    return {
      /** Service rush length (seconds) — fixed 120s */
      service: 120,
      waste: cycoraRandRange(75, 110),
      customerSpawnMin: cycoraRandRange(12, 16),
      customerSpawnMax: cycoraRandRange(17, 24),
      patience: cycoraRandRange(140, 200),
    };
  },

  wordPools: {
    order: [
      "order",
      "listen",
      "hello",
      "greet",
      "welcome",
      "ready",
      "hi",
      "chef",
    ],
    fridge: [
      "fresh",
      "chill",
      "cool",
      "tomato",
      "stock",
      "grab",
      "pull",
      "open",
    ],
    pantry: [
      "bread",
      "grain",
      "shelf",
      "dry",
      "crate",
      "fetch",
      "load",
      "jar",
    ],
    chop: [
      "slice",
      "chop",
      "dice",
      "mince",
      "prep",
      "cut",
      "trim",
      "cube",
    ],
    stove: [
      "cook",
      "boil",
      "simmer",
      "heat",
      "fry",
      "warm",
      "steam",
      "sear",
    ],
    plate: [
      "plate",
      "dress",
      "finish",
      "style",
      "build",
      "layer",
      "mound",
      "top",
    ],
    sink: [
      "rinse",
      "wash",
      "scrub",
      "splash",
      "drain",
      "soap",
      "clean",
      "wet",
    ],
    serve: [
      "serve",
      "deliver",
      "carry",
      "pass",
      "run",
      "bring",
      "hand",
      "send",
    ],
  },

  /**
   * Each dish is a station sequence (same keys as wordPools).
   * Keep paths plausible; shorter recipes = faster tables.
   */
  recipeSteps: {
    soup: ["fridge", "chop", "sink", "stove", "plate", "serve"],
    sandwich: ["pantry", "chop", "sink", "plate", "serve"],
    salad: ["fridge", "chop", "sink", "plate", "serve"],
    pasta: ["pantry", "chop", "stove", "sink", "plate", "serve"],
    bowl: ["fridge", "pantry", "chop", "stove", "plate", "serve"],
    toast: ["pantry", "chop", "stove", "plate", "serve"],
    wrap: ["pantry", "chop", "plate", "serve"],
    eggs: ["fridge", "stove", "plate", "serve"],
    fries: ["pantry", "chop", "stove", "plate", "serve"],
  },

  /** Shown in typing grace hints (prep steps). */
  dishLabels: {
    soup: "Tomato soup",
    sandwich: "Sandwich",
    salad: "Garden salad",
    pasta: "Pasta plate",
    bowl: "Grain bowl",
    toast: "Toast plate",
    wrap: "Wrap",
    eggs: "Eggs",
    fries: "Fries",
  },

  dishEmoji: {
    soup: "\u{1F372}",
    sandwich: "\u{1F96A}",
    salad: "\u{1F957}",
    pasta: "\u{1F35D}",
    bowl: "\u{1F963}",
    toast: "\u{1F35E}",
    wrap: "\u{1F32F}",
    eggs: "\u{1F373}",
    fries: "\u{1F35F}",
  },

  /** Guests 1–2 stay soup / sandwich for tutorial; after that, random from this list. */
  randomDishPool: [
    "soup",
    "sandwich",
    "salad",
    "pasta",
    "bowl",
    "toast",
    "wrap",
    "eggs",
    "fries",
  ],

  rollMealProfit() {
    return Math.round(cycoraRandRange(11, 19));
  },

  impact: {
    meal: 3,
    sortWrong: -5,
    missedCustomer: -6,
    comboBonusPerTier: 2,
  },

  maxTables: 6,
  /** Extra table+chair pairs (no guests) to visually fill the dining room */
  decorativeSeatPairs: 10,
};

window.CycoraConfig = CycoraConfig;
window.cycoraPick = cycoraPick;
