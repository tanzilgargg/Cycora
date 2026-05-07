/**
 * Cycora mini-game progression.
 * One reusable typing runner powers short, kid-friendly levels across the cafe,
 * recipe rush, material discovery lab, fabric workshop, product studio, and final loop.
 */
class CycoraGame {
  constructor(els, options) {
    this.els = els;
    this.cfg = window.CycoraConfig;
    this.largePrompts = !!options.largePrompts;
    this.highContrast = !!options.highContrast;
    this.practiceMode = !!options.practiceMode;
    this.levels = this.createLevels();
    this.levelIndex = 0;
    this.currentLevel = null;
    this.tasks = [];
    this.taskIndex = 0;
    this.state = "map";
    this.timeLeft = 0;
    this.timer = null;
    this.activePrompt = null;
    this.result = null;
    this.stats = this.emptyStats();
    this.unlocked = this.readUnlocked();
    this.currentAchievement = null;
    this.boardPausedTimer = false;
    this.playerName = this.readPlayerName();
    this.ageGroup = this.readAgeGroup();
    this.visibleCustomers = [];
    this.dialogueLineIndex = 0;

    this.typing = new TypingManager({
      allowBackspace: true,
      wordDisplayEl: els.wordDisplay,
      hintEl: els.typingHint,
      onComplete: (word) => this.onWordComplete(word),
      onMistake: () => this.onTypingMistake(),
    });

    this.choiceTyping = new ChoiceTypingManager({
      allowBackspace: true,
      wordDisplayEl: els.wordDisplay,
      hintEl: els.typingHint,
      onComplete: (word) => this.onChoiceComplete(word),
      onMistake: () => this.onTypingMistake(),
    });

    this.prepareProgressionUI();
    this.applyAccessibility();
  }

  emptyStats() {
    return {
      typed: 0,
      mistakes: 0,
      helped: 0,
      saved: 0,
      meals: 0,
      products: 0,
      decisions: 0,
      recoveryScore: 100,
      qualityScore: 100,
      fairnessScore: 100,
      correctSorts: 0,
      wrongSorts: 0,
      recipesCompleted: [],
      materialsRescued: [],
      productsMade: [],
      sortExplanations: [],
      loopEvents: [],
      scrapMemories: [],
      achievements: [],
      scrapsCollected: [],
      materialsDiscovered: [],
      textilesCreated: [],
      communityImpacts: [],
      lastProduct: "",
      lastTextile: "",
      currentScrap: "",
      stars: 0,
      sticker: "",
      circularScore: 0,
    };
  }

  applyAccessibility() {
    this.els.viewport.classList.toggle("large-prompts", this.largePrompts);
    this.els.viewport.classList.toggle("high-contrast", this.highContrast);
  }

  readUnlocked() {
    const saved = Number(localStorage.getItem("cycora_kid_progress_unlocked"));
    if (Number.isFinite(saved) && saved >= 1) return 1;
    return 1;
  }

  saveUnlocked(n) {
    this.unlocked = Math.max(this.unlocked, Math.min(n, this.levels.length));
    localStorage.setItem("cycora_kid_progress_unlocked", String(this.unlocked));
  }

  readPlayerName() {
    return localStorage.getItem("cycora_player_name") || "";
  }

  savePlayerName(value) {
    this.playerName = String(value || "").trim().slice(0, 24) || "Cycora Maker";
    localStorage.setItem("cycora_player_name", this.playerName);
    return this.playerName;
  }

  readAgeGroup() {
    const saved = localStorage.getItem("cycora_age_group");
    return ["kids", "teens", "adults"].includes(saved) ? saved : "";
  }

  saveAgeGroup(value) {
    this.ageGroup = ["kids", "teens", "adults"].includes(value) ? value : "";
    if (this.ageGroup) localStorage.setItem("cycora_age_group", this.ageGroup);
    else localStorage.removeItem("cycora_age_group");
    this.applyAgeDefaults();
    this.renderLevelMap();
    return this.ageGroup;
  }

  ageProfile() {
    return (
      {
        kids: {
          label: "Kids",
          hudLabel: "Kids",
          scoreLabel: "Kindness score",
          infoDuration: 1850,
          guideWord: "next",
          mistakeHint: "Almost there. Try the glowing letter.",
          correctFeedback: "Great work!",
          showCompetitiveScore: false,
        },
        teens: {
          label: "Teens",
          hudLabel: "Teens",
          scoreLabel: "Competitive score",
          extraChoices: ["audit", "route", "batch", "impact", "verify", "optimize"],
          infoDuration: 1150,
          guideWord: "continue",
          mistakeHint: "Reset and recover the streak.",
          correctFeedback: "Clean move.",
          showCompetitiveScore: true,
        },
        adults: {
          label: "Adults",
          hudLabel: "Adult sim",
          scoreLabel: "Simulation score",
          extraChoices: ["assess", "calibrate", "document", "allocate", "stabilize", "validate"],
          infoDuration: 2200,
          guideWord: "next",
          mistakeHint: "No rush. Adjust the process and continue.",
          correctFeedback: "Process updated.",
          showCompetitiveScore: false,
        },
      }[this.ageGroup] || {
        label: "Choose age group",
        hudLabel: "Pick age",
        scoreLabel: "Circular score",
        infoDuration: 1500,
        guideWord: "next",
        mistakeHint: "Take your time. Look at the highlighted letters and try the next one.",
        correctFeedback: "Nice!",
        showCompetitiveScore: false,
      }
    );
  }

  applyAgeDefaults() {
    const practice = document.getElementById("opt-practice-mode");
    if (!practice || !this.ageGroup) return;
    practice.checked = this.ageGroup !== "teens";
  }

  createLevels() {
    const storyLevels = [
      {
        id: 1,
        title: "Act I: First Cafe Shift",
        mapName: "First Cafe Shift",
        icon: "Cafe",
        act: "The ordinary cafe",
        area: "Dining room queue",
        goal: "Start the lunch rush and notice that every meal leaves a material trace.",
        seconds: 70,
        sticker: "First Shift Maker",
        builder: () => [
          this.guideTask(
            "First Cafe Shift",
            "You are the new maker on your first full shift at Cycora.",
            [
              "Guests arrive and the cafe feels ordinary.",
              "Mentor Rio watches the scraps as closely as the orders.",
              "Serve each guest, then look for the material trace left behind.",
              "Every peel, pit, rind, husk, and ground has a second life waiting.",
            ],
            "The day begins with service, but the story is really about attention."
          ),
          this.customerPeek([
            { name: "Maya", table: 1, dish: "salad", scrap: "orange and lemon peels" },
            { name: "Leo", table: 2, dish: "toast", scrap: "avocado pits" },
            { name: "Amira", table: 3, dish: "bowl", scrap: "banana peels" },
          ]),
          this.decisionTask("customer", "maya", ["maya", "leo", "amira"], "Maya is highlighted. Maya wants citrus salad.", "Good. Maya is first.", { table: 1, dish: "salad" }),
          this.serveTask("salad", 1, "Serve citrus salad to Maya and save the peel memory."),
          this.decisionTask("customer", "leo", ["leo", "amira"], "Leo is highlighted. Leo wants avocado toast.", "Good. Leo is next.", { table: 2, dish: "toast" }),
          this.serveTask("toast", 2, "Serve avocado toast to Leo and keep the pit."),
          this.decisionTask("customer", "amira", ["amira"], "Amira is highlighted. Amira wants a banana grain bowl.", "Good. Amira is next.", { table: 3, dish: "bowl" }),
          this.serveTask("bowl", 3, "Serve the banana bowl to Amira and collect the fibrous peel."),
          this.scrapReveal("Material traces from service", ["orange peels", "lemon peels", "avocado pits", "banana peels"], "The cafe starts to change: these scraps are not garbage, they are evidence."),
          this.guideTask("Before Results", "Lunch service is running.", ["You served meals.", "You saved the first traces.", "Rio says the hidden part of Cycora opens after closing."], "Press Next to continue the day."),
        ],
      },
      {
        id: 2,
        title: "Act I: Lunch Rush Traces",
        mapName: "Lunch Rush Traces",
        icon: "Rush",
        act: "Meals leave clues",
        area: "Recipe rail",
        goal: "Build the rush menu and collect the exact scrap each recipe leaves behind.",
        seconds: 80,
        sticker: "Trace Collector",
        builder: () => [
          this.guideTask(
            "Lunch Rush Traces",
            "Now the rush gets faster and the material trail gets clearer.",
            [
              "Follow each recipe from pantry to stove to plate.",
              "Save the scrap that belongs to the meal.",
              "The origin of a scrap will matter later in the lab.",
            ],
            "You finish when the menu has created a full set of material traces."
          ),
          this.recipeIntro("Citrus salad", ["fridge", "sink", "chop", "plate"], "Creates lemon and orange peels."),
          this.stationChoice("fridge", ["fridge", "pantry"], "Start with chilled citrus and greens."),
          this.stationChoice("sink", ["sink", "stove", "chop"], "Wash before chopping. Stove is busy."),
          this.stationChoice("chop", ["chop", "plate"], "Missing step: Fridge -> Sink -> ? -> Plate."),
          this.stationChoice("plate", ["plate", "stove"], "Finish the cold salad."),
          this.scrapReveal("Citrus salad scraps", ["lemon peels", "orange peels"], "Peels can hold color and finishing oils."),
          this.recipeIntro("Corn soup", ["pantry", "sink", "chop", "stove", "plate"], "Limited stove time means every station choice matters."),
          this.stationChoice("pantry", ["pantry", "fridge"], "Corn and spices start in the pantry."),
          this.stationChoice("sink", ["sink", "plate"], "Clean the corn before chopping."),
          this.stationChoice("chop", ["chop", "stove"], "Strip kernels and save the husks."),
          this.stationChoice("stove", ["stove", "sink"], "Stove is open now."),
          this.stationChoice("plate", ["plate", "pantry"], "Serve the soup."),
          this.scrapReveal("Corn soup scraps", ["corn husks"], "Husks have structure for woven material."),
          this.recipeIntro("Coffee service", ["pantry", "sink", "stove", "plate"], "A quick drink order still creates material."),
          this.stationChoice("pantry", ["pantry", "fridge"], "Choose beans from the pantry."),
          this.stationChoice("stove", ["stove", "chop"], "Heat water while the sink is busy."),
          this.stationChoice("plate", ["plate", "sink"], "Send the cup out."),
          this.scrapReveal("Coffee service scraps", ["coffee grounds"], "Grounds can become pigment for print."),
          this.recipeIntro("Banana dessert", ["fridge", "chop", "plate"], "The soft fruit is served, but the peel holds long plant fiber."),
          this.stationChoice("fridge", ["fridge", "pantry"], "Start with chilled bananas."),
          this.stationChoice("chop", ["chop", "stove"], "Slice fruit and keep the peel intact."),
          this.stationChoice("plate", ["plate", "sink"], "Plate the dessert."),
          this.scrapReveal("Banana dessert scraps", ["banana peels"], "The peel remembers a packed lunch and hides strong cellulose strands."),
          this.recipeIntro("Avocado toast", ["pantry", "chop", "plate"], "The pit carries tannin and soft pink dye potential."),
          this.stationChoice("pantry", ["pantry", "fridge"], "Start with bread from the pantry."),
          this.stationChoice("chop", ["chop", "sink"], "Cut avocado and save the pit."),
          this.stationChoice("plate", ["plate", "stove"], "Finish the toast."),
          this.scrapReveal("Avocado toast scraps", ["avocado pits"], "The pit looks solid, but color is waiting inside."),
          this.guideTask("Before Results", "The cafe is closing.", ["Counters clear.", "Kitchen lights dim.", "The saved scraps are ready for the hidden lab."], "Press Next to enter the lab."),
        ],
      },
      {
        id: 3,
        title: "Act II: After-Hours Lab",
        mapName: "After-Hours Lab",
        icon: "Lab",
        act: "The hidden scanner",
        area: "Material scanner",
        goal: "Scan each recovered scrap and choose the transformation path that protects its value.",
        seconds: 75,
        sticker: "Material Detective",
        builder: () => [
          this.guideTask(
            "After-Hours Lab",
            "The cafe closes, the lights dim, and Cycora opens its hidden material lab.",
            [
              "Scan one scrap at a time.",
              "Read its identity: pigment, fiber, texture, oil, tannin, cellulose, or dye.",
              "Choose carefully. The wrong process weakens the material.",
            ],
            "You finish when every saved scrap has a precise future."
          ),
          this.labScan("orange peels", ["bright natural color", "citrus oils", "soft rind"], "Scan reveals warm dye potential."),
          this.materialMatch("orange peels", "natural dye", ["dye", "thread", "print"], "Orange peels release color better than they spin.", "dye", "Orange peels are best as natural dye, not thread."),
          this.labScan("lemon peels", ["plant acids", "bright finish", "citrus dye"], "Scan reveals finishing oils and color."),
          this.materialMatch("lemon peels", "natural dye", ["dye", "fiber", "thread"], "Lemon peels support bright color, not woven strength.", "dye", "Lemon peels protect dye brightness."),
          this.labScan("banana peels", ["fiber strength", "long strands", "plant cellulose"], "Scan reveals peel fibers that can become plant thread."),
          this.materialMatch("banana peels", "plant thread", ["thread", "pigment", "finish"], "Long banana strands can twist into thread.", "thread", "Banana peels contain cellulose strands strong enough for thread."),
          this.labScan("corn husks", ["woven texture", "flexible strips", "dry strength"], "Scan reveals strips that can dry, split, and weave."),
          this.materialMatch("corn husks", "woven fiber", ["fiber", "dye", "pigment"], "Husks can soften into strips for woven cloth.", "fiber", "Corn husks work as woven fiber."),
          this.labScan("coffee grounds", ["brown pigment", "crumbly texture", "print grit"], "Scan reveals pigment, not thread."),
          this.materialMatch("coffee grounds", "brown pigment", ["pigment", "thread", "fiber"], "Coffee is too crumbly for thread, but great for pigment.", "pigment", "Coffee grounds are too crumbly for thread, but they can become pigment."),
          this.labScan("avocado pits", ["pink dye", "tannin", "slow simmer"], "Scan reveals dye inside the pit."),
          this.materialMatch("avocado pits", "pink dye", ["dye", "weave", "print"], "Avocado pits can simmer into soft pink dye.", "dye", "Avocado pits hold dye and tannins."),
          this.guideTask("Before Results", "The scraps have identities now.", ["Coffee becomes print pigment.", "Citrus and avocado become dye.", "Banana and corn become fiber."], "Press Next to enter the workshop."),
        ],
      },
      {
        id: 4,
        title: "Act II: Fabric Workshop",
        mapName: "Fabric Workshop",
        icon: "Fabric",
        act: "Transformation is earned",
        area: "Workshop line",
        goal: "Turn scraps into pulp, pigment, thread, cloth, and usable textile through correct sequencing.",
        seconds: 90,
        sticker: "Fabric Maker",
        builder: () => [
          this.guideTask(
            "Fabric Workshop",
            "The transformation is not magic. It is earned through sequence, timing, and care.",
            [
              "Wash and dry before delicate processes.",
              "Extract color or fiber before making cloth.",
              "Wrong settings weaken the material memory.",
            ],
            "You finish when food waste has become real textile."
          ),
          this.ecoIntro("orange peels", "dyed cloth", ["collect", "wash", "extract", "dye", "dry"], "Orange peel -> color bath -> dyed cloth."),
          this.ecoChoice("collect", ["collect", "spin", "weave"], "Start by collecting a clean peel batch.", "orange peels", "dyed cloth"),
          this.ecoChoice("wash", ["wash", "dye", "press"], "Wash before extracting color.", "orange peels", "dyed cloth"),
          this.ecoChoice("extract", ["extract", "weave", "stitch"], "Extract color from the washed peels.", "orange peels", "dyed cloth"),
          this.settingTask("medium", ["low", "medium", "high"], "Set heat for bright dye without scorching.", "orange peels", "dyed cloth"),
          this.ecoChoice("dye", ["dye", "spin", "pack"], "Dye the fabric with the citrus color.", "orange peels", "dyed cloth"),
          this.ecoChoice("dry", ["dry", "grind"], "Dry the cloth so the color sets.", "orange peels", "dyed cloth"),
          this.ecoIntro("banana peels", "plant fiber cloth", ["collect", "peel", "extract", "spin", "weave"], "Banana peel -> cellulose strands -> plant fiber cloth."),
          this.ecoChoice("collect", ["collect", "dye", "pack"], "Gather the long banana peel pieces.", "banana peels", "plant fiber cloth"),
          this.ecoChoice("peel", ["peel", "print", "dye"], "Separate soft peel from fiber strands.", "banana peels", "plant fiber cloth"),
          this.ecoChoice("extract", ["extract", "press", "dry"], "Extract the strongest cellulose strands.", "banana peels", "plant fiber cloth"),
          this.settingTask("slow", ["slow", "fast", "hot"], "Use slow spin speed so thread does not snap.", "banana peels", "plant fiber cloth"),
          this.ecoChoice("spin", ["spin", "dye", "chop"], "Spin fiber into thread.", "banana peels", "plant fiber cloth"),
          this.ecoChoice("weave", ["weave", "grind"], "Weave thread into cloth.", "banana peels", "plant fiber cloth"),
          this.ecoIntro("corn husks", "thick woven textile", ["collect", "dry", "press", "weave"], "Corn husk -> dried strips -> thick woven textile."),
          this.ecoChoice("collect", ["collect", "print", "dye"], "Collect husks before they crack.", "corn husks", "thick woven textile"),
          this.ecoChoice("dry", ["dry", "spin"], "Dry husks until they hold shape.", "corn husks", "thick woven textile"),
          this.ecoChoice("press", ["press", "grind"], "Press strips flat for weaving.", "corn husks", "thick woven textile"),
          this.ecoChoice("weave", ["weave", "dye"], "Weave the flexible strips into thick cloth.", "corn husks", "thick woven textile"),
          this.ecoIntro("coffee grounds", "printed fabric", ["collect", "dry", "grind", "mix", "print"], "Coffee grounds -> pigment -> printed fabric."),
          this.ecoChoice("collect", ["collect", "weave", "stitch"], "Collect used grounds from the cafe bar.", "coffee grounds", "printed fabric"),
          this.ecoChoice("dry", ["dry", "dye"], "Dry grounds before grinding.", "coffee grounds", "printed fabric"),
          this.ecoChoice("grind", ["grind", "spin", "weave"], "Grind into even pigment.", "coffee grounds", "printed fabric"),
          this.settingTask("balanced", ["thin", "balanced", "thick"], "Mix pigment so it prints clearly.", "coffee grounds", "printed fabric"),
          this.ecoChoice("print", ["print", "peel"], "Print the brown pattern onto fabric.", "coffee grounds", "printed fabric"),
          this.ecoIntro("avocado pits", "soft pink dyed cloth", ["collect", "wash", "extract", "dye", "dry"], "Avocado pit -> tannin bath -> soft pink dyed cloth."),
          this.ecoChoice("collect", ["collect", "weave", "spin"], "Collect clean pits for the dye bath.", "avocado pits", "soft pink dyed cloth"),
          this.ecoChoice("wash", ["wash", "print"], "Wash before simmering.", "avocado pits", "soft pink dyed cloth"),
          this.ecoChoice("extract", ["extract", "grind"], "Extract tannin slowly.", "avocado pits", "soft pink dyed cloth"),
          this.settingTask("low", ["low", "medium", "high"], "Low heat protects the soft pink color.", "avocado pits", "soft pink dyed cloth"),
          this.ecoChoice("dye", ["dye", "weave"], "Dye cloth with the pit color.", "avocado pits", "soft pink dyed cloth"),
          this.ecoChoice("dry", ["dry", "pack"], "Dry the color into the cloth.", "avocado pits", "soft pink dyed cloth"),
          this.guideTask("Before Results", "The workshop has changed the scraps.", ["Peels became dye.", "Grounds became print.", "Fibers and husks became cloth.", "Each material still carries its cafe memory."], "Press Next to design a product."),
        ],
      },
      {
        id: 5,
        title: "Act III: Product Studio",
        mapName: "Product Studio",
        icon: "Studio",
        act: "Design with purpose",
        area: "Design table",
        goal: "Match each textile to a useful product based on its actual qualities.",
        seconds: 65,
        sticker: "Studio Designer",
        builder: () => [
          this.guideTask(
            "Product Studio",
            "The fabric is ready, but the story is not complete.",
            [
              "Strong woven cloth should carry weight.",
              "Soft dyed fabric should touch skin comfortably.",
              "Printed fabric can become a small object with a visible memory.",
              "Offcuts still deserve a purpose.",
            ],
            "You finish when the product matches the material."
          ),
          this.studioPlan("Fabric rack: strong woven, soft dyed, thick woven, plant fiber, pink dyed, and printed cloth."),
          this.productTask("strong woven fabric", "tote", ["tote", "scarf", "banner"], "Strong cloth can carry groceries and market tools.", "tote -> farmers market kit"),
          this.layoutTask("nest", ["nest", "scatter", "oversize"], "Nest pattern pieces close together to reduce offcuts."),
          this.assemblyTask("stitch", ["stitch", "glue", "skip"], "Stitch handles so the tote can carry weight."),
          this.finishTask("label", ["label", "plain", "wet"], "Add a Cycora label so people know the material story."),
          this.productTask("soft dyed cloth", "scarf", ["scarf", "tote", "placemat"], "Soft fabric fits close to skin.", "scarf -> winter clothing drive"),
          this.layoutTask("stripe", ["stripe", "waste", "crumple"], "Cut a long scarf strip from the dyed cloth."),
          this.assemblyTask("hem", ["hem", "tear", "rush"], "Hem the edges for comfort."),
          this.productTask("thick woven textile", "jacket", ["jacket", "pouch", "banner"], "Thicker textile can become a warm jacket.", "jacket -> shelter clothing rack"),
          this.layoutTask("panel", ["panel", "scatter", "tiny"], "Cut jacket panels from the sturdy cloth."),
          this.assemblyTask("stitch", ["stitch", "skip", "glue"], "Stitch seams so the jacket lasts."),
          this.productTask("colorful dyed cloth", "shirt", ["shirt", "blanket", "tote"], "Dyed cloth can become everyday clothing.", "shirt -> newcomer welcome closet"),
          this.finishTask("label", ["label", "wet", "hide"], "Add a label that tells the food-to-fabric story."),
          this.productTask("plant fiber cloth", "tote", ["tote", "scarf", "blanket"], "Plant fiber cloth is strong enough for a daily carry item.", "tote -> student grocery kit"),
          this.layoutTask("nest", ["nest", "scatter", "oversize"], "Nest the tote pieces so little cloth is lost."),
          this.productTask("printed fabric", "pouch", ["pouch", "blanket", "apron"], "Printed cloth makes a small zero-waste lunch pouch."),
          this.finishTask("patch", ["patch", "soak", "hide"], "Add a patch that shows the coffee-pigment print."),
          this.productTask("soft pink dyed cloth", "scarf", ["scarf", "pouch", "banner"], "Soft pink cloth from avocado dye can become a warm scarf.", "scarf -> senior winter shelf"),
          this.assemblyTask("hem", ["hem", "tear", "rush"], "Hem the scarf edges for comfort."),
          this.productTask("sturdy leftover cloth", "purse", ["purse", "scarf", "blanket"], "Sturdy offcuts can become a small purse for daily essentials.", "purse -> newcomer welcome closet"),
          this.assemblyTask("stitch", ["stitch", "skip", "glue"], "Stitch the purse edges and strap."),
          this.guideTask("Before Results", "The products are finished.", ["The object is no longer a scrap.", "It is useful, traceable, and cared for.", "Eco Maker is ready to place it in the community."], "Press Next for the handoff."),
        ],
      },
      {
        id: 6,
        title: "Final Act: Community Loop",
        mapName: "Community Loop",
        icon: "Loop",
        act: "The loop continues",
        area: "Whole Cycora loop",
        goal: "Complete the full arc: meal, scrap, material, textile, product, person.",
        seconds: 110,
        sticker: "Cycora Champion",
        builder: () => [
          this.guideTask(
            "Community Loop",
            "Welcome to Cycora Kitchen. For now, treat this like any first shift: read the room, serve the guest, and keep the table moving.",
            [
              "There is more happening here than lunch, but I do not want you looking too far ahead yet.",
              "Start with Noah’s order. Watch what the meal leaves behind, because Cycora pays attention to the parts most kitchens forget.",
            ],
            "Serve the salad first. Once the plate leaves your hands, I will show you why the scrap matters."
          ),
          this.customerPeek([
            { name: "Noah", table: 1, dish: "salad", scrap: "orange peels" },
            { name: "Leo", table: 2, dish: "toast", scrap: "avocado pits" },
          ]),
          this.decisionTask("customer", "noah", ["noah", "leo"], "Noah is highlighted. Noah wants salad.", "Good. Noah is first.", { table: 1, dish: "salad" }),
          this.recipeIntro("Citrus salad", ["fridge", "sink", "chop", "plate"], "This choice creates citrus peels for dye."),
          this.stationChoice("fridge", ["fridge", "pantry"], "Pull chilled citrus and greens."),
          this.stationChoice("sink", ["sink", "stove"], "Wash before chopping."),
          this.stationChoice("chop", ["chop", "plate"], "Chop and save clean peels."),
          this.stationChoice("plate", ["plate", "serve"], "Plate, then serve."),
          this.serveTask("salad", 1, "Serve salad to Noah."),
          this.guideTask(
            "Full Cycora Shift",
            "Good. The meal is out, and now the kitchen gets quieter for a moment. Look at what is left on the prep side: citrus peel, rind, and oil.",
            [
              "In another cafe, that peel would slide into the bin and the story would end there.",
              "Here, we collect it carefully because its color, oil, and softness can tell us what kind of material path it wants.",
            ],
            "Save the citrus trace. The next step is not making yet; first we need to understand what the material is."
          ),
          this.scrapReveal("Scrap collected", ["orange peels", "lemon peels"], "The recipe created dye-rich citrus peels."),
          this.labScan("orange peels", ["color potential", "citrus oils", "soft rind"], "The scanner finds a strong dye path."),
          this.materialMatch("orange peels", "natural dye", ["dye", "thread", "fiber"], "Early recipe choices decide the lab material.", "dye", "Orange peels become dye before they become textile color."),
          this.guideTask(
            "Material Lab",
            "Now the scanner has given us the first truth: this peel is not strong enough to become thread, but it can release color.",
            [
              "That is the difference between guessing and designing. We do not force a material into the process we wanted; we choose the process that protects what it already has.",
              "For citrus, the right path is dye. The memory of the table stays with the color as it moves into cloth.",
            ],
            "Take the peel into the workshop. From here on, sequence matters."
          ),
          this.ecoIntro("orange peels", "dyed cloth", ["collect", "wash", "extract", "dye", "dry"], "Orange peels -> citrus dye -> dyed cloth."),
          this.ecoChoice("collect", ["collect", "spin", "weave"], "Collect the clean peel batch.", "orange peels", "dyed cloth"),
          this.ecoChoice("wash", ["wash", "print"], "Wash before extraction.", "orange peels", "dyed cloth"),
          this.ecoChoice("extract", ["extract", "stitch"], "Extract citrus color.", "orange peels", "dyed cloth"),
          this.settingTask("medium", ["low", "medium", "high"], "Medium heat protects color.", "orange peels", "dyed cloth"),
          this.ecoChoice("dye", ["dye", "spin"], "Dye the fabric.", "orange peels", "dyed cloth"),
          this.ecoChoice("dry", ["dry", "grind"], "Dry the finished cloth.", "orange peels", "dyed cloth"),
          this.guideTask(
            "Workshop",
            "That is the transformation I wanted you to feel: nothing appeared out of nowhere. You washed, extracted, controlled heat, dyed, and dried.",
            [
              "The cloth is carrying more than color now. It carries the decision chain that protected the peel instead of flattening it into waste.",
              "A textile is only halfway through the loop, though. The next question is what this material should become.",
            ],
            "Move to the Product Studio and choose a form that fits the fabric."
          ),
          this.productTask("colorful dyed cloth", "apron", ["apron", "blanket", "rope"], "A cafe apron can return to the restaurant.", "apron -> returned to the restaurant"),
          this.layoutTask("nest", ["nest", "scatter", "oversize"], "Cut apron pieces closely to avoid waste."),
          this.assemblyTask("stitch", ["stitch", "glue", "skip"], "Stitch straps and pocket."),
          this.finishTask("patch", ["patch", "plain", "wet"], "Add the citrus-dye patch."),
          this.guideTask(
            "Product Studio",
            "The apron works because it belongs to the material story. Dyed cloth can return to the same cafe as something useful, visible, and traceable.",
            [
              "You used the fabric with purpose instead of treating it like a random craft supply.",
              "Now the object needs a place in the community. A circular loop is not complete until someone can use what was made.",
            ],
            "Give the finished apron to Eco Maker so it can be placed back where it helps."
          ),
          this.deliveryTask("apron", "restaurant", 4, "Return the apron to the cafe for reuse."),
          this.loopSummary(),
          this.guideTask(
            "Before Results",
            "The cafe is no longer just a restaurant; you have seen it operate as a circular design system where every action leaves a consequence.",
            [
              "What you served created a trace, what you saved protected a material, and what you processed turned hidden value into something visible.",
              "The finished apron is not just a reward screen object; it is a designed item with a source, a memory, a material path, and a community destination.",
              "That is the loop Cycora is trying to teach: sustainability is not an abstract idea, it is a chain of decisions made carefully enough to help someone.",
            ],
            "Press Next to see the completed loop and the impact of the choices you carried through the day."
          ),
        ],
      },
    ];
    const loopLevel = storyLevels[5];
    return [
      {
        ...loopLevel,
        id: 1,
        title: "Cycora Loop",
        mapName: "Cycora Loop",
        icon: "Loop",
        act: "One complete day",
        area: "Full circular system",
        goal: "Play one complete loop from meal service to community handoff.",
        seconds: 180,
        sticker: "Loop Maker",
      },
    ];
  }

  customerTask(word, table, hint) {
    return { type: "word", mode: "customer", word, table, hint, label: "Type the greeting", feedback: "Great greeting!" };
  }

  customerPeek(customers) {
    return { type: "guide", mode: "customerPeek", customers, hint: "These orders stay visible. Look at each name and meal." };
  }

  guideTask(title, goal, steps, success) {
    return { type: "guide", mode: "guide", title, goal, steps, success };
  }

  decisionTask(mode, answer, choices, hint, feedback = "Good choice.", focus = null) {
    return { type: "choice", mode, answer, choices, hint, label: "Choose the next move", feedback, countsDecision: true, focus };
  }

  memoryChoice(kind, answer, choices, hint) {
    return { type: "choice", mode: "memory", kind, answer, choices, hint, label: "Order memory", feedback: "You remembered it.", countsDecision: true };
  }

  stationTask(station, word, hint) {
    return { type: "word", mode: "station", station, word, hint, label: this.stationName(station), feedback: "Nice station work!" };
  }

  scrapReveal(title, scraps, hint) {
    return { type: "info", mode: "scrapReveal", title, scraps, hint, duration: 1450 };
  }

  stationChoice(answer, choices, hint) {
    return { type: "choice", mode: "stationChoice", station: answer, answer, choices, hint, label: "Pick station", feedback: "Efficient path.", countsDecision: true };
  }

  serveTask(dish, table, hint) {
    return { type: "word", mode: "serve", station: "serve", word: dish, dish, table, hint, label: "Serve the table", feedback: "Meal delivered!" };
  }

  sortTask(item, answer, condition, explanation) {
    const choices = ["donation", "compost", "recycle", "trash"];
    return {
      type: "choice",
      mode: "sort",
      item,
      answer,
      choices,
      hint: condition,
      explanation,
      label: "Sort the card",
      feedback: answer === "trash" ? "Last resort, used carefully." : "Recovered.",
      countsDecision: true,
    };
  }

  separateTask(answer, condition, explanation) {
    return { type: "choice", mode: "separate", item: "Mixed drink card", answer, choices: ["drain", "lid", "cup"], hint: condition, explanation, label: "Separate first", feedback: "Separated.", countsDecision: true };
  }

  labScan(material, properties, hint) {
    return { type: "info", mode: "labScan", material, properties, hint, duration: 1500 };
  }

  materialMatch(material, product, choices, hint, answer = product, explanation = "") {
    return { type: "choice", mode: "material", material, product, answer, choices, hint, explanation, label: "Choose material path", feedback: "Potential discovered.", countsDecision: true };
  }

  ecoIntro(material, product, steps, hint = `${material} can become a ${product}.`) {
    return { type: "info", mode: "eco", material, product, steps, hint };
  }

  ecoTask(material, product, word) {
    return { type: "word", mode: "eco", word, material, product, hint: `${material} → ${product}. Type ${word}.`, label: "Eco Lab conveyor", feedback: "The belt moves!" };
  }

  ecoChoice(answer, choices, hint, material = "rescued scraps", product = "product") {
    return { type: "choice", mode: "eco", word: answer, answer, choices, material, product, hint, label: "Eco Lab station", feedback: "Process quality up.", countsDecision: true };
  }

  settingTask(answer, choices, hint, material = "rescued scraps", product = "textile") {
    return { type: "choice", mode: "setting", answer, choices, hint, material, product, label: "Machine setting", feedback: "Quality protected.", countsDecision: true };
  }

  deliveryPlan(hint) {
    return { type: "info", mode: "deliveryPlan", duration: 1400, hint };
  }

  studioPlan(hint) {
    return { type: "info", mode: "studioPlan", duration: 1400, hint };
  }

  productTask(fabric, answer, choices, hint, impact) {
    return { type: "choice", mode: "product", fabric, answer, choices, hint, impact, label: "Choose product", feedback: "Useful product match.", countsDecision: true };
  }

  layoutTask(answer, choices, hint) {
    return { type: "choice", mode: "layout", answer, choices, hint, label: "Pattern layout", feedback: "Waste reduced.", countsDecision: true };
  }

  assemblyTask(answer, choices, hint) {
    return { type: "choice", mode: "assembly", answer, choices, hint, label: "Assemble", feedback: "Product stronger.", countsDecision: true };
  }

  finishTask(answer, choices, hint) {
    return { type: "choice", mode: "finish", answer, choices, hint, label: "Finish design", feedback: "Design finished.", countsDecision: true };
  }

  loopSummary() {
    return { type: "info", mode: "loopSummary", duration: 1800, hint: "Food served -> scraps collected -> material discovered -> textile created -> product reused." };
  }

  deliveryTask(product, answer, people, hint) {
    return {
      type: "choice",
      mode: "delivery",
      product,
      answer,
      people,
      choices: ["shelter", "market", "winter", "restaurant"],
      hint,
      label: "Delivery helper",
      feedback: `${people} people helped!`,
    };
  }

  adaptTasksForAge(tasks, level) {
    const profile = this.ageProfile();
    let adapted = tasks.map((task) => this.adaptTaskForAge({ ...task }, profile));

    if (this.ageGroup === "teens") {
      adapted = adapted.map((task, index) => this.addTeenMechanics(task, index, level.id));
    }

    if (this.ageGroup === "adults") {
      adapted = adapted.map((task, index) => this.addAdultMechanics(this.addAdultSimulationTone(task), index, level.id));
    }

    return adapted.map((task) => this.applyVocabularyForAge(task));
  }

  adaptTaskForAge(task, profile) {
    if (task.type === "guide") {
      task.steps = (task.steps || []).map((step) => this.copyForAge(step));
      task.goal = this.copyForAge(task.goal);
      task.success = this.copyForAge(task.success);
      return task;
    }

    if (task.type === "info") {
      task.duration = profile.infoDuration || task.duration;
      task.hint = this.copyForAge(task.hint);
      return task;
    }

    task.hint = this.copyForAge(task.hint);
    task.explanation = this.copyForAge(task.explanation);
    if (task.feedback) task.feedback = profile.correctFeedback || task.feedback;

    return task;
  }

  copyForAge(text) {
    if (!text) return text;
    let value = String(text);
    if (this.ageGroup === "kids") {
      const swaps = [
        [/material potential/gi, "useful stuff"],
        [/transformation/gi, "change"],
        [/transform(ed|s|ing)?/gi, "turn$1"],
        [/textile(s)?/gi, "fabric$1"],
        [/extract(ed|s|ing)?/gi, "pull out"],
        [/pigment/gi, "color powder"],
        [/community resources/gi, "things people can use"],
        [/circular journey/gi, "reuse path"],
        [/process chain/gi, "step path"],
        [/properties/gi, "clues"],
      ];
      swaps.forEach(([from, to]) => {
        value = value.replace(from, to);
      });
    }
    if (this.ageGroup === "teens") {
      value = value
        .replace(/best material path/gi, "highest-value material pathway")
        .replace(/useful product/gi, "high-impact product")
        .replace(/reduce waste/gi, "optimize waste reduction");
    }
    if (this.ageGroup === "adults") {
      value = value
        .replace(/You finish when/gi, "The simulation settles when")
        .replace(/choose/gi, "select")
        .replace(/rush/gi, "flow");
    }
    return value;
  }

  addTeenMechanics(task, index, levelId) {
    if (task.type === "choice" && task.choices) {
      const extras = this.ageProfile().extraChoices || [];
      const wanted = levelId >= 4 ? 4 : 3;
      task.choices = this.uniqueList(task.choices.concat(extras.slice(index % extras.length, index % extras.length + 2))).slice(0, wanted);
      if (!task.choices.includes(task.answer)) task.choices.unshift(task.answer);
    }
    if (task.type === "guide") {
      task.steps = (task.steps || []).concat("Keep mistakes low to protect your competitive score.");
    }
    return task;
  }

  addAdultSimulationTone(task) {
    if (task.type === "guide") {
      task.steps = (task.steps || []).concat("Read the material flow as a working system: origin, property, process, product, and recipient all need to stay connected.");
    }
    if (task.type === "choice") {
      task.label = task.mode === "delivery" || task.mode === "route" ? "Select route" : "Select process";
    }
    return task;
  }

  addAdultMechanics(task, index, levelId) {
    if (task.type === "choice" && task.choices) {
      const extras = this.ageProfile().extraChoices || [];
      const start = index % extras.length;
      const additions = extras.slice(start).concat(extras.slice(0, start)).slice(0, 2);
      const wanted = levelId >= 1 ? 4 : 3;
      task.choices = this.uniqueList(task.choices.concat(additions)).slice(0, wanted);
      if (!task.choices.includes(task.answer)) task.choices.unshift(task.answer);
    }
    return task;
  }

  applyVocabularyForAge(task) {
    if (task.type === "word" && task.word) {
      task.typeWord = this.vocabularyWord(task.word, task.mode);
      if (task.typeWord !== task.word) task.hint = `${task.hint} Type: ${task.typeWord}.`;
    }
    if (task.type === "choice" && task.choices) {
      task.typeAnswer = this.vocabularyWord(task.answer, task.mode);
      task.typeChoices = this.uniqueTypedChoices(task.choices.map((choice) => this.vocabularyWord(choice, task.mode)), task.choices);
      const answerIndex = task.choices.indexOf(task.answer);
      if (answerIndex >= 0) task.typeAnswer = task.typeChoices[answerIndex];
    }
    return task;
  }

  uniqueTypedChoices(words, fallback) {
    const seen = new Set();
    return words.map((word, index) => {
      let typed = String(word || fallback[index] || "").toLowerCase().replace(/[^a-z]/g, "");
      if (!typed) typed = String(fallback[index] || "choice").toLowerCase().replace(/[^a-z]/g, "");
      if (!seen.has(typed)) {
        seen.add(typed);
        return typed;
      }
      const original = String(fallback[index] || typed).toLowerCase().replace(/[^a-z]/g, "");
      typed = original && !seen.has(original) ? original : `${typed}${index + 1}`;
      seen.add(typed);
      return typed;
    });
  }

  vocabularyWord(word, mode = "") {
    const key = String(word || "").toLowerCase();
    const maps = this.ageVocabulary();
    return (maps[mode] && maps[mode][key]) || maps.common[key] || key;
  }

  ageVocabulary() {
    const shared = { maya: "maya", leo: "leo", amira: "amira", noah: "noah" };
    if (this.ageGroup === "kids") {
      return {
        common: {
          ...shared,
          fridge: "cold",
          pantry: "shelf",
          chop: "slice",
          sink: "wash",
          stove: "cook",
          plate: "plate",
          serve: "serve",
          collect: "gather",
          wash: "scrub",
          peel: "peel",
          extract: "pull",
          spin: "twist",
          weave: "weave",
          dye: "color",
          dry: "dry",
          grind: "crush",
          mix: "blend",
          print: "stamp",
          press: "press",
          stitch: "sew",
          pack: "box",
          dye: "color",
          thread: "string",
          fiber: "fiber",
          pigment: "powder",
          finish: "finish",
          tote: "bag",
          scarf: "scarf",
          banner: "sign",
          jacket: "coat",
          pouch: "pouch",
          purse: "purse",
          apron: "apron",
          blanket: "blanket",
          shirt: "shirt",
          rope: "rope",
          nest: "fit",
          scatter: "mess",
          oversize: "huge",
          stripe: "stripe",
          waste: "waste",
          crumple: "crush",
          panel: "panel",
          tiny: "tiny",
          stitch: "sew",
          glue: "glue",
          skip: "skip",
          hem: "hem",
          label: "tag",
          plain: "plain",
          wet: "wet",
          patch: "patch",
          hide: "hide",
          low: "low",
          medium: "middle",
          high: "high",
          slow: "slow",
          fast: "fast",
          hot: "hot",
          thin: "thin",
          balanced: "even",
          thick: "thick",
          shelter: "home",
          market: "market",
          winter: "warm",
          restaurant: "cafe",
          donation: "share",
          compost: "soil",
          recycle: "reuse",
          trash: "trash",
          drain: "drain",
          lid: "lid",
          cup: "cup",
        },
      };
    }
    if (this.ageGroup === "teens") {
      return {
        common: {
          ...shared,
          fridge: "refrigerate",
          pantry: "stockroom",
          chop: "julienne",
          sink: "sanitize",
          stove: "simmer",
          plate: "garnish",
          serve: "dispatch",
          soup: "bisque",
          sandwich: "panini",
          salad: "greens",
          pasta: "linguine",
          bowl: "grainbowl",
          toast: "crostini",
          wrap: "flatbread",
          eggs: "omelet",
          fries: "frites",
          collect: "salvage",
          wash: "sanitize",
          peel: "strip",
          extract: "extract",
          spin: "filament",
          weave: "interlace",
          dye: "mordant",
          dry: "cure",
          grind: "pulverize",
          mix: "emulsify",
          print: "screenprint",
          press: "compress",
          stitch: "seam",
          pack: "package",
          thread: "filament",
          fiber: "cellulose",
          pigment: "pigment",
          finish: "finish",
          tote: "carryall",
          scarf: "wrap",
          banner: "placard",
          jacket: "parka",
          pouch: "satchel",
          purse: "crossbody",
          apron: "smock",
          blanket: "throw",
          shirt: "tee",
          rope: "cordage",
          nest: "nesting",
          scatter: "scatter",
          oversize: "oversize",
          stripe: "biascut",
          waste: "offcut",
          crumple: "crumple",
          panel: "panelize",
          tiny: "undersize",
          glue: "adhere",
          skip: "bypass",
          hem: "serge",
          label: "brandmark",
          plain: "blank",
          wet: "saturate",
          patch: "applique",
          hide: "conceal",
          low: "low",
          medium: "medium",
          high: "high",
          slow: "slow",
          fast: "rapid",
          hot: "scorch",
          thin: "thin",
          balanced: "balanced",
          thick: "viscous",
          shelter: "shelter",
          market: "market",
          winter: "winter",
          restaurant: "bistro",
          donation: "donation",
          compost: "compost",
          recycle: "recycle",
          trash: "landfill",
          audit: "audit",
          route: "route",
          batch: "batch",
          impact: "impact",
          verify: "verify",
          optimize: "optimize",
          drain: "decant",
          lid: "cap",
          cup: "vessel",
        },
      };
    }
    if (this.ageGroup === "adults") {
      return {
        common: {
          ...shared,
          fridge: "refrigerate",
          pantry: "provision",
          chop: "portion",
          sink: "sanitize",
          stove: "temper",
          plate: "compose",
          serve: "dispatch",
          soup: "broth",
          sandwich: "sandwich",
          salad: "citrussalad",
          pasta: "pasta",
          bowl: "bowl",
          toast: "avocadotoast",
          wrap: "wrap",
          eggs: "eggs",
          fries: "fries",
          collect: "recover",
          wash: "decontaminate",
          peel: "separate",
          extract: "extract",
          spin: "extrude",
          weave: "interlace",
          dye: "colorfasten",
          dry: "desiccate",
          grind: "pulverize",
          mix: "homogenize",
          print: "screenprint",
          press: "laminate",
          stitch: "seamfinish",
          pack: "archive",
          thread: "filament",
          fiber: "cellulose",
          pigment: "pigment",
          finish: "finish",
          tote: "carryall",
          scarf: "wrapscarf",
          banner: "banner",
          jacket: "insulatedjacket",
          pouch: "utilitypouch",
          purse: "crossbody",
          apron: "workapron",
          blanket: "thermalblanket",
          shirt: "shirt",
          rope: "cordage",
          nest: "patternnest",
          scatter: "scattercut",
          oversize: "oversizecut",
          stripe: "stripe",
          waste: "offcut",
          crumple: "deform",
          panel: "panelize",
          tiny: "undersize",
          glue: "adhesivebond",
          skip: "bypass",
          hem: "edgebind",
          label: "traceability",
          plain: "unmarked",
          wet: "oversaturate",
          patch: "memorypatch",
          hide: "conceal",
          low: "lowheat",
          medium: "controlledheat",
          high: "overheat",
          slow: "lowrpm",
          fast: "highrpm",
          hot: "thermalshock",
          thin: "underbound",
          balanced: "balancedratio",
          thick: "overloaded",
          shelter: "shelter",
          market: "foodmarket",
          winter: "winterdrive",
          restaurant: "communitycafe",
          donation: "redistribute",
          compost: "biocycle",
          recycle: "materialrecovery",
          trash: "landfill",
          assess: "assess",
          calibrate: "calibrate",
          document: "document",
          allocate: "allocate",
          stabilize: "stabilize",
          validate: "validate",
          drain: "drain",
          lid: "lid",
          cup: "cup",
        },
      };
    }
    return { common: {} };
  }

  typedWord(task) {
    return task.typeWord || task.word;
  }

  typedAnswer(task) {
    return task.typeAnswer || task.answer;
  }

  typedChoices(task) {
    return task.typeChoices || task.choices || [];
  }

  typedChoiceTags(task) {
    return this.typedChoices(task).map((choice) => `<span>${this.escapeHTML(this.titleCase(choice))}</span>`).join("");
  }

  stationName(station) {
    return {
      fridge: "Fridge",
      pantry: "Pantry",
      chop: "Chop",
      sink: "Sink",
      stove: "Stove",
      plate: "Plate",
      serve: "Serve",
    }[station] || station;
  }

  prepareProgressionUI() {
    const menuCard = this.els.screenMenu.querySelector(".menu-card");
    if (menuCard && !menuCard.dataset.progressionReady) {
      menuCard.dataset.progressionReady = "1";
      menuCard.classList.add("progression-card");
      menuCard.innerHTML = `
        <div class="map-head">
          <p class="map-kicker">Cycora World</p>
          <h2>Begin one full Cycora day</h2>
          <p class="menu-blurb">Serve meals, save scraps, reveal material memories, make textile, design a product, and place it back into the community.</p>
        </div>
        <label class="player-name-card">
          <span>Player name</span>
          <input type="text" id="player-name-input" maxlength="24" placeholder="Cycora Maker" autocomplete="name" />
        </label>
        <fieldset class="age-group-card" aria-label="Choose age group">
          <legend>Choose age group</legend>
          <label class="age-option">
            <input type="radio" name="age-group" value="kids" />
            <span><strong>Kids</strong><small>6-10</small></span>
          </label>
          <label class="age-option">
            <input type="radio" name="age-group" value="teens" />
            <span><strong>Teens</strong><small>11-17</small></span>
          </label>
          <label class="age-option">
            <input type="radio" name="age-group" value="adults" />
            <span><strong>Adults</strong><small>18+</small></span>
          </label>
        </fieldset>
        <div class="map-options">
          <label class="accessibility-toggle"><input type="checkbox" id="opt-large-prompts" /> <span>Larger prompt text</span></label>
          <label class="accessibility-toggle"><input type="checkbox" id="opt-high-contrast" /> <span>High-contrast prompts</span></label>
          <label class="accessibility-toggle"><input type="checkbox" id="opt-practice-mode" checked /> <span>Practice mode: no timer</span></label>
          <button type="button" class="map-board-btn" id="btn-map-leaderboard">Achievement board</button>
        </div>
        <button type="button" class="home-play-button" id="btn-play-loop">Play</button>
        <div class="level-map" id="level-map"></div>
      `;
    }

    if (!document.getElementById("mini-game-board")) {
      const board = document.createElement("div");
      board.id = "mini-game-board";
      board.className = "mini-game-board";
      board.innerHTML = `
        <div class="mini-progress">
          <span id="mini-level-pill">Level</span>
          <strong id="mini-level-title">Mini game</strong>
          <span id="mini-step-count">0/0</span>
        </div>
        <div class="mini-stage" id="mini-stage"></div>
        <div class="recipe-path" id="recipe-path"></div>
      `;
      this.els.screenGame.appendChild(board);
    }

    this.mapEl = document.getElementById("level-map");
    this.miniStage = document.getElementById("mini-stage");
    this.recipePath = document.getElementById("recipe-path");
    this.levelPill = document.getElementById("mini-level-pill");
    this.levelTitle = document.getElementById("mini-level-title");
    this.stepCount = document.getElementById("mini-step-count");
    const nameInput = document.getElementById("player-name-input");
    if (nameInput) {
      nameInput.value = this.playerName;
      nameInput.addEventListener("change", () => this.savePlayerName(nameInput.value));
      nameInput.addEventListener("blur", () => this.savePlayerName(nameInput.value));
    }
    document.querySelectorAll('input[name="age-group"]').forEach((input) => {
      input.checked = input.value === this.ageGroup;
      input.addEventListener("change", () => this.saveAgeGroup(input.value));
    });
    this.applyAgeDefaults();
    document.getElementById("btn-play-loop")?.addEventListener("click", () => this.startLevel(0));

    const next = document.getElementById("btn-next-level");
    if (next) {
      next.removeAttribute("href");
      next.textContent = this.levels.length === 1 ? "Play loop again" : "Next level";
      next.addEventListener("click", (e) => {
        e.preventDefault();
        const nextIndex = Math.min(this.levelIndex + 1, this.levels.length - 1);
        this.startLevel(nextIndex);
      });
    }
    const menu = document.getElementById("btn-results-menu");
    if (menu) menu.textContent = "Level map";
    if (!document.getElementById("btn-retry-level")) {
      const retry = document.createElement("button");
      retry.type = "button";
      retry.id = "btn-retry-level";
      retry.className = "btn-secondary";
      retry.textContent = "Retry";
      const actions = document.querySelector(".results-actions");
      if (actions) actions.insertBefore(retry, actions.firstChild);
      retry.addEventListener("click", () => this.startLevel(this.levelIndex));
    }

    document.getElementById("btn-map-leaderboard")?.addEventListener("click", () => this.showLeaderboard());
    document.getElementById("btn-hud-leaderboard")?.addEventListener("click", () => this.showLeaderboard());
    document.getElementById("btn-results-leaderboard")?.addEventListener("click", () => this.showLeaderboard());
    document.getElementById("btn-close-leaderboard")?.addEventListener("click", () => this.hideLeaderboard());
    this.els.leaderboardModal?.addEventListener("click", (e) => {
      if (e.target === this.els.leaderboardModal) this.hideLeaderboard();
    });
    this.els.dialoguePanel?.addEventListener("click", () => this.advanceRioDialogue());
  }

  startIntroDialogue() {
    this.showLevelMap();
  }

  showLevelMap() {
    this.state = "map";
    this.stopTimer();
    this.boardPausedTimer = false;
    this.clearPlayUI();
    this.els.screenGame.classList.add("hidden");
    this.els.screenResults.classList.add("hidden");
    this.els.screenMenu.classList.remove("hidden");
    this.renderLevelMap();
  }

  renderLevelMap() {
    if (!this.mapEl) return;
    this.unlocked = this.readUnlocked();
    if (!this.ageGroup) {
      this.mapEl.innerHTML = `<div class="age-required">Choose Kids, Teens, or Adults to start.</div>`;
      return;
    }
    const profile = this.ageProfile();
    this.mapEl.innerHTML = `<div class="age-required loop-ready">${profile.label} mode ready. Press Play to begin the Cycora Loop.</div>`;
  }

  startLevel(index) {
    if (!this.ageGroup) {
      this.renderLevelMap();
      return;
    }
    this.savePlayerName(document.getElementById("player-name-input")?.value || this.playerName);
    this.levelIndex = index;
    this.currentLevel = this.levels[index];
    this.tasks = this.adaptTasksForAge(this.currentLevel.builder(), this.currentLevel);
    this.taskIndex = 0;
    this.stats = this.emptyStats();
    this.stats.sticker = this.currentLevel.sticker;
    this.currentAchievement = null;
    this.visibleCustomers = [];
    this.result = null;
    this.state = "playing";
    this.practiceMode = !!document.getElementById("opt-practice-mode")?.checked;
    this.largePrompts = !!document.getElementById("opt-large-prompts")?.checked;
    this.highContrast = !!document.getElementById("opt-high-contrast")?.checked;
    this.timeLeft = this.practiceMode ? Infinity : this.currentLevel.seconds;
    this.applyAccessibility();

    this.els.screenMenu.classList.add("hidden");
    this.els.screenResults.classList.add("hidden");
    this.els.screenGame.classList.remove("hidden");
    this.els.dialoguePanel.classList.add("hidden");
    this.els.wasteDock.classList.add("hidden");
    this.els.screenGame.classList.remove("waste-phase");
    this.ensureTables(this.currentLevel.id === 1 || this.currentLevel.id === 2 ? 3 : 2);
    this.seedDiningRoom();
    this.renderHUD();
    this.flashPhaseBanner(this.currentLevel.title, this.currentLevel.act);
    this.showTask();
    this.startTimer();
  }

  ensureTables(count) {
    const host = this.els.tablesContainer;
    host.innerHTML = "";
    for (let i = 0; i < count; i += 1) {
      const slot = document.createElement("div");
      slot.className = "table-slot";
      slot.innerHTML = `
        <div class="customer-slot" id="customer-${i}"></div>
        <div class="dining-furniture">
          <img class="furniture-chair" src="Assets/Chair.png" alt="" data-asset="Assets/Chair.png" />
          <img class="furniture-table" src="Assets/Table.png" alt="" data-asset="Assets/Table.png" />
        </div>
      `;
      host.appendChild(slot);
    }
  }

  renderCustomer(table, dish, name = "") {
    const wrap = document.getElementById(`customer-${table - 1}`);
    if (!wrap) return;
    const colors = ["#6b8ce8", "#c76b9e", "#6b8f71"];
    const label = name || `Table ${table}`;
    const order = dish ? `${this.cfg.dishEmoji[dish] || "🍽️"} ${this.dishLabel(dish)}` : "?";
    wrap.innerHTML = `
      <div class="customer mini-customer" data-mini-table="${table}">
        <div class="customer-order-tag">
          <strong>${this.escapeHTML(label)}</strong>
          <span>${order}</span>
        </div>
        <div class="customer-head customer-face-happy"></div>
        <div class="customer-body" style="background:${colors[table - 1] || "#c78b4a"}"></div>
      </div>
    `;
  }

  seedDiningRoom() {
    if (!this.currentLevel) return;
    if (this.currentLevel.id === 1) return;
    if (this.currentLevel.id === 2) {
      this.renderCustomer(1, "soup", "Maya");
      this.renderCustomer(2, "salad", "Amira");
      this.renderCustomer(3, "pasta", "Noah");
    }
    if (this.currentLevel.id === 6) {
      this.renderCustomer(1, "salad", "Noah");
      this.renderCustomer(2, "toast", "Leo");
    }
  }

  startTimer() {
    this.stopTimer();
    if (this.practiceMode) {
      this.renderHUD();
      return;
    }
    this.timer = setInterval(() => {
      if (this.state !== "playing") return;
      this.timeLeft -= 1;
      this.renderHUD();
      if (this.timeLeft <= 0) this.finishLevel("time");
    }, 1000);
  }

  stopTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  renderHUD() {
    const profile = this.ageProfile();
    this.els.hudTimer.textContent = this.practiceMode ? "Practice" : `${Math.max(0, Math.ceil(this.timeLeft))}s`;
    this.els.hudProfit.textContent = `L${this.currentLevel ? this.currentLevel.id : 1} · ${profile.hudLabel}`;
    this.els.hudImpact.textContent = String(this.stats.saved + this.stats.helped);
    this.els.hudMeals.textContent = String(this.stats.meals);
    this.els.hudWaste.textContent = String(this.uniqueList(this.stats.scrapsCollected.concat(this.stats.materialsDiscovered)).length);
    this.els.hudCombo.textContent = `${this.taskIndex}/${this.tasks.length}`;
    const redirectLab = document.getElementById("hud-redirect-label");
    if (redirectLab) redirectLab.textContent = "Materials";
  }

  showTask() {
    if (this.taskIndex >= this.tasks.length) {
      this.finishLevel("complete");
      return;
    }
    const task = this.tasks[this.taskIndex];
    this.activePrompt = task;
    this.clearPlayUI(false);
    const ecoModes = ["eco", "material", "setting", "delivery", "route", "deliveryPlan", "labScan", "studioPlan", "product", "layout", "assembly", "finish", "loopSummary"];
    this.els.screenGame.classList.toggle("eco-lab-phase", ecoModes.includes(task.mode));
    this.levelPill.textContent = `Level ${this.currentLevel.id}`;
    this.levelTitle.textContent = this.currentLevel.title;
    this.stepCount.textContent = `${this.taskIndex + 1}/${this.tasks.length}`;
    this.renderQueue(task);
    this.logInfoTask(task);
    this.renderTaskVisual(task);
    this.renderHUD();

    if (task.type === "guide" && task.mode === "guide") {
      this.choiceTyping.clear();
      this.typing.clear();
      this.els.typingLabel.textContent = "Mentor Rio";
      this.els.typingHint.textContent = "Press Space for Rio's next line.";
      this.showRioDialogue(task);
      return;
    }

    if (task.type === "guide") {
      this.hideRioDialogue();
      const profile = this.ageProfile();
      this.choiceTyping.clear();
      this.els.typingLabel.textContent = "Continue";
      this.typing.setTarget(profile.guideWord, `Type ${profile.guideWord} or press the button when you are ready.`);
      this.attachGuideContinue(task);
      return;
    }

    if (task.type === "info") {
      this.hideRioDialogue();
      this.choiceTyping.clear();
      this.typing.clear();
      this.els.typingLabel.textContent = "Look at the path";
      this.els.typingHint.textContent = "Nice. Next step is coming...";
      setTimeout(() => {
        if (this.activePrompt === task && this.state === "playing") {
          this.taskIndex += 1;
          this.showTask();
        }
      }, task.duration || 1500);
      return;
    }

    if (task.type === "choice") {
      this.hideRioDialogue();
      const choices = this.typedChoices(task);
      const answer = this.typedAnswer(task);
      this.typing.clear();
      this.els.typingLabel.textContent = task.label;
      this.choiceTyping.setChoices(choices, answer);
      if (task.mode === "sort") {
        this.els.typingHint.textContent = "Read the card condition, then type the recovery route you choose.";
      } else if (task.mode === "separate") {
        this.els.typingHint.textContent = `Choose the first separation action: ${choices.join(" · ")}`;
      } else {
        this.els.typingHint.textContent = `${task.hint} Type: ${choices.join(" · ")}`;
      }
      return;
    }

    this.choiceTyping.clear();
    this.hideRioDialogue();
    this.els.typingLabel.textContent = task.label;
    this.typing.setTarget(this.typedWord(task), task.hint);
  }

  renderQueue(task) {
    const title = this.els.queueList.previousElementSibling;
    if (title) title.textContent = this.currentLevel.area;
    const rows = [];
    if (task.mode === "guide") rows.push(`Goal: ${task.goal}`);
    if (task.mode === "customerPeek") rows.push(...task.customers.map((c) => `${c.name}: ${this.cfg.dishEmoji[c.dish] || "🍽️"} ${this.dishLabel(c.dish)}`));
    if (task.mode === "scrapReveal") rows.push(`${task.title}: ${task.scraps.join(" / ")}`);
    if (task.mode === "customer") rows.push(`Choose: ${task.choices ? this.typedChoices(task).join(" / ") : `Table ${task.table}`}`);
    if (task.mode === "memory") rows.push(`Memory check: ${task.kind}`);
    if (task.mode === "stationChoice") rows.push(`Recipe station: ${this.typedChoices(task).join(" / ")}`);
    if (task.mode === "serve") rows.push(`${this.cfg.dishEmoji[task.dish] || "🍽️"} Table ${task.table}: ${task.dish}`);
    if (task.mode === "eco") rows.push(task.type === "info" ? `Lab: ${task.material} → ${task.product}` : `Process: ${task.choices ? this.typedChoices(task).join(" / ") : this.typedWord(task)}`);
    if (task.mode === "labScan") rows.push(`Scan: ${task.material}`);
    if (task.mode === "material") rows.push(`${task.material} → ${task.product}`);
    if (task.mode === "setting") rows.push(`Machine: ${this.typedChoices(task).join(" / ")}`);
    if (task.mode === "studioPlan") rows.push(task.hint);
    if (task.mode === "product") rows.push(`${task.fabric} → ${task.answer}`);
    if (task.mode === "layout") rows.push(`Layout: ${this.typedChoices(task).join(" / ")}`);
    if (task.mode === "assembly") rows.push(`Assembly: ${this.typedChoices(task).join(" / ")}`);
    if (task.mode === "finish") rows.push(`Finish: ${this.typedChoices(task).join(" / ")}`);
    if (task.mode === "delivery") rows.push(`${task.product} → ${this.typedAnswer(task)}`);
    if (task.mode === "route") rows.push(`Fairness check: ${this.typedChoices(task).join(" / ")}`);
    if (task.mode === "deliveryPlan") rows.push(task.hint);
    if (task.mode === "loopSummary") rows.push("Final circular journey");
    if (task.mode === "sort" || task.mode === "separate") rows.push(`${task.item}: choose the best place`);
    this.els.queueList.innerHTML = rows.map((r) => `<li><span>${r}</span></li>`).join("");
  }

  attachGuideContinue(task) {
    const btn = this.miniStage ? this.miniStage.querySelector("[data-guide-next]") : null;
    if (!btn) return;
    btn.addEventListener("click", () => {
      if (this.activePrompt !== task || this.state !== "playing") return;
      this.taskIndex += 1;
      this.showTask();
    });
  }

  guideLines(task) {
    return [task.goal, ...(task.steps || []), task.success].filter(Boolean);
  }

  showRioDialogue(task) {
    if (!this.els.dialoguePanel) return;
    const lines = this.guideLines(task);
    this.dialogueLineIndex = 0;
    this.els.dialogueSpeaker.textContent = "Mentor Rio";
    this.els.dialogueText.textContent = lines[0] || "";
    this.els.dialoguePanel.classList.remove("hidden");
  }

  advanceRioDialogue() {
    if (!this.activePrompt || this.activePrompt.type !== "guide" || this.activePrompt.mode !== "guide") return false;
    const lines = this.guideLines(this.activePrompt);
    if (this.dialogueLineIndex + 1 < lines.length) {
      this.dialogueLineIndex += 1;
      this.els.dialogueText.textContent = lines[this.dialogueLineIndex];
      return true;
    }
    this.hideRioDialogue();
    this.taskIndex += 1;
    this.showTask();
    return true;
  }

  hideRioDialogue() {
    this.els.dialoguePanel?.classList.add("hidden");
  }

  renderGuideCard(task) {
    return `
      <div class="guide-card">
        <div class="guide-speaker">Mentor Rio</div>
        <h3>${this.escapeHTML(task.title || this.currentLevel.title)}</h3>
        <p>${this.escapeHTML(task.goal || this.currentLevel.goal)}</p>
        <ol>
          ${(task.steps || []).map((step) => `<li>${this.escapeHTML(step)}</li>`).join("")}
        </ol>
        ${task.success ? `<p class="guide-success">${this.escapeHTML(task.success)}</p>` : ""}
        <button type="button" class="guide-next-btn" data-guide-next="1">Next</button>
      </div>`;
  }

  findCustomerForTable(table) {
    return (this.visibleCustomers || []).find((c) => c.table === table) || null;
  }

  dishLabel(dish) {
    return this.cfg.dishLabels[dish] || this.titleCase(dish);
  }

  logInfoTask(task) {
    if (!task || task._logged || task.type !== "info") return;
    task._logged = true;
    if (task.mode === "scrapReveal") {
      this.stats.scrapsCollected.push(...task.scraps);
      task.scraps.forEach((scrap) => this.rememberScrap(scrap));
      this.stats.currentScrap = task.scraps[0] || "";
      this.stats.saved += task.scraps.length;
    }
    if (task.mode === "labScan") {
      this.stats.currentScrap = task.material;
      this.rememberScrap(task.material);
    }
    if (task.mode === "eco") {
      this.stats.currentScrap = task.material;
      this.stats.lastTextile = task.product;
    }
    if (task.mode === "loopSummary") {
      this.stats.achievements.push("Full Cycora journey completed");
    }
  }

  renderTaskVisual(task) {
    if (task.type === "guide" && task.mode === "guide") {
      this.recipePath.innerHTML = "";
      this.miniStage.innerHTML = "";
      return;
    }
    if (task.type === "info" && task.mode === "recipe") {
      this.recipePath.innerHTML = task.steps
        .map((s) => `<span>${this.stationIcon(s)} ${this.stationName(s)}</span>`)
        .join("<b>→</b>");
      this.miniStage.innerHTML = `<div class="big-card"><span>🗺️</span><strong>${task.product} path</strong><p>${task.hint}</p></div>`;
      return;
    }
    if (task.type === "guide" && task.mode === "customerPeek") {
      this.visibleCustomers = task.customers.slice();
      task.customers.forEach((c) => this.renderCustomer(c.table, c.dish, c.name));
      this.recipePath.innerHTML = task.customers
        .map((c) => `<span>${this.escapeHTML(c.name)} ${this.cfg.dishEmoji[c.dish] || "🍽️"} ${this.dishLabel(c.dish)}</span>`)
        .join("");
      this.miniStage.innerHTML = `
        <div class="decision-grid customer-order-grid">
          ${task.customers
            .map(
              (c) => `<div class="decision-card">
                <b>${this.escapeHTML(c.name)} ${this.cfg.dishEmoji[c.dish] || "🍽️"}</b><span>${this.dishLabel(c.dish)}</span>
                ${c.scrap ? `<small>${c.scrap}</small>` : ""}
              </div>`
            )
            .join("")}
          <button type="button" class="guide-next-btn" data-guide-next="1">Next</button>
        </div>`;
      return;
    }
    if (task.type === "info" && task.mode === "scrapReveal") {
      this.recipePath.innerHTML = task.scraps.map((s) => `<span>${this.materialIcon(s)} ${s}</span>`).join("<b>→</b>");
      this.miniStage.innerHTML = `
        <div class="big-card material-reveal-card">
          <span>${this.materialIcon(task.scraps[0])}</span>
          <strong>${task.title}</strong>
          <p>${task.hint}</p>
          <div class="choice-row-mini">${task.scraps.map((s) => `<span>${s}</span>`).join("")}</div>
          ${this.renderScrapMemoryStrip(task.scraps)}
        </div>`;
      return;
    }
    if (task.type === "info" && task.mode === "labScan") {
      this.miniStage.innerHTML = this.renderScannerCard(task);
      return;
    }
    if (task.type === "info" && task.mode === "eco") {
      this.recipePath.innerHTML = task.steps.map((s) => `<span>${s}</span>`).join("<b>→</b>");
      this.miniStage.innerHTML = this.renderEcoLine(task, "start");
      return;
    }
    if (task.type === "info" && task.mode === "studioPlan") {
      this.miniStage.innerHTML = this.renderStudioCard(task, "plan");
      return;
    }
    if (task.type === "info" && task.mode === "deliveryPlan") {
      this.miniStage.innerHTML = this.renderDeliveryLine(task, "plan");
      return;
    }
    if (task.type === "info" && task.mode === "loopSummary") {
      this.miniStage.innerHTML = this.renderLoopJourney();
      return;
    }
    if (task.mode === "customer" && task.type === "choice") {
      if (task.focus) {
        this.renderCustomer(task.focus.table, task.focus.dish, this.titleCase(task.answer));
        this.highlightCustomer(task.focus.table);
      }
      this.miniStage.innerHTML = `<div class="big-card"><span>${task.focus ? this.cfg.dishEmoji[task.focus.dish] || "🍽️" : "👋"}</span><strong>Active customer</strong><p>${task.hint}</p><div class="choice-row-mini">${this.typedChoiceTags(task)}</div></div>`;
      return;
    }
    if (task.mode === "memory") {
      this.miniStage.innerHTML = `<div class="big-card"><span>🧠</span><strong>Remember the order</strong><p>${task.hint}</p><div class="choice-row-mini">${this.typedChoiceTags(task)}</div></div>`;
      return;
    }
    if (task.mode === "customer") {
      this.renderCustomer(task.table);
      this.highlightCustomer(task.table);
      this.setChefPose("serve");
      this.miniStage.innerHTML = `<div class="big-card"><span>👋</span><strong>Table ${task.table}</strong><p>${task.hint}</p></div>`;
      return;
    }
    if (task.mode === "stationChoice") {
      this.highlightStation(task.station);
      this.setChefPose(task.station);
      this.recipePath.innerHTML = task.choices.map((s, i) => `<span>${this.stationIcon(s)} ${this.stationName(s)} · type ${this.typedChoices(task)[i]}</span>`).join("");
      this.miniStage.innerHTML = `<div class="big-card"><span>${this.stationIcon(task.station)}</span><strong>Choose the next station</strong><p>${task.hint}</p><div class="choice-row-mini">${this.typedChoiceTags(task)}</div></div>`;
      return;
    }
    if (task.mode === "station") {
      this.highlightStation(task.station);
      this.setChefPose(task.station);
      this.miniStage.innerHTML = `<div class="big-card"><span>${this.stationIcon(task.station)}</span><strong>${this.stationName(task.station)}</strong><p>${task.hint}</p></div>`;
      return;
    }
    if (task.mode === "serve") {
      const customer = this.findCustomerForTable(task.table);
      this.renderCustomer(task.table, task.dish, customer ? customer.name : "");
      this.highlightCustomer(task.table);
      this.highlightStation("serve");
      this.setChefPose("serve");
      this.miniStage.innerHTML = `<div class="big-card"><span>${this.cfg.dishEmoji[task.dish] || "🍽️"}</span><strong>${this.dishLabel(task.dish)} → ${customer ? this.escapeHTML(customer.name) : `Table ${task.table}`}</strong><p>${task.hint}</p></div>`;
      return;
    }
    if (task.mode === "sort") {
      this.els.wasteDock.classList.remove("hidden");
      this.els.screenGame.classList.add("waste-phase");
      this.els.leftoverSlot.innerHTML = `<div class="leftover-card leftover-card-recovery"><span class="leftover-icon">${this.itemIcon(task.item)}</span><p class="leftover-meta"><strong>${task.item}</strong><br>${task.hint}</p></div>`;
      this.els.wasteHint.textContent = "Look at the condition before choosing a route.";
      this.highlightBins(task.choices, false);
      this.miniStage.innerHTML = `<div class="big-card sort-card"><span>${this.itemIcon(task.item)}</span><strong>${task.item}</strong><p>${task.hint}</p><div class="choice-row-mini choice-row-plain">${this.typedChoiceTags(task)}</div></div>`;
      return;
    }
    if (task.mode === "separate") {
      this.els.screenGame.classList.add("waste-phase");
      this.miniStage.innerHTML = `
        <div class="big-card sort-card mixed-card">
          <span>🥤</span>
          <strong>${task.item}</strong>
          <p>${task.hint}</p>
          <div class="mixed-parts">
            <span>liquid</span><span>lid</span><span>cup</span>
          </div>
          <div class="choice-row-mini">${this.typedChoiceTags(task)}</div>
        </div>`;
      return;
    }
    if (task.mode === "material") {
      this.miniStage.innerHTML = this.renderScannerCard(task);
      return;
    }
    if (task.mode === "setting") {
      this.miniStage.innerHTML = this.renderEcoLine(task, "setting");
      return;
    }
    if (task.mode === "eco") {
      this.setChefPose("plate");
      const step = task.word || task.answer;
      this.miniStage.innerHTML = this.renderEcoLine(task, step);
      return;
    }
    if (task.mode === "product" || task.mode === "layout" || task.mode === "assembly" || task.mode === "finish") {
      this.miniStage.innerHTML = this.renderStudioCard(task, task.mode);
      return;
    }
    if (task.mode === "delivery" || task.mode === "route") {
      this.miniStage.innerHTML = this.renderDeliveryLine(task, task.answer);
    }
  }

  recipeIntro(name, steps, note = "") {
    const path = steps.map((s) => this.stationName(s)).join(" → ");
    return { type: "info", mode: "recipe", hint: note ? `${name}: ${path}. ${note}` : `${name}: ${path}`, steps, product: name, duration: 1300 };
  }

  rememberScrap(scrap) {
    const memory = this.scrapMemory(scrap);
    const key = `${memory.scrap}:${memory.title}`;
    if (!this.stats.scrapMemories.some((item) => `${item.scrap}:${item.title}` === key)) {
      this.stats.scrapMemories.push(memory);
    }
    return memory;
  }

  scrapMemory(scrap) {
    const s = String(scrap || "scrap").toLowerCase();
    const fallback = {
      scrap,
      feeling: "Curious",
      color: "#8fb7d8",
      title: "Second-chance memory",
      text: "This scrap remembers being part of a meal and wonders what it can become next.",
      cue: "listen",
    };
    const memories = [
      {
        match: /orange|lemon|citrus/,
        feeling: "Bright",
        color: "#f5a623",
        title: "Sunny table memory",
        text: "It remembers a bright peel twist, a shared laugh, and the color left behind on the plate.",
        cue: "glow",
      },
      {
        match: /banana/,
        feeling: "Steady",
        color: "#e8c84a",
        title: "Lunchbox memory",
        text: "It remembers being packed for a busy day, soft on the outside with strong strands inside.",
        cue: "stretch",
      },
      {
        match: /avocado/,
        feeling: "Tender",
        color: "#d8899d",
        title: "Slow kitchen memory",
        text: "It remembers careful hands, a quiet table, and a hidden pink color waiting in the pit.",
        cue: "warm",
      },
      {
        match: /coffee/,
        feeling: "Focused",
        color: "#8a5a3b",
        title: "Morning rush memory",
        text: "It remembers steam, quick footsteps, and a deep brown mark that can become a print.",
        cue: "grind",
      },
      {
        match: /corn/,
        feeling: "Proud",
        color: "#d6a942",
        title: "Harvest memory",
        text: "It remembers being peeled back in strips, strong enough to fold, braid, and hold shape.",
        cue: "weave",
      },
    ];
    const found = memories.find((memory) => memory.match.test(s));
    return { ...fallback, ...found, scrap };
  }

  renderScrapMemoryStrip(scraps) {
    const memories = this.uniqueList(scraps || [])
      .map((scrap) => this.scrapMemory(scrap))
      .slice(0, 4);
    if (!memories.length) return "";
    return `<div class="scrap-memory-strip">${memories.map((memory) => this.renderMemoryOrb(memory, true)).join("")}</div>`;
  }

  renderMemoryOrb(memory, compact = false) {
    return `
      <div class="memory-orb-card ${compact ? "memory-orb-card--compact" : ""}" style="--memory-color:${memory.color}">
        <span class="memory-orb" aria-hidden="true"></span>
        <b>${this.escapeHTML(memory.feeling)} memory</b>
        <strong>${this.escapeHTML(memory.title)}</strong>
        ${compact ? "" : `<p>${this.escapeHTML(memory.text)}</p>`}
        <small>cue: ${this.escapeHTML(memory.cue)}</small>
      </div>`;
  }

  renderScannerCard(task) {
    const material = task.material || "scrap";
    const properties = task.properties || this.materialProperties(material);
    const choices = task.choices ? `<div class="recipient-row-mini">${this.typedChoiceTags(task)}</div>` : "";
    const memory = this.scrapMemory(material);
    return `
      <div class="scanner-card">
        <div class="scanner-head"><span>${this.materialIcon(material)}</span><strong>Material scanner</strong><em>${material}</em></div>
        <div class="scanner-window">
          <div class="scanner-beam"></div>
          <div class="scanner-scrap">${this.materialIcon(material)}</div>
          <div class="property-stack">
            ${properties.map((p) => `<span>${p}</span>`).join("")}
          </div>
        </div>
        ${this.renderMemoryOrb(memory)}
        <p>${task.hint || "Look for hidden textile potential."}</p>
        ${choices}
      </div>`;
  }

  renderStudioCard(task, active) {
    const product = task.answer || task.product || "product";
    const fabric = task.fabric || this.stats.lastTextile || "fabric";
    const choices = task.choices ? `<div class="recipient-row-mini">${this.typedChoiceTags(task)}</div>` : "";
    const steps = ["product", "layout", "assembly", "finish"];
    return `
      <div class="studio-board">
        <div class="factory-head"><span>${this.productIcon(product)}</span><strong>Product Studio</strong><em>Waste ${Math.max(0, 100 - this.stats.saved * 6)}%</em></div>
        <div class="studio-table">
          <div class="fabric-swatch"><span>${this.fabricIcon(fabric)}</span><b>${fabric}</b></div>
          <div class="pattern-grid">
            ${steps.map((s) => `<span class="${s === active ? "active" : ""}">${this.studioIcon(s)} ${s}</span>`).join("")}
          </div>
          <div class="product-preview"><span>${this.productIcon(product)}</span><b>${product}</b><small>${task.impact || "useful textile product"}</small></div>
        </div>
        <p>${task.hint || "Choose a product that fits the fabric."}</p>
        ${choices}
      </div>`;
  }

  renderLoopJourney() {
    const served = this.stats.recipesCompleted[0] || "food served";
    const scrap = this.stats.scrapsCollected[0] || "scraps collected";
    const material = this.stats.materialsDiscovered[0] || "material discovered";
    const textile = this.stats.lastTextile || "textile created";
    const product = this.stats.lastProduct || "product made";
    const impact = this.stats.communityImpacts[0] || "community support";
    return `
      <div class="full-loop-card journey-card">
        <strong>Cycora cinematic loop</strong>
        <div class="loop-strip">
          <span>${served}</span><b>→</b><span>${scrap}</span><b>→</b><span>${material}</span><b>→</b><span>${textile}</span><b>→</b><span>${product}</span><b>→</b><span>person receives it</span><b>→</b><span>loop continues</span>
        </div>
        <p>${impact}. Waste avoided: ${this.stats.saved}. People helped: ${this.stats.helped}.</p>
      </div>`;
  }

  renderEcoLine(task, activeStep) {
    const stationList = ["collect", "wash", "peel", "extract", "spin", "weave", "dye", "dry", "grind", "mix", "print", "press", "stitch", "pack"];
    const steps = task.steps || stationList;
    const activeKey = stationList.includes(activeStep) ? activeStep : "collect";
    const activeIndex = Math.max(0, stationList.indexOf(activeKey));
    const progress = Math.max(5, Math.min(92, (activeIndex / (stationList.length - 1)) * 100));
    const product = task.product || "textile";
    const material = task.material || "rescued scraps";
    const maker = activeStep === "pack" ? this.ecoMaker(product) : `<div class="eco-maker"><img class="maker-body-img" src="eco-lab-kitchen-to-closet/assets/Eco-Maker.png" alt="Eco Maker" /><small>Eco Maker</small></div>`;
    const choices = task.choices ? `<div class="recipient-row-mini">${this.typedChoiceTags(task)}</div>` : "";
    return `
      <div class="eco-lab-board">
        <div class="factory-head"><span>${this.materialIcon(material)}</span><strong>Fabric workshop</strong><em>Quality ${this.stats.qualityScore}%</em></div>
        <div class="production-line fabric-process-line" style="--pod-left:${progress}%; --station-count:${stationList.length}">
          <div class="belt-track"></div>
          ${stationList
            .map(
              (step) => `<div class="machine-node ${step === activeKey ? "active" : ""} ${steps.includes(step) ? "needed" : ""}">
                <span>${this.machineIcon(step)}</span><b>${step}</b>
                ${step === activeKey ? `<i class="station-machine machine-${step}"><em>${this.materialIcon(material)}</em></i>` : ""}
              </div>`
            )
            .join("")}
        </div>
        <div class="lab-floor">
          <div class="processing-tank"><span>${this.machineIcon(activeStep)}</span><b>${activeStep === "setting" ? "settings" : activeStep === "match" ? "ingredient" : activeStep}</b><small>${task.hint || "Move the material along the line."}</small></div>
          ${maker}
          <div class="product-rack"><span>${this.productIcon(product)}</span><b>${product}</b><small>product rack</small></div>
        </div>
        ${choices}
      </div>`;
  }

  renderDeliveryLine(task, activeStop) {
    const stops = ["rack", "shelter", "market", "winter", "restaurant"];
    const activeIndex = Math.max(0, stops.indexOf(activeStop));
    const progress = Math.max(8, Math.min(92, (activeIndex / (stops.length - 1)) * 100));
    const product = task.product || "products";
    const choices = this.typedChoices(task).length ? this.typedChoices(task) : ["shelter", "market", "winter"];
    return `
      <div class="eco-lab-board delivery-board">
        <div class="factory-head"><span>📦</span><strong>Community delivery line</strong><em>Fairness ${this.stats.fairnessScore}%</em></div>
        <div class="production-line delivery-line" style="--pod-left:${progress}%">
          <div class="belt-track"></div>
          <div class="material-pod">${this.productIcon(product)}</div>
          ${stops
            .map(
              (stop) => `<div class="machine-node ${stop === activeStop ? "active" : ""} needed">
                <span>${this.deliveryIcon(stop)}</span><b>${stop}</b>
              </div>`
            )
            .join("")}
        </div>
        <div class="lab-floor">
          <div class="processing-tank"><span>${this.productIcon(product)}</span><b>${product}</b><small>${task.hint}</small></div>
          ${this.ecoMaker(product === "products" ? "tote" : product)}
          <div class="product-rack"><span>${this.deliveryIcon(activeStop)}</span><b>${activeStop === "plan" ? "needs" : activeStop}</b><small>community stop</small></div>
        </div>
        <div class="recipient-row-mini">${choices.map((c) => `<span>${c}</span>`).join("")}</div>
      </div>`;
  }

  ecoMaker(product) {
    const icon = this.productIcon(product);
    return `
      <div class="eco-maker eco-maker-finished eco-maker-${product}">
        <img class="maker-body-img" src="eco-lab-kitchen-to-closet/assets/Eco-Maker.png" alt="Eco Maker" />
        <span class="maker-product">${icon}</span>
        <small>I made this!</small>
      </div>`;
  }

  machineIcon(step) {
    return {
      collect: "▦",
      wash: "💧",
      peel: "◔",
      sort: "▦",
      clean: "💧",
      extract: "⚗",
      spin: "◎",
      dye: "◒",
      weave: "▤",
      grind: "◌",
      mix: "◍",
      print: "▧",
      press: "▥",
      stitch: "✂",
      dry: "☼",
      pack: "▣",
      setting: "🎛️",
      match: "↔",
      start: "▶",
    }[step] || "•";
  }

  deliveryIcon(stop) {
    return { rack: "▣", shelter: "🏠", market: "👜", winter: "🧣", restaurant: "🍽️", plan: "📋" }[stop] || "📦";
  }

  stationIcon(station) {
    return { fridge: "🧊", pantry: "🥫", chop: "🔪", sink: "💧", stove: "🔥", plate: "🍽️", serve: "🙌" }[station] || "⭐";
  }

  sortIcon(answer) {
    return { donation: "💛", compost: "🌱", recycle: "♻️", trash: "🗑️" }[answer] || "♻️";
  }

  itemIcon(item) {
    const s = item.toLowerCase();
    if (s.includes("bottle")) return "🥤";
    if (s.includes("drink") || s.includes("cup") || s.includes("lid")) return "🥤";
    if (s.includes("cardboard")) return "📦";
    if (s.includes("bread")) return "🍞";
    if (s.includes("soup")) return "🥣";
    if (s.includes("banana")) return "🍌";
    if (s.includes("orange")) return "🍊";
    if (s.includes("coffee")) return "☕";
    if (s.includes("peel") || s.includes("veggie")) return "🥕";
    if (s.includes("napkin") || s.includes("wrap")) return "🧻";
    if (s.includes("plate")) return "🍽️";
    return "❔";
  }

  materialIcon(material) {
    if (/orange|lemon|citrus/.test(material)) return this.assetIcon("eco-lab-kitchen-to-closet/assets/orange.png", "citrus peels");
    if (/avocado/.test(material)) return this.assetIcon("eco-lab-kitchen-to-closet/assets/avacado.png", "avocado pit");
    if (/banana/.test(material)) return this.assetIcon("eco-lab-kitchen-to-closet/assets/banana.png", "banana fiber");
    if (/corn/.test(material)) return this.assetIcon("eco-lab-kitchen-to-closet/assets/corn.png", "corn husk");
    if (/coffee/.test(material)) return this.assetIcon("eco-lab-kitchen-to-closet/assets/coffee-beans.png", "coffee grounds");
    return "🌿";
  }

  productIcon(product) {
    return {
      tote: this.assetIcon("eco-lab-kitchen-to-closet/assets/tote.png", "tote"),
      scarf: this.assetIcon("eco-lab-kitchen-to-closet/assets/scarf.png", "scarf"),
      blanket: this.assetIcon("eco-lab-kitchen-to-closet/assets/blanket.png", "blanket"),
      dress: this.assetIcon("eco-lab-kitchen-to-closet/assets/dress.png", "dress"),
      jacket: this.assetIcon("eco-lab-kitchen-to-closet/assets/jacket.png", "jacket"),
      jacket2: this.assetIcon("eco-lab-kitchen-to-closet/assets/jacket-2.png", "jacket"),
      shirt: this.assetIcon("eco-lab-kitchen-to-closet/assets/shirt.png", "shirt"),
      shorts: this.assetIcon("eco-lab-kitchen-to-closet/assets/shorts.png", "shorts"),
      uniform: this.assetIcon("eco-lab-kitchen-to-closet/assets/uniform.png", "uniform"),
      waistcoat: this.assetIcon("eco-lab-kitchen-to-closet/assets/waistcoat.png", "waistcoat"),
      maleclothes: this.assetIcon("eco-lab-kitchen-to-closet/assets/male-clothes.png", "clothing"),
      womanclothes: this.assetIcon("eco-lab-kitchen-to-closet/assets/woman-clothes.png", "clothing"),
      apron: this.assetIcon("eco-lab-kitchen-to-closet/assets/apron.png", "apron"),
      pouch: this.assetIcon("eco-lab-kitchen-to-closet/assets/pouch.png", "pouch"),
      purse: this.assetIcon("eco-lab-kitchen-to-closet/assets/purse.png", "purse"),
      fabric: "▣",
      discovery: "⌕",
      batch: "▦",
      kit: "▦",
      banner: "▰",
      placemat: "▤",
      product: "🎁",
    }[product] || "🎁";
  }

  assetIcon(src, alt) {
    return `<img class="cycora-icon" src="${src}" alt="${alt}" loading="lazy" />`;
  }

  fabricIcon(fabric) {
    const s = String(fabric).toLowerCase();
    if (s.includes("strong")) return "▤";
    if (s.includes("soft")) return "◒";
    if (s.includes("thick")) return "▥";
    if (s.includes("print")) return "▧";
    if (s.includes("dyed")) return "◒";
    return "▣";
  }

  studioIcon(step) {
    return { product: "choose", layout: "cut", assembly: "stitch", finish: "tag" }[step] || step;
  }

  materialProperties(material) {
    const s = String(material).toLowerCase();
    if (s.includes("orange")) return ["color potential", "citrus oils", "soft rind"];
    if (s.includes("lemon")) return ["citrus dye", "bright finish", "plant acids"];
    if (s.includes("banana")) return ["fiber strength", "long strands", "plant cellulose"];
    if (s.includes("corn")) return ["woven texture", "flexible strips", "dry strength"];
    if (s.includes("coffee")) return ["brown pigment", "crumbly texture", "print grit"];
    if (s.includes("avocado")) return ["pink dye", "tannin", "slow simmer"];
    return ["hidden value", "material clue", "design potential"];
  }

  transformationPath(material, product) {
    if (/orange/.test(material)) return "Orange peels -> citrus dye -> dyed cloth";
    if (/banana/.test(material)) return "Banana peels -> cellulose strands -> plant fiber cloth";
    if (/corn/.test(material)) return "Corn husks -> woven fiber -> thick textile";
    if (/coffee/.test(material)) return "Coffee grounds -> pigment -> printed fabric";
    if (/avocado/.test(material)) return "Avocado pits -> pink dye -> dyed cloth";
    return `${material} -> material -> ${product}`;
  }

  onWordComplete() {
    if (this.state !== "playing" || !this.activePrompt) return;
    this.completeTask(true);
  }

  onChoiceComplete(word) {
    if (this.state !== "playing" || !this.activePrompt) return;
    const task = this.activePrompt;
    const typedAnswer = this.typedAnswer(task);
    const ok = word === typedAnswer;
    if (!ok) {
      this.stats.mistakes += 1;
      if (task.mode === "sort" || task.mode === "separate") {
        this.stats.wrongSorts += 1;
        this.stats.recoveryScore = Math.max(0, this.stats.recoveryScore - 12);
        this.stats.sortExplanations.push(`Try ${typedAnswer}: ${task.explanation}`);
      }
      if (task.mode === "eco" || task.mode === "setting" || task.mode === "material" || task.mode === "stationChoice" || task.mode === "product" || task.mode === "layout" || task.mode === "assembly" || task.mode === "finish") {
        this.stats.qualityScore = Math.max(0, this.stats.qualityScore - 8);
      }
      if (task.mode === "delivery" || task.mode === "route") this.stats.fairnessScore = Math.max(0, this.stats.fairnessScore - 10);
      this.floatScore(this.miniStage, task.explanation || "Try again", false);
      this.showTask();
      this.els.typingHint.textContent = `That is okay. Try "${typedAnswer}" next.`;
      return;
    }
    this.completeTask(true);
  }

  completeTask() {
    const task = this.activePrompt;
    const profile = this.ageProfile();
    this.stats.typed += 1;
    if (task.countsDecision) this.stats.decisions += 1;
    if (task.mode === "serve") this.stats.meals += 1;
    if (task.mode === "sort" || task.mode === "separate") {
      this.stats.correctSorts += 1;
      if (task.answer !== "trash") this.stats.saved += 1;
      this.stats.sortExplanations.push(task.explanation);
      this.stats.materialsRescued.push(`${task.item} -> ${task.answer}`);
    }
    if (task.mode === "stationChoice") {
      this.stats.qualityScore = Math.min(100, this.stats.qualityScore + 1);
      if (task.answer === "plate") this.stats.recipesCompleted.push("Recipe path completed");
    }
    if (task.mode === "setting") this.stats.qualityScore = Math.min(100, this.stats.qualityScore + 2);
    if (task.mode === "material") {
      this.stats.materialsRescued.push(`${task.material} -> ${task.product}`);
      this.stats.materialsDiscovered.push(`${task.material} -> ${task.product}`);
    }
    if (task.mode === "eco") {
      const step = task.word || task.answer;
      if (step === "dry" || step === "weave" || step === "print" || step === "press" || step === "pack") {
        this.stats.lastTextile = task.product;
        if (!this.stats.textilesCreated.includes(task.product)) this.stats.textilesCreated.push(task.product);
      }
    }
    if (task.mode === "eco" && (task.word === "pack" || task.answer === "pack")) {
      this.stats.saved += 1;
      const path = this.transformationPath(task.material, task.product);
      this.stats.achievements.push(path);
    }
    if (task.mode === "product") {
      this.stats.products += 1;
      this.stats.saved += 1;
      this.stats.lastProduct = task.answer;
      this.stats.productsMade.push(`${this.productIcon(task.answer)} ${task.fabric} -> ${task.answer}`);
      if (task.impact) this.stats.communityImpacts.push(task.impact);
    }
    if (task.mode === "layout") this.stats.saved += 1;
    if (task.mode === "assembly" || task.mode === "finish") {
      this.stats.qualityScore = Math.min(100, this.stats.qualityScore + 2);
    }
    if (task.mode === "delivery") {
      this.stats.helped += task.people || 1;
      this.stats.lastProduct = task.product;
      this.stats.achievements.push(`${task.product} delivered → ${task.answer}`);
      this.stats.loopEvents.push(`${task.product} used at ${task.answer}`);
      this.stats.communityImpacts.push(`${task.product} -> ${task.answer}`);
    }
    this.floatScore(this.miniStage, task.explanation || task.feedback || profile.correctFeedback, true);
    this.taskIndex += 1;
    setTimeout(() => {
      if (this.state === "playing") this.showTask();
    }, task.explanation ? 1050 : 260);
  }

  onTypingMistake() {
    if (this.state !== "playing") return;
    this.stats.mistakes += 1;
    this.els.typingHint.textContent = this.ageProfile().mistakeHint;
    this.floatScore(this.miniStage, "Try the highlighted letter", false);
  }

  finishLevel(reason) {
    if (this.state !== "playing") return;
    this.state = "results";
    this.stopTimer();
    this.typing.clear();
    this.choiceTyping.clear();
    this.clearPlayUI();
    const completed = this.taskIndex >= this.tasks.length;
    let stars = completed ? 2 : 1;
    const strongSystems = this.stats.recoveryScore >= 80 && this.stats.qualityScore >= 80 && this.stats.fairnessScore >= 80;
    if (completed && this.stats.mistakes <= 3 && strongSystems && reason !== "time") stars = 3;
    this.stats.stars = stars;
    this.stats.circularScore = this.calculateCircularScore();
    if (completed) {
      this.saveUnlocked(this.currentLevel.id + 1);
      this.currentAchievement = this.saveAchievement(this.buildAchievement());
    }
    this.showResults(completed);
  }

  showResults(completed) {
    this.els.screenGame.classList.add("hidden");
    this.els.screenResults.classList.remove("hidden");
    const title = document.getElementById("results-title");
    if (title) title.textContent = completed ? `${this.currentLevel.title} complete!` : "Good practice run";
    this.els.resultsStars.textContent = "★".repeat(this.stats.stars) + "☆".repeat(3 - this.stats.stars);
    const productPreview = this.stats.lastProduct
      ? `${this.productIcon(this.stats.lastProduct)} created by Eco Maker`
      : "No product this round";
    const statRows = [
      ["Scraps collected", String(this.uniqueList(this.stats.scrapsCollected).length)],
      ["Textiles created", String(this.uniqueList(this.stats.textilesCreated).length)],
      ["Final product", productPreview],
      ["People helped", String(this.stats.helped)],
    ];
    this.els.resultsStats.innerHTML = statRows.map(([k, v]) => `<li><span>${k}</span><strong>${v}</strong></li>`).join("");
    this.els.resultsFlavor.textContent = completed
      ? this.ageGroup === "adults"
        ? "Simulation complete: the chain stayed visible from service to scrap, material, textile, product, and community use."
        : this.currentLevel.id === 6
        ? "Full loop complete: a meal was served, a scrap was saved, a material was discovered, a textile was made, a product was designed, and a person received it."
        : "You helped Cycora prove that waste is often a failure of imagination, not a lack of value."
      : "No worries. Practice mode and retry are here whenever you want a calmer run.";
    this.renderResultsExtras();
    const prompt = document.getElementById("results-next-prompt");
    if (prompt) prompt.textContent = "";
    const next = document.getElementById("btn-next-level");
    if (next) {
      next.textContent = this.levels.length === 1 ? "Play loop again" : this.levelIndex + 1 >= this.levels.length ? "Play final again" : "Next level";
      next.style.display = completed ? "" : "none";
    }
    const boardBtn = document.getElementById("btn-results-leaderboard");
    if (boardBtn) boardBtn.style.display = "none";
  }

  renderResultsExtras() {
    let extras = document.getElementById("results-extra");
    if (!extras) {
      extras = document.createElement("div");
      extras.id = "results-extra";
      extras.className = "results-extra";
      this.els.resultsStats.insertAdjacentElement("afterend", extras);
    }
    extras.innerHTML = "";
  }

  renderAchievementCeremony(achievement) {
    return `
      <div class="achievement-ceremony">
        <div class="ceremony-product">
          <span>${this.productIcon(achievement.productId)}</span>
          <b>${achievement.productName}</b>
          <small>${achievement.sourceMaterial}</small>
        </div>
        <div class="ceremony-arrow">→</div>
        ${this.ecoMaker(achievement.productId)}
        <div class="ceremony-arrow ceremony-arrow-community">→</div>
        <div class="community-recipient">
          <span>${this.communityIcon(achievement.communityGroup)}</span>
          <b>${achievement.communityGroup}</b>
          <small>${achievement.reuseImpact}</small>
        </div>
        <div class="ceremony-message">
          <strong>${achievement.message}</strong>
          <p>Eco Maker added it to the collection and shared it with someone who can use it.</p>
          <div class="badge-row">${achievement.badges.map((b) => `<span>${b}</span>`).join("")}</div>
        </div>
      </div>`;
  }

  renderLeaderboardPreview() {
    const achievements = this.readAchievements().slice(0, 3);
    if (!achievements.length) return "";
    return `
      <div class="leaderboard-preview">
        <strong>Achievement board</strong>
        ${achievements
          .map(
            (a, i) => `<div class="leaderboard-preview-row">
              <span>#${i + 1}</span><b>${a.playerName || "Cycora Maker"}: ${a.productName}</b><em>${a.circularScore} pts</em>
            </div>`
          )
          .join("")}
      </div>`;
  }

  calculateCircularScore() {
    const service = this.stats.meals * 18 + Math.max(0, 40 - this.stats.mistakes * 2);
    const recipe = this.stats.recipesCompleted.length * 12 + this.stats.decisions * 4;
    const discovery = this.uniqueList(this.stats.materialsDiscovered).length * 24;
    const process = Math.round(this.stats.qualityScore * 1.5);
    const product = this.stats.products * 55 + this.stats.fairnessScore;
    const impact = this.stats.saved * 18 + this.stats.helped * 12;
    const mistakePenalty = this.stats.mistakes * (this.ageGroup === "kids" ? 5 : this.ageGroup === "teens" ? 14 : 7);
    const teenBonus = this.ageGroup === "teens" ? Math.max(0, 75 - this.stats.mistakes * 10) + this.stats.decisions * 3 : 0;
    const adultBalance = this.ageGroup === "adults" ? Math.round((this.stats.qualityScore + this.stats.fairnessScore) / 2) : 0;
    return Math.max(0, service + recipe + discovery + process + product + impact + teenBonus + adultBalance - mistakePenalty);
  }

  buildAchievement() {
    const productId = this.inferProductId();
    const productName = this.productDisplayName(productId);
    const sourceMaterial = this.inferSourceMaterial();
    const transformationPath = this.inferTransformationPath(sourceMaterial, productId);
    const impact = this.inferImpact(productId);
    const badges = this.badgesForAchievement(productId);
    const achievedAt = new Date();
    const sessionLabel = achievedAt.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    return {
      id: `cycora-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      playerName: this.savePlayerName(document.getElementById("player-name-input")?.value || this.playerName),
      sessionLabel,
      achievedAt: achievedAt.toISOString(),
      levelId: this.currentLevel.id,
      levelTitle: this.currentLevel.title,
      productId,
      productName,
      sourceMaterial,
      transformationPath,
      qualityRating: this.stats.stars,
      wasteAvoided: this.stats.saved,
      peopleHelped: this.stats.helped,
      reuseImpact: impact,
      communityGroup: this.inferCommunityGroup(productId),
      circularScore: this.stats.circularScore,
      mistakes: this.stats.mistakes,
      badges,
      message: this.ecoMakerMessage(productId, sourceMaterial),
    };
  }

  readAchievements() {
    try {
      const parsed = JSON.parse(localStorage.getItem("cycora_achievement_board") || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  saveAchievement(achievement) {
    const achievements = this.readAchievements();
    achievements.push(achievement);
    achievements.sort((a, b) => (b.circularScore || 0) - (a.circularScore || 0));
    localStorage.setItem("cycora_achievement_board", JSON.stringify(achievements.slice(0, 30)));
    return achievement;
  }

  showLeaderboard() {
    if (!this.els.leaderboardModal || !this.els.leaderboardBody) return;
    if (this.state === "playing" && !this.practiceMode && !this.boardPausedTimer) {
      this.stopTimer();
      this.boardPausedTimer = true;
    }
    this.els.leaderboardBody.innerHTML = this.renderLeaderboardBoard();
    this.els.leaderboardModal.classList.remove("hidden");
  }

  hideLeaderboard() {
    this.els.leaderboardModal?.classList.add("hidden");
    if (this.boardPausedTimer && this.state === "playing") {
      this.boardPausedTimer = false;
      this.startTimer();
    }
  }

  isLeaderboardOpen() {
    return !!this.els.leaderboardModal && !this.els.leaderboardModal.classList.contains("hidden");
  }

  renderLeaderboardBoard() {
    const achievements = this.readAchievements();
    if (!achievements.length) {
      return `
        <div class="empty-board">
          <span>▣</span>
          <strong>No products in the collection yet</strong>
          <p>Finish a level to give Eco Maker your first circular design achievement.</p>
        </div>`;
    }
    return `
      <div class="leaderboard-table">
        ${achievements
          .map(
            (a, i) => `<article class="leaderboard-row">
              <div class="rank-pill">#${i + 1}</div>
              <div class="leader-product"><span>${this.productIcon(a.productId)}</span><b>${this.escapeHTML(a.playerName || "Cycora Maker")}</b><small>${this.escapeHTML(a.sessionLabel || a.levelTitle)}</small></div>
              <div><span class="leader-label">Level</span><strong>${this.escapeHTML(a.levelTitle)}</strong></div>
              <div><span class="leader-label">Product</span><strong>${this.escapeHTML(a.productName)}</strong></div>
              <div><span class="leader-label">Source</span><strong>${this.escapeHTML(a.sourceMaterial)}</strong></div>
              <div><span class="leader-label">Quality</span><strong>${"★".repeat(a.qualityRating || 0)}${"☆".repeat(3 - (a.qualityRating || 0))}</strong></div>
              <div><span class="leader-label">Waste avoided</span><strong>${a.wasteAvoided || 0}</strong></div>
              <div><span class="leader-label">Community</span><strong>${this.escapeHTML(a.communityGroup || "Community member")}</strong></div>
              <div><span class="leader-label">Score</span><strong>${a.circularScore || 0}</strong></div>
              <div class="leader-badges">${(a.badges || []).map((b) => `<span>${this.escapeHTML(b)}</span>`).join("")}</div>
            </article>`
          )
          .join("")}
      </div>`;
  }

  inferProductId() {
    if (this.stats.lastProduct) return this.stats.lastProduct;
    if (this.currentLevel.id === 4) return "fabric";
    if (this.currentLevel.id === 3) return "discovery";
    if (this.currentLevel.id === 2) return "batch";
    return "kit";
  }

  productDisplayName(productId) {
    const source = this.inferSourceMaterial().toLowerCase();
    if (productId === "tote" && source.includes("orange")) return "Citrus-Dyed Tote";
    if (productId === "apron" && source.includes("orange")) return "Citrus-Dyed Apron";
    if (productId === "scarf") return "Soft Dyed Scarf";
    if (productId === "jacket") return "Warm Woven Jacket";
    if (productId === "shirt") return "Colorful Dyed Shirt";
    if (productId === "pouch") return "Printed Lunch Pouch";
    if (productId === "purse") return "Circular Cloth Purse";
    if (productId === "fabric") return this.titleCase(this.stats.lastTextile || "Finished Fabric");
    if (productId === "discovery") return "Material Discovery Card";
    if (productId === "batch") return "Recipe Scrap Batch";
    if (productId === "kit") return "Cafe Scrap Starter Kit";
    return this.titleCase(productId);
  }

  inferSourceMaterial() {
    const discovered = this.stats.materialsDiscovered[0] || "";
    if (discovered.includes("->")) return discovered.split("->")[0].trim();
    if (this.stats.currentScrap) return this.stats.currentScrap;
    if (this.stats.scrapsCollected.length) return this.uniqueList(this.stats.scrapsCollected).slice(0, 2).join(" + ");
    return "food scraps";
  }

  inferTransformationPath(source, productId) {
    if (this.currentLevel.id === 6) return `${source} -> extract color -> dye fabric -> stitch ${productId}`;
    if (productId === "tote") return `${source} -> choose strong fabric -> cut pattern -> stitch tote`;
    if (productId === "scarf") return `${source} -> dye cloth -> cut strip -> hem scarf`;
    if (productId === "pouch") return `${source} -> coffee pigment -> print fabric -> stitch pouch`;
    if (productId === "purse") return `${source} -> sturdy offcuts -> cut panels -> stitch purse`;
    if (productId === "jacket") return `${source} -> woven textile -> cut panels -> stitch jacket`;
    if (productId === "shirt") return `${source} -> dyed cloth -> cut pattern -> stitch shirt`;
    if (this.stats.textilesCreated.length) return `${source} -> ${this.stats.textilesCreated.slice(-1)[0]}`;
    if (this.stats.materialsDiscovered.length) return this.stats.materialsDiscovered.slice(-1)[0];
    return `${source} -> useful material`;
  }

  inferImpact(productId) {
    const impact = this.stats.communityImpacts.slice(-1)[0];
    if (impact) return impact;
    if (productId === "tote") return "Reusable market bag shared for free";
    if (productId === "apron") return "Useful apron shared through Eco Maker";
    if (productId === "scarf") return "Warm scarf shared with someone who needs it";
    if (productId === "jacket") return "Warm jacket shared through the clothing rack";
    if (productId === "shirt") return "Everyday shirt shared through a welcome closet";
    if (productId === "pouch") return "Lunch pouch shared with a student or food bank visitor";
    if (productId === "purse") return "Small purse shared through a welcome closet";
    if (productId === "fabric") return "Textile material ready for community product design";
    return "Food waste became something useful for the community";
  }

  inferCommunityGroup(productId) {
    const impact = this.stats.communityImpacts.slice(-1)[0] || "";
    if (/senior/.test(impact)) return "Senior";
    if (/shelter/.test(impact)) return "Shelter visitor";
    if (/market|food/.test(impact)) return "Food bank visitor";
    if (/winter|scarf/.test(impact)) return "Newcomer family";
    if (/restaurant|apron/.test(impact)) return "Community cafe worker";
    if (productId === "tote") return "Low-income family";
    if (productId === "scarf" || productId === "blanket" || productId === "jacket") return "Shelter visitor";
    if (productId === "shirt" || productId === "dress" || productId === "shorts" || productId === "waistcoat") return "Newcomer family";
    if (productId === "pouch") return "Student";
    if (productId === "purse") return "Newcomer family";
    if (productId === "apron") return "Community kitchen helper";
    if (productId === "fabric") return "Local sewing group";
    return "Community member";
  }

  communityIcon(group) {
    const s = String(group || "").toLowerCase();
    if (s.includes("shelter")) return "🏠";
    if (s.includes("student")) return "🎒";
    if (s.includes("newcomer")) return "🤝";
    if (s.includes("senior")) return "🧓";
    if (s.includes("food")) return "🥫";
    if (s.includes("family")) return "👪";
    if (s.includes("kitchen") || s.includes("cafe")) return "🍽️";
    return "💛";
  }

  badgesForAchievement(productId) {
    const badges = ["Waste Transformer"];
    if (this.stats.materialsDiscovered.length) badges.push("Fiber Finder");
    if (/tote|apron|pouch|purse|scarf|blanket|jacket|shirt|dress|shorts|uniform|waistcoat/.test(productId)) badges.push("Product Maker");
    if (this.stats.helped > 0) badges.push("Community Helper");
    if (this.stats.qualityScore >= 90) badges.push("Eco Maker's Choice");
    if (this.stats.saved >= 4) badges.push("Zero Waste Hero");
    if (this.currentLevel.id === 6) badges.push("Circular Champion");
    if (String(this.inferSourceMaterial()).match(/orange|lemon|avocado/)) badges.push("Dye Designer");
    return this.uniqueList(badges).slice(0, 4);
  }

  ecoMakerMessage(productId, source) {
    if (productId === "fabric") return `You turned ${source} into fabric for the community!`;
    if (productId === "discovery") return `You found hidden value in ${source}!`;
    if (productId === "batch" || productId === "kit") return "Food waste became something useful for someone else.";
    return `You made a ${this.productDisplayName(productId)} and helped ${this.inferCommunityGroup(productId).toLowerCase()}!`;
  }

  titleCase(value) {
    return String(value || "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase());
  }

  escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  uniqueList(items) {
    return [...new Set((items || []).filter(Boolean))];
  }

  resultIconFor(text) {
    const s = String(text).toLowerCase();
    if (s.includes("orange")) return "🍊";
    if (s.includes("lemon") || s.includes("citrus")) return "🍋";
    if (s.includes("avocado")) return "🥑";
    if (s.includes("banana")) return "🍌";
    if (s.includes("corn")) return "🌽";
    if (s.includes("coffee")) return "☕";
    if (s.includes("tote")) return "👜";
    if (s.includes("scarf")) return "🧣";
    if (s.includes("blanket")) return "🧺";
    if (s.includes("jacket")) return this.assetIcon("eco-lab-kitchen-to-closet/assets/jacket.png", "jacket");
    if (s.includes("shirt")) return this.assetIcon("eco-lab-kitchen-to-closet/assets/shirt.png", "shirt");
    if (s.includes("dress")) return this.assetIcon("eco-lab-kitchen-to-closet/assets/dress.png", "dress");
    if (s.includes("shorts")) return this.assetIcon("eco-lab-kitchen-to-closet/assets/shorts.png", "shorts");
    if (s.includes("apron")) return this.assetIcon("eco-lab-kitchen-to-closet/assets/apron.png", "apron");
    if (s.includes("pouch")) return this.assetIcon("eco-lab-kitchen-to-closet/assets/pouch.png", "pouch");
    if (s.includes("purse")) return this.assetIcon("eco-lab-kitchen-to-closet/assets/purse.png", "purse");
    if (s.includes("uniform")) return this.assetIcon("eco-lab-kitchen-to-closet/assets/uniform.png", "uniform");
    if (s.includes("waistcoat")) return this.assetIcon("eco-lab-kitchen-to-closet/assets/waistcoat.png", "waistcoat");
    if (s.includes("pouch")) return "👝";
    if (s.includes("apron")) return "🥼";
    if (s.includes("donation")) return "💛";
    if (s.includes("compost")) return "🌱";
    if (s.includes("recycle")) return "♻️";
    return "⭐";
  }

  handleTypingKey(e) {
    if (this.isLeaderboardOpen()) return;
    if (this.state !== "playing") return;
    if (this.activePrompt && this.activePrompt.type === "choice") this.choiceTyping.handleKeydown(e);
    else this.typing.handleKeydown(e);
  }

  handleTypingChar(char) {
    if (this.isLeaderboardOpen()) return false;
    if (this.state !== "playing") return false;
    if (this.activePrompt && this.activePrompt.type === "choice") return this.choiceTyping.handleChar(char);
    return this.typing.handleChar(char);
  }

  handleTypingBackspace() {
    if (this.isLeaderboardOpen()) return false;
    if (this.state !== "playing") return false;
    if (this.activePrompt && this.activePrompt.type === "choice") return this.choiceTyping.handleBackspace();
    return this.typing.handleBackspace();
  }

  onSpace() {
    if (this.state === "map" || this.state === "results") return;
    if (this.advanceRioDialogue()) return;
    if (this.activePrompt && this.activePrompt.type === "guide") {
      this.taskIndex += 1;
      this.showTask();
    }
  }

  restartToMenu() {
    this.showLevelMap();
  }

  clearPlayUI(clearStage = true) {
    this.clearStationHighlights();
    this.clearPromptAnchors();
    this.els.wasteDock.classList.add("hidden");
    this.els.screenGame.classList.remove("waste-phase");
    this.els.screenGame.classList.remove("eco-lab-phase");
    this.els.queueList.innerHTML = "";
    if (clearStage && this.miniStage) this.miniStage.innerHTML = "";
    if (this.recipePath) this.recipePath.innerHTML = "";
    if (clearStage) this.hideRioDialogue();
    this.typing.clear();
    this.choiceTyping.clear();
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

  highlightCustomer(table) {
    const el = document.querySelector(`[data-mini-table="${table}"]`);
    if (el) el.style.filter = "drop-shadow(0 0 10px rgba(232,168,56,0.95))";
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
    if (el) {
      el.classList.add("active-target");
      const anchor = document.getElementById(`prompt-${station}`);
      if (anchor && this.activePrompt && this.activePrompt.word) {
        anchor.innerHTML = `<span class="prompt-chip">${this.escapeHTML(this.typedWord(this.activePrompt))}</span>`;
      }
    }
  }

  highlightBins(choices, showPrompt = true) {
    choices.forEach((id) => {
      const bin = document.getElementById(`bin-${id}`);
      const anchor = document.getElementById(`prompt-${id}`);
      if (bin) bin.classList.add("active-target");
      if (anchor && showPrompt) anchor.innerHTML = `<span class="prompt-chip">${id}</span>`;
    });
  }

  setChefPose(station) {
    const chef = this.els.chefAvatar;
    chef.className = "chef-avatar";
    if (!station) return;
    chef.classList.add(`at-${station}`);
    if (station === "chop") chef.classList.add("state-chop");
    if (station === "stove") chef.classList.add("state-cook");
    if (station === "sink") chef.classList.add("state-sink");
  }

  floatScore(anchor, text, good) {
    if (!anchor) return;
    const fx = this.els.fxLayer;
    const r = anchor.getBoundingClientRect();
    const vr = this.els.viewport.getBoundingClientRect();
    const el = document.createElement("div");
    el.className = `float-score ${good ? "" : "float-score-weak"}`;
    el.textContent = text;
    el.style.left = `${r.left - vr.left + r.width / 2}px`;
    el.style.top = `${r.top - vr.top + 10}px`;
    fx.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  flashPhaseBanner(text, subtitle = "") {
    const layer = this.els.fxLayer;
    const ov = document.createElement("div");
    ov.className = "phase-overlay";
    ov.innerHTML = `<div class="banner"><strong>${this.escapeHTML(text)}</strong>${subtitle ? `<span>${this.escapeHTML(subtitle)}</span>` : ""}</div>`;
    layer.appendChild(ov);
    setTimeout(() => {
      ov.style.opacity = "0";
      setTimeout(() => ov.remove(), 350);
    }, 800);
  }
}

window.CycoraGame = CycoraGame;
