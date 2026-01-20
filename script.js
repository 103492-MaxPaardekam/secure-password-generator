// script.js — Keysmith
// Secure Password & Passphrase Generator
// Uses Web Crypto API for all randomness. No Math.random(). No network. No storage.
// Premium micro-interactions and animations included.

(function () {
  "use strict";

  // ========================================================================
  // ANIMATION HELPERS — Motion system utilities
  // ========================================================================

  /**
   * Check if user prefers reduced motion
   * @returns {boolean}
   */
  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /**
   * Play a press animation on an element
   * @param {HTMLElement} el - Element to animate
   */
  function playPress(el) {
    if (prefersReducedMotion()) return;
    el.classList.add("press-active");
    // Remove after animation completes
    setTimeout(() => el.classList.remove("press-active"), 150);
  }

  /**
   * Play a tap animation on an element (for output container)
   * @param {HTMLElement} el - Element to animate
   */
  function playTap(el) {
    if (prefersReducedMotion()) return;
    el.classList.add("tap-active");
    setTimeout(() => el.classList.remove("tap-active"), 120);
  }

  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {string} type - Toast type ('success', 'error', or empty)
   * @param {number} duration - How long to show (ms)
   */
  let toastTimeout = null;
  function showToast(message, type = "", duration = 2000) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    // Clear any existing timeout
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }

    // Remove existing classes
    toast.classList.remove("toast-visible", "toast-success", "toast-error");

    // Set content and type
    toast.textContent = message;
    if (type === "success") {
      toast.classList.add("toast-success");
    }

    // Trigger reflow for animation reset
    void toast.offsetWidth;

    // Show toast
    toast.classList.add("toast-visible");

    // Hide after duration
    toastTimeout = setTimeout(() => {
      toast.classList.remove("toast-visible");
    }, duration);
  }

  /**
   * Shake an element to indicate an error
   * @param {HTMLElement} el - Element to shake
   */
  function shake(el) {
    if (prefersReducedMotion()) return;
    el.classList.remove("shake");
    void el.offsetWidth; // Trigger reflow
    el.classList.add("shake");
    setTimeout(() => el.classList.remove("shake"), 300);
  }

  /**
   * Play a sheen effect across the output container
   * @param {HTMLElement} container - Output container element
   */
  function playSheen(container) {
    if (prefersReducedMotion()) return;
    container.classList.remove("sheen-active");
    void container.offsetWidth;
    container.classList.add("sheen-active");
    setTimeout(() => container.classList.remove("sheen-active"), 400);
  }

  /**
   * Animate output text change with crossfade
   * @param {HTMLElement} outputEl - The output element
   * @param {string} newValue - New text value
   * @param {Function} callback - Called after animation with new value applied
   */
  function animateOutputChange(outputEl, newValue, callback) {
    if (prefersReducedMotion()) {
      outputEl.textContent = newValue;
      if (callback) callback();
      return;
    }

    // Crossfade out
    outputEl.classList.add("crossfade-out");

    setTimeout(() => {
      outputEl.textContent = newValue;
      outputEl.classList.remove("crossfade-out");
      if (callback) callback();
    }, 180);
  }

  /**
   * Play regenerate animation on button
   * @param {HTMLElement} btn - Regenerate button
   */
  function playRegenerateAnimation(btn) {
    if (prefersReducedMotion()) return;
    btn.classList.add("regenerating");
    setTimeout(() => btn.classList.remove("regenerating"), 400);
  }

  /**
   * Animate panel transition (mode switch)
   * @param {HTMLElement} hidePanel - Panel to hide
   * @param {HTMLElement} showPanel - Panel to show
   */
  function animatePanelSwitch(hidePanel, showPanel) {
    if (prefersReducedMotion()) {
      hidePanel.hidden = true;
      hidePanel.setAttribute("aria-hidden", "true");
      showPanel.hidden = false;
      showPanel.removeAttribute("aria-hidden");
      return;
    }

    // Hide current panel
    hidePanel.hidden = true;
    hidePanel.setAttribute("aria-hidden", "true");

    // Show new panel with animation
    showPanel.hidden = false;
    showPanel.removeAttribute("aria-hidden");
    showPanel.classList.add("panel-enter");

    // Trigger reflow
    void showPanel.offsetWidth;

    // Animate in
    showPanel.classList.add("panel-enter-active");
    showPanel.classList.remove("panel-enter");

    setTimeout(() => {
      showPanel.classList.remove("panel-enter-active");
    }, 280);
  }

  /**
   * Animate strength label change with brief crossfade
   * @param {HTMLElement} labelEl - Strength label element
   * @param {string} newLabel - New label text
   * @param {string} newClass - New class name
   */
  function animateStrengthLabel(labelEl, newLabel, newClass) {
    const oldLabel = labelEl.textContent;
    const oldClass = labelEl.className;

    if (oldLabel === newLabel && oldClass.includes(newClass)) return;

    if (prefersReducedMotion()) {
      labelEl.textContent = newLabel;
      labelEl.className = "strength-label " + newClass;
      return;
    }

    labelEl.classList.add("label-updating");

    setTimeout(() => {
      labelEl.textContent = newLabel;
      labelEl.className = "strength-label " + newClass;
    }, 100);
  }

  /**
   * Add value change pulse to input
   * @param {HTMLInputElement} input - Input element
   */
  function pulseInput(input) {
    if (prefersReducedMotion()) return;
    input.classList.remove("value-changed");
    void input.offsetWidth;
    input.classList.add("value-changed");
    setTimeout(() => input.classList.remove("value-changed"), 180);
  }

  // ========================================================================
  // WORD LIST FOR PASSPHRASES
  // A curated list of ~1,500 common, unaccented English words
  // Designed to be memorable and easy to type
  // This can be replaced with a larger list (e.g., EFF word list) for more entropy
  // ========================================================================
  const WORD_LIST = [
    "able",
    "about",
    "above",
    "accept",
    "account",
    "across",
    "act",
    "action",
    "active",
    "actual",
    "add",
    "address",
    "admit",
    "adult",
    "advance",
    "advice",
    "affair",
    "affect",
    "afford",
    "after",
    "again",
    "against",
    "age",
    "agent",
    "ago",
    "agree",
    "ahead",
    "air",
    "album",
    "alert",
    "alive",
    "allow",
    "almost",
    "alone",
    "along",
    "already",
    "also",
    "always",
    "among",
    "amount",
    "ancient",
    "and",
    "anger",
    "angle",
    "animal",
    "annual",
    "answer",
    "anyone",
    "anyway",
    "apart",
    "appeal",
    "appear",
    "apple",
    "apply",
    "April",
    "area",
    "argue",
    "arm",
    "army",
    "around",
    "arrive",
    "art",
    "article",
    "artist",
    "aside",
    "ask",
    "aspect",
    "assume",
    "attack",
    "attend",
    "August",
    "author",
    "autumn",
    "avoid",
    "award",
    "aware",
    "away",
    "baby",
    "back",
    "bad",
    "bag",
    "balance",
    "ball",
    "band",
    "bank",
    "bar",
    "base",
    "basic",
    "basket",
    "battle",
    "beach",
    "bear",
    "beat",
    "beauty",
    "become",
    "bed",
    "before",
    "begin",
    "behind",
    "belief",
    "belong",
    "below",
    "bench",
    "benefit",
    "best",
    "better",
    "between",
    "beyond",
    "big",
    "bird",
    "birth",
    "bit",
    "black",
    "blank",
    "blend",
    "block",
    "blood",
    "blow",
    "blue",
    "board",
    "boat",
    "body",
    "bone",
    "book",
    "border",
    "born",
    "both",
    "bottle",
    "bottom",
    "box",
    "boy",
    "brain",
    "branch",
    "brand",
    "brave",
    "bread",
    "break",
    "breath",
    "brick",
    "bridge",
    "brief",
    "bright",
    "bring",
    "broad",
    "broken",
    "brother",
    "brown",
    "brush",
    "budget",
    "build",
    "bunch",
    "burn",
    "bus",
    "busy",
    "butter",
    "button",
    "buy",
    "cabin",
    "cable",
    "cake",
    "call",
    "calm",
    "camera",
    "camp",
    "campus",
    "cancel",
    "candle",
    "candy",
    "canvas",
    "cap",
    "capable",
    "capital",
    "captain",
    "capture",
    "car",
    "carbon",
    "card",
    "care",
    "career",
    "careful",
    "carpet",
    "carry",
    "case",
    "cash",
    "cast",
    "castle",
    "casual",
    "cat",
    "catch",
    "cause",
    "ceiling",
    "center",
    "central",
    "century",
    "certain",
    "chain",
    "chair",
    "chamber",
    "chance",
    "change",
    "channel",
    "chapter",
    "charge",
    "charity",
    "charm",
    "chart",
    "chase",
    "cheap",
    "check",
    "cheese",
    "cherry",
    "chest",
    "chicken",
    "chief",
    "child",
    "chip",
    "choice",
    "choose",
    "church",
    "circle",
    "citizen",
    "city",
    "civil",
    "claim",
    "class",
    "classic",
    "clean",
    "clear",
    "clever",
    "click",
    "client",
    "climate",
    "climb",
    "clinic",
    "clock",
    "close",
    "closet",
    "cloth",
    "cloud",
    "club",
    "clue",
    "coach",
    "coal",
    "coast",
    "coat",
    "code",
    "coffee",
    "coin",
    "cold",
    "collect",
    "college",
    "color",
    "column",
    "combine",
    "come",
    "comfort",
    "command",
    "comment",
    "commit",
    "common",
    "company",
    "compare",
    "compete",
    "complex",
    "concept",
    "concern",
    "conduct",
    "confirm",
    "connect",
    "consist",
    "contact",
    "contain",
    "content",
    "context",
    "continue",
    "contract",
    "control",
    "convert",
    "cook",
    "cookie",
    "cool",
    "copper",
    "copy",
    "coral",
    "core",
    "corn",
    "corner",
    "correct",
    "cost",
    "cotton",
    "couch",
    "could",
    "council",
    "count",
    "counter",
    "country",
    "county",
    "couple",
    "courage",
    "course",
    "court",
    "cousin",
    "cover",
    "craft",
    "crash",
    "crazy",
    "cream",
    "create",
    "credit",
    "crew",
    "crisis",
    "cross",
    "crowd",
    "crown",
    "crucial",
    "crush",
    "crystal",
    "culture",
    "cup",
    "curious",
    "current",
    "curtain",
    "curve",
    "custom",
    "cut",
    "cycle",
    "dad",
    "daily",
    "damage",
    "dance",
    "danger",
    "dare",
    "dark",
    "data",
    "date",
    "daughter",
    "dawn",
    "day",
    "dead",
    "deal",
    "dear",
    "death",
    "debate",
    "decade",
    "decide",
    "deck",
    "decline",
    "deep",
    "deer",
    "defeat",
    "defend",
    "define",
    "degree",
    "delay",
    "deliver",
    "demand",
    "deny",
    "depart",
    "depend",
    "depth",
    "deputy",
    "derive",
    "describe",
    "desert",
    "design",
    "desire",
    "desk",
    "detail",
    "detect",
    "develop",
    "device",
    "devote",
    "diamond",
    "differ",
    "digital",
    "dinner",
    "direct",
    "dirt",
    "discuss",
    "dish",
    "dismiss",
    "display",
    "distant",
    "divide",
    "doctor",
    "document",
    "dog",
    "dollar",
    "domain",
    "domestic",
    "door",
    "double",
    "doubt",
    "down",
    "dozen",
    "draft",
    "drag",
    "drama",
    "draw",
    "dream",
    "dress",
    "drink",
    "drive",
    "drop",
    "drug",
    "drum",
    "dry",
    "duck",
    "due",
    "during",
    "dust",
    "duty",
    "each",
    "eager",
    "ear",
    "early",
    "earn",
    "earth",
    "ease",
    "east",
    "easy",
    "eat",
    "echo",
    "edge",
    "edit",
    "editor",
    "educate",
    "effect",
    "effort",
    "egg",
    "eight",
    "either",
    "elbow",
    "elder",
    "elect",
    "element",
    "elevator",
    "else",
    "embrace",
    "emerge",
    "emotion",
    "employ",
    "empty",
    "enable",
    "end",
    "enemy",
    "energy",
    "engage",
    "engine",
    "enjoy",
    "enough",
    "ensure",
    "enter",
    "entire",
    "entry",
    "equal",
    "equip",
    "era",
    "error",
    "escape",
    "essay",
    "essence",
    "estate",
    "estimate",
    "ethics",
    "Europe",
    "evaluate",
    "even",
    "evening",
    "event",
    "ever",
    "every",
    "evidence",
    "evil",
    "exact",
    "example",
    "exceed",
    "exchange",
    "excite",
    "excuse",
    "execute",
    "exercise",
    "exist",
    "exit",
    "expand",
    "expect",
    "expense",
    "expert",
    "explain",
    "explore",
    "export",
    "expose",
    "express",
    "extend",
    "extra",
    "eye",
    "fabric",
    "face",
    "fact",
    "factor",
    "factory",
    "fail",
    "fair",
    "faith",
    "fall",
    "false",
    "fame",
    "family",
    "famous",
    "fan",
    "fancy",
    "fantasy",
    "far",
    "farm",
    "farmer",
    "fashion",
    "fast",
    "fat",
    "fate",
    "father",
    "fault",
    "favor",
    "fear",
    "feature",
    "federal",
    "fee",
    "feed",
    "feel",
    "fellow",
    "female",
    "fence",
    "festival",
    "fever",
    "few",
    "fiber",
    "fiction",
    "field",
    "fifteen",
    "fifth",
    "fifty",
    "fight",
    "figure",
    "file",
    "fill",
    "film",
    "final",
    "find",
    "fine",
    "finger",
    "finish",
    "fire",
    "firm",
    "first",
    "fish",
    "fit",
    "fitness",
    "five",
    "fix",
    "flag",
    "flame",
    "flash",
    "flat",
    "flavor",
    "flee",
    "flesh",
    "flight",
    "flip",
    "float",
    "flood",
    "floor",
    "flow",
    "flower",
    "fluid",
    "fly",
    "focus",
    "fold",
    "folk",
    "follow",
    "food",
    "foot",
    "football",
    "force",
    "foreign",
    "forest",
    "forever",
    "forget",
    "forgive",
    "fork",
    "form",
    "formal",
    "format",
    "former",
    "formula",
    "fortune",
    "forward",
    "found",
    "founder",
    "four",
    "fourth",
    "frame",
    "free",
    "freedom",
    "freeze",
    "French",
    "frequent",
    "fresh",
    "friend",
    "fridge",
    "front",
    "frozen",
    "fruit",
    "fuel",
    "full",
    "fun",
    "function",
    "fund",
    "funny",
    "future",
    "gain",
    "galaxy",
    "gallery",
    "game",
    "gap",
    "garage",
    "garden",
    "garlic",
    "gas",
    "gate",
    "gather",
    "gear",
    "gender",
    "general",
    "generate",
    "genius",
    "gentle",
    "genuine",
    "gesture",
    "get",
    "ghost",
    "giant",
    "gift",
    "girl",
    "give",
    "glad",
    "glance",
    "glass",
    "global",
    "glory",
    "glove",
    "glow",
    "goal",
    "gold",
    "golden",
    "golf",
    "good",
    "govern",
    "grab",
    "grace",
    "grade",
    "grain",
    "grand",
    "grant",
    "grape",
    "graph",
    "grasp",
    "grass",
    "grateful",
    "grave",
    "gray",
    "great",
    "green",
    "greet",
    "grid",
    "grief",
    "grill",
    "grin",
    "grind",
    "grip",
    "grocery",
    "ground",
    "group",
    "grow",
    "growth",
    "guard",
    "guess",
    "guest",
    "guide",
    "guilt",
    "guitar",
    "gun",
    "habit",
    "hair",
    "half",
    "hall",
    "hammer",
    "hand",
    "handle",
    "hang",
    "happen",
    "happy",
    "harbor",
    "hard",
    "hardly",
    "harm",
    "harvest",
    "hat",
    "hate",
    "have",
    "head",
    "health",
    "hear",
    "heart",
    "heat",
    "heaven",
    "heavy",
    "height",
    "hello",
    "help",
    "hence",
    "her",
    "here",
    "hero",
    "herself",
    "hesitate",
    "hide",
    "high",
    "highlight",
    "highway",
    "hill",
    "himself",
    "hint",
    "hip",
    "hire",
    "history",
    "hit",
    "hobby",
    "hockey",
    "hold",
    "hole",
    "holiday",
    "hollow",
    "holy",
    "home",
    "homework",
    "honest",
    "honey",
    "honor",
    "hook",
    "hope",
    "horizon",
    "horror",
    "horse",
    "hospital",
    "host",
    "hot",
    "hotel",
    "hour",
    "house",
    "housing",
    "how",
    "however",
    "huge",
    "human",
    "humor",
    "hundred",
    "hungry",
    "hunt",
    "hurry",
    "hurt",
    "husband",
    "ice",
    "icon",
    "idea",
    "ideal",
    "identify",
    "identity",
    "ignore",
    "ill",
    "illegal",
    "image",
    "imagine",
    "impact",
    "imply",
    "import",
    "impose",
    "improve",
    "inch",
    "incident",
    "include",
    "income",
    "increase",
    "indeed",
    "index",
    "indicate",
    "indoor",
    "industry",
    "infant",
    "influence",
    "inform",
    "initial",
    "injury",
    "inner",
    "innocent",
    "input",
    "inquiry",
    "insect",
    "inside",
    "insight",
    "insist",
    "inspire",
    "install",
    "instance",
    "instant",
    "instead",
    "institute",
    "instrument",
    "insurance",
    "intend",
    "intense",
    "interest",
    "internal",
    "interpret",
    "interval",
    "interview",
    "into",
    "introduce",
    "invest",
    "invite",
    "involve",
    "iron",
    "island",
    "issue",
    "item",
    "itself",
    "jacket",
    "jail",
    "January",
    "jazz",
    "jeans",
    "jelly",
    "jet",
    "jewel",
    "job",
    "join",
    "joint",
    "joke",
    "journal",
    "journey",
    "joy",
    "judge",
    "juice",
    "July",
    "jump",
    "June",
    "jungle",
    "junior",
    "jury",
    "just",
    "justice",
    "keen",
    "keep",
    "kettle",
    "key",
    "kick",
    "kid",
    "kill",
    "kind",
    "king",
    "kiss",
    "kit",
    "kitchen",
    "knee",
    "knife",
    "knock",
    "know",
    "knowledge",
    "lab",
    "label",
    "labor",
    "lack",
    "ladder",
    "lady",
    "lake",
    "lamp",
    "land",
    "landscape",
    "lane",
    "language",
    "laptop",
    "large",
    "last",
    "late",
    "later",
    "latter",
    "laugh",
    "launch",
    "law",
    "lawyer",
    "lay",
    "layer",
    "lazy",
    "lead",
    "leader",
    "leaf",
    "league",
    "lean",
    "learn",
    "least",
    "leather",
    "leave",
    "lecture",
    "left",
    "leg",
    "legal",
    "legend",
    "lemon",
    "lend",
    "length",
    "lens",
    "less",
    "lesson",
    "let",
    "letter",
    "level",
    "liberty",
    "library",
    "license",
    "lid",
    "lie",
    "life",
    "lift",
    "light",
    "like",
    "likely",
    "limit",
    "line",
    "link",
    "lion",
    "lip",
    "liquid",
    "list",
    "listen",
    "literary",
    "little",
    "live",
    "living",
    "load",
    "loan",
    "local",
    "locate",
    "lock",
    "logic",
    "lonely",
    "long",
    "look",
    "loop",
    "loose",
    "lord",
    "lose",
    "loss",
    "lost",
    "lot",
    "loud",
    "lounge",
    "love",
    "lovely",
    "lover",
    "low",
    "lower",
    "loyal",
    "luck",
    "lucky",
    "lunch",
    "lung",
    "luxury",
    "machine",
    "mad",
    "magazine",
    "magic",
    "mail",
    "main",
    "maintain",
    "major",
    "make",
    "male",
    "mall",
    "man",
    "manage",
    "manager",
    "manner",
    "mansion",
    "manual",
    "many",
    "map",
    "maple",
    "marble",
    "march",
    "margin",
    "mark",
    "market",
    "marriage",
    "marry",
    "mask",
    "mass",
    "master",
    "match",
    "mate",
    "material",
    "math",
    "matter",
    "maximum",
    "may",
    "maybe",
    "mayor",
    "meal",
    "mean",
    "meaning",
    "measure",
    "meat",
    "media",
    "medical",
    "medicine",
    "medium",
    "meet",
    "meeting",
    "member",
    "memory",
    "mental",
    "mention",
    "menu",
    "mercy",
    "mere",
    "merge",
    "merit",
    "mess",
    "message",
    "metal",
    "meter",
    "method",
    "middle",
    "might",
    "mild",
    "mile",
    "milk",
    "mill",
    "mind",
    "mine",
    "minimum",
    "minor",
    "minute",
    "miracle",
    "mirror",
    "miss",
    "mission",
    "mistake",
    "mix",
    "mixture",
    "mobile",
    "mode",
    "model",
    "modern",
    "modest",
    "modify",
    "moment",
    "money",
    "monitor",
    "monkey",
    "month",
    "mood",
    "moon",
    "moral",
    "more",
    "morning",
    "most",
    "mother",
    "motion",
    "motor",
    "mount",
    "mountain",
    "mouse",
    "mouth",
    "move",
    "movie",
    "much",
    "mud",
    "multiple",
    "muscle",
    "museum",
    "music",
    "must",
    "mutual",
    "myself",
    "mystery",
    "myth",
    "nail",
    "name",
    "narrow",
    "nation",
    "native",
    "natural",
    "nature",
    "near",
    "nearby",
    "nearly",
    "neat",
    "neck",
    "need",
    "negative",
    "neighbor",
    "neither",
    "nerve",
    "nest",
    "net",
    "network",
    "neutral",
    "never",
    "new",
    "news",
    "next",
    "nice",
    "night",
    "nine",
    "nobody",
    "nod",
    "noise",
    "none",
    "nor",
    "normal",
    "north",
    "nose",
    "not",
    "note",
    "nothing",
    "notice",
    "notion",
    "novel",
    "November",
    "now",
    "nowhere",
    "nuclear",
    "number",
    "nurse",
    "nut",
    "object",
    "observe",
    "obtain",
    "obvious",
    "occasion",
    "occupy",
    "occur",
    "ocean",
    "October",
    "odd",
    "odds",
    "off",
    "offense",
    "offer",
    "office",
    "officer",
    "official",
    "often",
    "oil",
    "okay",
    "old",
    "olive",
    "once",
    "one",
    "online",
    "only",
    "onto",
    "open",
    "opera",
    "operate",
    "opinion",
    "opponent",
    "oppose",
    "opposite",
    "option",
    "orange",
    "orbit",
    "order",
    "ordinary",
    "organ",
    "origin",
    "original",
    "other",
    "otherwise",
    "ought",
    "our",
    "outcome",
    "outdoor",
    "outer",
    "outline",
    "output",
    "outside",
    "oven",
    "over",
    "overall",
    "overcome",
    "own",
    "owner",
    "oxygen",
    "pace",
    "pack",
    "package",
    "page",
    "pain",
    "paint",
    "pair",
    "palace",
    "pale",
    "palm",
    "pan",
    "panel",
    "panic",
    "paper",
    "parade",
    "parent",
    "park",
    "parking",
    "part",
    "partial",
    "partner",
    "party",
    "pass",
    "passage",
    "passion",
    "past",
    "patch",
    "path",
    "patience",
    "patient",
    "pattern",
    "pause",
    "pay",
    "payment",
    "peace",
    "peak",
    "peanut",
    "pear",
    "pen",
    "penalty",
    "pencil",
    "penny",
    "people",
    "pepper",
    "per",
    "percent",
    "perfect",
    "perform",
    "perhaps",
    "period",
    "permit",
    "person",
    "personal",
    "pet",
    "phase",
    "phone",
    "photo",
    "phrase",
    "physical",
    "piano",
    "pick",
    "picture",
    "pie",
    "piece",
    "pig",
    "pile",
    "pilot",
    "pin",
    "pink",
    "pioneer",
    "pipe",
    "pitch",
    "pizza",
    "place",
    "plain",
    "plan",
    "plane",
    "planet",
    "plant",
    "plastic",
    "plate",
    "platform",
    "play",
    "player",
    "please",
    "pleasure",
    "plenty",
    "plot",
    "plug",
    "plus",
    "pocket",
    "poem",
    "poet",
    "poetry",
    "point",
    "polar",
    "pole",
    "police",
    "policy",
    "polish",
    "polite",
    "politics",
    "poll",
    "pond",
    "pool",
    "poor",
    "pop",
    "popular",
    "porch",
    "port",
    "portion",
    "pose",
    "position",
    "positive",
    "possess",
    "possible",
    "post",
    "pot",
    "potato",
    "potential",
    "pound",
    "pour",
    "poverty",
    "powder",
    "power",
    "practice",
    "praise",
    "pray",
    "predict",
    "prefer",
    "premium",
    "prepare",
    "presence",
    "present",
    "preserve",
    "president",
    "press",
    "pressure",
    "pretend",
    "pretty",
    "prevent",
    "price",
    "pride",
    "primary",
    "prime",
    "prince",
    "princess",
    "principle",
    "print",
    "prior",
    "prison",
    "private",
    "prize",
    "probably",
    "problem",
    "proceed",
    "process",
    "produce",
    "product",
    "profile",
    "profit",
    "program",
    "progress",
    "project",
    "promise",
    "promote",
    "proof",
    "proper",
    "property",
    "proposal",
    "propose",
    "protect",
    "protein",
    "protest",
    "proud",
    "prove",
    "provide",
    "public",
    "pull",
    "pulse",
    "pump",
    "punch",
    "puppy",
    "purchase",
    "pure",
    "purple",
    "purpose",
    "purse",
    "pursue",
    "push",
    "put",
    "puzzle",
    "qualify",
    "quality",
    "quarter",
    "queen",
    "question",
    "quick",
    "quiet",
    "quit",
    "quite",
    "quote",
    "race",
    "radar",
    "radio",
    "rail",
    "rain",
    "raise",
    "range",
    "rank",
    "rapid",
    "rare",
    "rate",
    "rather",
    "raw",
    "reach",
    "react",
    "read",
    "reader",
    "ready",
    "real",
    "reality",
    "realize",
    "really",
    "reason",
    "rebel",
    "recall",
    "receive",
    "recent",
    "recipe",
    "record",
    "recover",
    "red",
    "reduce",
    "refer",
    "reflect",
    "reform",
    "refuse",
    "regard",
    "regime",
    "region",
    "regret",
    "regular",
    "reject",
    "relate",
    "relation",
    "relative",
    "relax",
    "release",
    "relief",
    "rely",
    "remain",
    "remark",
    "remember",
    "remind",
    "remote",
    "remove",
    "rent",
    "repair",
    "repeat",
    "replace",
    "reply",
    "report",
    "represent",
    "republic",
    "request",
    "require",
    "rescue",
    "research",
    "reserve",
    "resident",
    "resist",
    "resolve",
    "resort",
    "resource",
    "respect",
    "respond",
    "response",
    "rest",
    "restore",
    "restrict",
    "result",
    "retain",
    "retire",
    "return",
    "reveal",
    "revenue",
    "reverse",
    "review",
    "revolution",
    "reward",
    "rhythm",
    "rice",
    "rich",
    "rid",
    "ride",
    "ridge",
    "rifle",
    "right",
    "ring",
    "riot",
    "rise",
    "risk",
    "ritual",
    "rival",
    "river",
    "road",
    "robot",
    "rock",
    "rocket",
    "role",
    "roll",
    "romance",
    "romantic",
    "roof",
    "room",
    "root",
    "rope",
    "rose",
    "rotate",
    "rough",
    "round",
    "route",
    "routine",
    "row",
    "royal",
    "rub",
    "rubber",
    "rude",
    "rug",
    "ruin",
    "rule",
    "run",
    "runner",
    "rural",
    "rush",
    "sacred",
    "sad",
    "safe",
    "safety",
    "sail",
    "saint",
    "salad",
    "salary",
    "sale",
    "salmon",
    "salt",
    "same",
    "sample",
    "sand",
    "sandwich",
    "satisfy",
    "sauce",
    "save",
    "say",
    "scale",
    "scan",
    "scene",
    "schedule",
    "scheme",
    "scholar",
    "school",
    "science",
    "scope",
    "score",
    "screen",
    "script",
    "sea",
    "search",
    "season",
    "seat",
    "second",
    "secret",
    "section",
    "sector",
    "secure",
    "security",
    "see",
    "seed",
    "seek",
    "seem",
    "segment",
    "select",
    "self",
    "sell",
    "senate",
    "send",
    "senior",
    "sense",
    "sentence",
    "separate",
    "sequence",
    "series",
    "serious",
    "servant",
    "serve",
    "service",
    "session",
    "set",
    "setting",
    "settle",
    "setup",
    "seven",
    "severe",
    "shade",
    "shadow",
    "shake",
    "shall",
    "shame",
    "shape",
    "share",
    "sharp",
    "shed",
    "sheep",
    "sheer",
    "sheet",
    "shelf",
    "shell",
    "shelter",
    "shift",
    "shine",
    "ship",
    "shirt",
    "shock",
    "shoe",
    "shoot",
    "shop",
    "shopping",
    "shore",
    "short",
    "shortly",
    "shot",
    "shoulder",
    "shout",
    "show",
    "shower",
    "shrimp",
    "shut",
    "sick",
    "side",
    "sight",
    "sign",
    "signal",
    "silence",
    "silent",
    "silk",
    "silver",
    "similar",
    "simple",
    "simply",
    "since",
    "sing",
    "singer",
    "single",
    "sink",
    "sir",
    "sister",
    "sit",
    "site",
    "situation",
    "six",
    "size",
    "sketch",
    "ski",
    "skill",
    "skin",
    "skip",
    "skirt",
    "sky",
    "slave",
    "sleep",
    "slice",
    "slide",
    "slight",
    "slim",
    "slip",
    "slow",
    "small",
    "smart",
    "smell",
    "smile",
    "smoke",
    "smooth",
    "snap",
    "snow",
    "soccer",
    "social",
    "society",
    "sock",
    "soft",
    "software",
    "soil",
    "solar",
    "soldier",
    "solid",
    "solution",
    "solve",
    "some",
    "somebody",
    "somehow",
    "someone",
    "something",
    "sometimes",
    "somewhat",
    "somewhere",
    "son",
    "song",
    "soon",
    "sorry",
    "sort",
    "soul",
    "sound",
    "soup",
    "source",
    "south",
    "southern",
    "space",
    "spare",
    "speak",
    "speaker",
    "special",
    "species",
    "specific",
    "speech",
    "speed",
    "spell",
    "spend",
    "sphere",
    "spider",
    "spin",
    "spirit",
    "spiritual",
    "split",
    "sponsor",
    "spoon",
    "sport",
    "spot",
    "spread",
    "spring",
    "spy",
    "square",
    "squeeze",
    "stable",
    "staff",
    "stage",
    "stair",
    "stake",
    "stamp",
    "stand",
    "standard",
    "star",
    "stare",
    "start",
    "state",
    "station",
    "status",
    "stay",
    "steady",
    "steak",
    "steal",
    "steam",
    "steel",
    "steep",
    "stem",
    "step",
    "stick",
    "still",
    "stir",
    "stock",
    "stomach",
    "stone",
    "stop",
    "storage",
    "store",
    "storm",
    "story",
    "straight",
    "strange",
    "stranger",
    "strategy",
    "stream",
    "street",
    "strength",
    "stress",
    "stretch",
    "strict",
    "strike",
    "string",
    "strip",
    "stroke",
    "strong",
    "structure",
    "struggle",
    "student",
    "studio",
    "study",
    "stuff",
    "stupid",
    "style",
    "subject",
    "submit",
    "substance",
    "succeed",
    "success",
    "such",
    "sudden",
    "suffer",
    "sugar",
    "suggest",
    "suit",
    "sum",
    "summer",
    "summit",
    "sun",
    "Sunday",
    "super",
    "supply",
    "support",
    "suppose",
    "sure",
    "surface",
    "surgery",
    "surprise",
    "surround",
    "survey",
    "survive",
    "suspect",
    "suspend",
    "sweet",
    "swim",
    "swing",
    "switch",
    "symbol",
    "symptom",
    "system",
    "table",
    "tablet",
    "tackle",
    "tail",
    "take",
    "tale",
    "talent",
    "talk",
    "tall",
    "tank",
    "tap",
    "tape",
    "target",
    "task",
    "taste",
    "tax",
    "tea",
    "teach",
    "teacher",
    "team",
    "tear",
    "tech",
    "technique",
    "teen",
    "teeth",
    "telephone",
    "tell",
    "temple",
    "ten",
    "tend",
    "tennis",
    "tension",
    "tent",
    "term",
    "terms",
    "test",
    "text",
    "thank",
    "that",
    "theater",
    "their",
    "them",
    "theme",
    "themselves",
    "then",
    "theory",
    "therapy",
    "there",
    "thereby",
    "these",
    "they",
    "thick",
    "thin",
    "thing",
    "think",
    "third",
    "thirty",
    "this",
    "though",
    "thought",
    "thousand",
    "thread",
    "threat",
    "three",
    "throat",
    "through",
    "throw",
    "thumb",
    "thunder",
    "thus",
    "ticket",
    "tide",
    "tie",
    "tiger",
    "tight",
    "timber",
    "time",
    "timeline",
    "tiny",
    "tip",
    "tire",
    "tired",
    "tissue",
    "title",
    "toast",
    "today",
    "toe",
    "together",
    "toilet",
    "tomato",
    "tomorrow",
    "tone",
    "tongue",
    "tonight",
    "too",
    "tool",
    "tooth",
    "top",
    "topic",
    "total",
    "totally",
    "touch",
    "tough",
    "tour",
    "tourist",
    "toward",
    "tower",
    "town",
    "toy",
    "trace",
    "track",
    "trade",
    "tradition",
    "traffic",
    "trail",
    "train",
    "transfer",
    "transform",
    "transit",
    "translate",
    "travel",
    "treasure",
    "treat",
    "treatment",
    "treaty",
    "tree",
    "trend",
    "trial",
    "tribe",
    "trick",
    "trigger",
    "trim",
    "trip",
    "trouble",
    "truck",
    "true",
    "truly",
    "trust",
    "truth",
    "try",
    "tube",
    "tunnel",
    "turkey",
    "turn",
    "turtle",
    "twelve",
    "twenty",
    "twice",
    "twin",
    "twist",
    "two",
    "type",
    "typical",
    "ugly",
    "ultimate",
    "umbrella",
    "unable",
    "uncle",
    "under",
    "undergo",
    "understand",
    "unexpected",
    "unfair",
    "unhappy",
    "uniform",
    "union",
    "unique",
    "unit",
    "unity",
    "universe",
    "unknown",
    "unless",
    "unlike",
    "until",
    "unusual",
    "update",
    "upon",
    "upper",
    "upset",
    "urban",
    "urge",
    "use",
    "used",
    "useful",
    "user",
    "usual",
    "usually",
    "utility",
    "vacation",
    "valid",
    "valley",
    "valuable",
    "value",
    "van",
    "variety",
    "various",
    "vary",
    "vast",
    "vegetable",
    "vehicle",
    "venture",
    "version",
    "very",
    "vessel",
    "veteran",
    "via",
    "video",
    "view",
    "viewer",
    "village",
    "violate",
    "violence",
    "violet",
    "virtue",
    "virus",
    "visible",
    "vision",
    "visit",
    "visitor",
    "visual",
    "vital",
    "voice",
    "volume",
    "volunteer",
    "vote",
    "voter",
    "wage",
    "wait",
    "wake",
    "walk",
    "wall",
    "wander",
    "want",
    "war",
    "warm",
    "warn",
    "warning",
    "wash",
    "waste",
    "watch",
    "water",
    "wave",
    "way",
    "weak",
    "wealth",
    "weapon",
    "wear",
    "weather",
    "web",
    "website",
    "wedding",
    "week",
    "weekend",
    "weekly",
    "weigh",
    "weight",
    "weird",
    "welcome",
    "welfare",
    "well",
    "west",
    "western",
    "wet",
    "what",
    "whatever",
    "wheat",
    "wheel",
    "when",
    "whenever",
    "where",
    "whereas",
    "wherever",
    "whether",
    "which",
    "while",
    "whisper",
    "white",
    "who",
    "whoever",
    "whole",
    "whom",
    "whose",
    "why",
    "wide",
    "widely",
    "wife",
    "wild",
    "will",
    "willing",
    "win",
    "wind",
    "window",
    "wine",
    "wing",
    "winner",
    "winter",
    "wire",
    "wisdom",
    "wise",
    "wish",
    "with",
    "withdraw",
    "within",
    "without",
    "witness",
    "wolf",
    "woman",
    "wonder",
    "wonderful",
    "wood",
    "wooden",
    "wool",
    "word",
    "work",
    "worker",
    "workshop",
    "world",
    "worry",
    "worse",
    "worst",
    "worth",
    "worthy",
    "would",
    "wound",
    "wrap",
    "wrist",
    "write",
    "writer",
    "writing",
    "wrong",
    "yard",
    "year",
    "yellow",
    "yes",
    "yesterday",
    "yet",
    "yield",
    "you",
    "young",
    "your",
    "yourself",
    "youth",
    "zero",
    "zone",
    "zoom",
  ];

  // ========================================================================
  // CHARACTER SETS
  // ========================================================================
  const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
  const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const DIGITS = "0123456789";
  const DEFAULT_SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?";

  // Ambiguous characters to remove when "Avoid ambiguous characters" is enabled
  // Includes: O (uppercase O), 0 (zero), I (uppercase I), l (lowercase L), 1 (one), | (pipe)
  // Also: S and 5, B and 8, Z and 2 for extra clarity
  const AMBIGUOUS_CHARS = "O0Il1|S5B8Z2";

  // ========================================================================
  // STRENGTH THRESHOLDS (in bits of entropy)
  // <50 bits: Weak — easily cracked with modern hardware
  // 50–80 bits: Okay — fine for low-value accounts
  // 80–110 bits: Strong — good for most uses
  // >110 bits: Very Strong — excellent for high-value accounts
  // ========================================================================
  const STRENGTH_THRESHOLDS = {
    WEAK: 50,
    OKAY: 80,
    STRONG: 110,
  };

  // ========================================================================
  // DOM ELEMENTS
  // ========================================================================
  let elements = {};

  // Track previous strength for animation
  let previousStrength = null;

  // ========================================================================
  // APPLICATION STATE
  // ========================================================================
  let state = {
    mode: "password", // 'password' or 'passphrase'
    password: {
      length: 16,
      lowercase: true,
      uppercase: true,
      digits: true,
      symbols: false,
      symbolSet: DEFAULT_SYMBOLS,
      avoidAmbiguous: true,
    },
    passphrase: {
      wordCount: 4,
      separator: "-",
      customSeparator: "",
      capitalization: "lowercase",
      addNumber: false,
      addSymbol: false,
      symbolSet: "!@#$%^&*",
    },
    currentOutput: "",
    error: null,
  };

  // ========================================================================
  // CRYPTOGRAPHIC RANDOM NUMBER GENERATION
  // ========================================================================

  /**
   * Returns a cryptographically secure random integer in [0, maxExclusive).
   * Uses rejection sampling to avoid modulo bias.
   *
   * @param {number} maxExclusive - The exclusive upper bound (must be > 0)
   * @returns {number} A uniform random integer in [0, maxExclusive)
   */
  function getSecureRandomInt(maxExclusive) {
    if (maxExclusive <= 0 || !Number.isInteger(maxExclusive)) {
      throw new Error("maxExclusive must be a positive integer");
    }

    if (maxExclusive === 1) {
      return 0;
    }

    // We use 32-bit unsigned integers for rejection sampling
    // This provides sufficient range for our use cases
    const maxUint32 = 0xffffffff;

    // Calculate the largest multiple of maxExclusive that fits in 32 bits
    // This is the threshold for rejection sampling
    const limit = maxUint32 - (maxUint32 % maxExclusive);

    const randomBuffer = new Uint32Array(1);
    let randomValue;

    // Keep generating until we get a value below the limit
    // This ensures uniform distribution
    do {
      crypto.getRandomValues(randomBuffer);
      randomValue = randomBuffer[0];
    } while (randomValue >= limit);

    return randomValue % maxExclusive;
  }

  /**
   * Fisher-Yates shuffle using cryptographic randomness.
   * Shuffles the array in place and returns it.
   *
   * @param {Array} array - The array to shuffle
   * @returns {Array} The shuffled array (same reference)
   */
  function secureShuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = getSecureRandomInt(i + 1);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Selects a random element from an array using cryptographic randomness.
   *
   * @param {Array} array - The array to select from
   * @returns {*} A randomly selected element
   */
  function secureRandomChoice(array) {
    if (array.length === 0) {
      throw new Error("Cannot select from empty array");
    }
    return array[getSecureRandomInt(array.length)];
  }

  // ========================================================================
  // PASSWORD GENERATION
  // ========================================================================

  /**
   * Builds the character set for password generation based on options.
   *
   * @param {Object} options - Password generation options
   * @returns {Object} Object with charset string and category arrays
   */
  function buildPasswordCharset(options) {
    let charset = "";
    const categories = [];

    let lowercase = LOWERCASE;
    let uppercase = UPPERCASE;
    let digits = DIGITS;
    let symbols = options.symbolSet || "";

    // Remove ambiguous characters if option is enabled
    if (options.avoidAmbiguous) {
      const ambiguousSet = new Set(AMBIGUOUS_CHARS);
      lowercase = lowercase
        .split("")
        .filter((c) => !ambiguousSet.has(c))
        .join("");
      uppercase = uppercase
        .split("")
        .filter((c) => !ambiguousSet.has(c))
        .join("");
      digits = digits
        .split("")
        .filter((c) => !ambiguousSet.has(c))
        .join("");
      symbols = symbols
        .split("")
        .filter((c) => !ambiguousSet.has(c))
        .join("");
    }

    if (options.lowercase && lowercase.length > 0) {
      charset += lowercase;
      categories.push(lowercase);
    }
    if (options.uppercase && uppercase.length > 0) {
      charset += uppercase;
      categories.push(uppercase);
    }
    if (options.digits && digits.length > 0) {
      charset += digits;
      categories.push(digits);
    }
    if (options.symbols && symbols.length > 0) {
      charset += symbols;
      categories.push(symbols);
    }

    // Remove duplicates from charset (in case symbols overlap with other sets)
    charset = [...new Set(charset)].join("");

    return { charset, categories };
  }

  /**
   * Generates a secure password based on the given options.
   * Ensures at least one character from each enabled category.
   *
   * @param {Object} options - Password generation options
   * @returns {string} The generated password
   */
  function generatePassword(options) {
    const { charset, categories } = buildPasswordCharset(options);

    if (charset.length === 0) {
      throw new Error("No character types selected");
    }

    const length = options.length;

    if (length < categories.length) {
      throw new Error(
        `Password length (${length}) must be at least ${categories.length} to include all selected character types`,
      );
    }

    // Start with one character from each required category
    const passwordChars = categories.map((category) =>
      secureRandomChoice(category.split("")),
    );

    // Fill the rest with random characters from the full charset
    const charsetArray = charset.split("");
    while (passwordChars.length < length) {
      passwordChars.push(secureRandomChoice(charsetArray));
    }

    // Shuffle to randomize positions
    secureShuffle(passwordChars);

    return passwordChars.join("");
  }

  // ========================================================================
  // PASSPHRASE GENERATION
  // ========================================================================

  /**
   * Applies capitalization to a word based on the selected style.
   *
   * @param {string} word - The word to capitalize
   * @param {string} style - 'lowercase', 'capitalize', or 'random'
   * @returns {string} The capitalized word
   */
  function applyCapitalization(word, style) {
    switch (style) {
      case "lowercase":
        return word.toLowerCase();
      case "capitalize":
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      case "random":
        return word
          .split("")
          .map((char) => {
            return getSecureRandomInt(2) === 0
              ? char.toLowerCase()
              : char.toUpperCase();
          })
          .join("");
      default:
        return word.toLowerCase();
    }
  }

  /**
   * Generates a secure passphrase based on the given options.
   *
   * @param {Object} options - Passphrase generation options
   * @returns {string} The generated passphrase
   */
  function generatePassphrase(options) {
    const wordCount = options.wordCount;
    const separator =
      options.separator === "custom"
        ? options.customSeparator
        : options.separator;

    // Select random words
    const words = [];
    for (let i = 0; i < wordCount; i++) {
      const word = secureRandomChoice(WORD_LIST);
      words.push(applyCapitalization(word, options.capitalization));
    }

    let passphrase = words.join(separator);

    // Add optional number (2-3 digits)
    if (options.addNumber) {
      const numDigits = getSecureRandomInt(2) + 2; // 2 or 3 digits
      let number = "";
      for (let i = 0; i < numDigits; i++) {
        number += getSecureRandomInt(10).toString();
      }
      passphrase += number;
    }

    // Add optional symbol
    if (
      options.addSymbol &&
      options.symbolSet &&
      options.symbolSet.length > 0
    ) {
      const symbol = secureRandomChoice(options.symbolSet.split(""));
      passphrase += symbol;
    }

    return passphrase;
  }

  // ========================================================================
  // ENTROPY CALCULATION
  // ========================================================================

  /**
   * Calculates entropy in bits for the current configuration.
   *
   * @param {Object} currentState - The current application state
   * @returns {Object} Object with entropy bits and details
   */
  function calculateEntropy(currentState) {
    if (currentState.mode === "password") {
      const { charset } = buildPasswordCharset(currentState.password);
      const charsetSize = charset.length;

      if (charsetSize === 0) {
        return {
          bits: 0,
          charsetSize: 0,
          length: currentState.password.length,
        };
      }

      const bits = currentState.password.length * Math.log2(charsetSize);
      return { bits, charsetSize, length: currentState.password.length };
    } else {
      // Passphrase mode
      const wordListSize = WORD_LIST.length;
      let bits = currentState.passphrase.wordCount * Math.log2(wordListSize);

      // Add entropy for optional number (2-3 digits)
      if (currentState.passphrase.addNumber) {
        // Average of 2.5 digits, so log2(10^2.5) ≈ 8.3 bits
        // Being conservative: 2 digits = log2(100) = 6.64 bits minimum
        bits += Math.log2(100);
      }

      // Add entropy for optional symbol
      if (
        currentState.passphrase.addSymbol &&
        currentState.passphrase.symbolSet
      ) {
        bits += Math.log2(currentState.passphrase.symbolSet.length || 1);
      }

      return {
        bits,
        wordListSize,
        wordCount: currentState.passphrase.wordCount,
        addNumber: currentState.passphrase.addNumber,
        addSymbol: currentState.passphrase.addSymbol,
      };
    }
  }

  /**
   * Gets the strength label and class based on entropy bits.
   *
   * @param {number} bits - Entropy in bits
   * @returns {Object} Object with label and class name
   */
  function getStrengthInfo(bits) {
    if (bits < STRENGTH_THRESHOLDS.WEAK) {
      return { label: "Weak", className: "weak" };
    } else if (bits < STRENGTH_THRESHOLDS.OKAY) {
      return { label: "Okay", className: "okay" };
    } else if (bits < STRENGTH_THRESHOLDS.STRONG) {
      return { label: "Strong", className: "strong" };
    } else {
      return { label: "Very Strong", className: "very-strong" };
    }
  }

  // ========================================================================
  // CLIPBOARD
  // ========================================================================

  /**
   * Copies text to clipboard with fallback for older browsers.
   *
   * @param {string} text - The text to copy
   * @returns {Promise<boolean>} True if copy succeeded
   */
  async function copyToClipboard(text) {
    if (!text) {
      return false;
    }

    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        // Fall through to fallback
      }
    }

    // Fallback for older browsers
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "-9999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      return success;
    } catch (err) {
      return false;
    }
  }

  // ========================================================================
  // UI UPDATE FUNCTIONS
  // ========================================================================

  /**
   * Syncs slider and number input values.
   *
   * @param {HTMLInputElement} slider - The range slider
   * @param {HTMLInputElement} input - The number input
   */
  function syncControls(slider, input) {
    const syncFromSlider = () => {
      input.value = slider.value;
    };

    const syncFromInput = () => {
      let value = parseInt(input.value, 10);
      const min = parseInt(input.min, 10);
      const max = parseInt(input.max, 10);

      if (isNaN(value)) {
        value = min;
      }
      value = Math.max(min, Math.min(max, value));
      input.value = value;
      slider.value = value;
    };

    slider.addEventListener("input", syncFromSlider);
    input.addEventListener("input", syncFromInput);
    input.addEventListener("blur", syncFromInput);
  }

  /**
   * Updates the strength panel UI.
   *
   * @param {number} entropyBits - Entropy in bits
   */
  function updateStrengthUI(entropyBits) {
    const { label, className } = getStrengthInfo(entropyBits);

    // Update bar
    elements.strengthBar.className = "strength-bar " + className;

    // Update label
    elements.strengthLabel.textContent = label;
    elements.strengthLabel.className = "strength-label " + className;

    // Update bits display
    elements.strengthBits.textContent = entropyBits.toFixed(1) + " bits";
  }

  /**
   * Shows or hides an error message.
   *
   * @param {string|null} message - Error message or null to hide
   */
  function showError(message) {
    state.error = message;

    if (message) {
      elements.errorDisplay.textContent = message;
      elements.errorDisplay.hidden = false;
      elements.btnRegenerate.disabled = true;
    } else {
      elements.errorDisplay.hidden = true;
      elements.btnRegenerate.disabled = false;
    }
  }

  /**
   * Validates the current state and returns an error message if invalid.
   *
   * @returns {string|null} Error message or null if valid
   */
  function validateState() {
    if (state.mode === "password") {
      const { lowercase, uppercase, digits, symbols, symbolSet } =
        state.password;

      // Check if at least one category is enabled
      if (!lowercase && !uppercase && !digits && !symbols) {
        return "Please select at least one character type.";
      }

      // Check if symbols is enabled but symbolSet is empty
      if (symbols && (!symbolSet || symbolSet.trim().length === 0)) {
        return "Please enter at least one symbol character.";
      }

      // Check if password length can accommodate all selected categories
      const { categories } = buildPasswordCharset(state.password);
      if (state.password.length < categories.length) {
        return `Password length must be at least ${categories.length} to include all selected character types.`;
      }
    } else {
      // Passphrase mode
      if (
        state.passphrase.separator === "custom" &&
        state.passphrase.customSeparator === ""
      ) {
        // Empty custom separator is actually valid (words concatenated)
        // No error needed
      }

      // Check passphrase symbols if addSymbol is enabled
      if (
        state.passphrase.addSymbol &&
        (!state.passphrase.symbolSet ||
          state.passphrase.symbolSet.trim().length === 0)
      ) {
        return "Please enter at least one symbol character for the passphrase.";
      }
    }

    return null;
  }

  /**
   * Generates a new password or passphrase and updates the UI.
   */
  function generate() {
    const error = validateState();
    if (error) {
      showError(error);
      state.currentOutput = "";
      elements.output.textContent = "—";
      updateStrengthUI(0);
      return;
    }

    showError(null);

    try {
      if (state.mode === "password") {
        state.currentOutput = generatePassword(state.password);
        elements.output.classList.remove("passphrase-output");
      } else {
        state.currentOutput = generatePassphrase(state.passphrase);
        elements.output.classList.add("passphrase-output");
      }

      elements.output.textContent = state.currentOutput;

      // Update strength
      const entropy = calculateEntropy(state);
      updateStrengthUI(entropy.bits);
    } catch (err) {
      showError(err.message);
      state.currentOutput = "";
      elements.output.textContent = "—";
      updateStrengthUI(0);
    }
  }

  /**
   * Shows the "Copied" feedback on the output container.
   */
  function showCopiedFeedback() {
    elements.outputContainer.classList.add("copied");
    elements.liveRegion.textContent = "Copied to clipboard";

    setTimeout(() => {
      elements.outputContainer.classList.remove("copied");
    }, 1500);
  }

  /**
   * Handles the copy action when output is clicked.
   */
  async function handleCopy() {
    if (!state.currentOutput) {
      return;
    }

    const success = await copyToClipboard(state.currentOutput);

    if (success) {
      showCopiedFeedback();
    } else {
      elements.liveRegion.textContent =
        "Failed to copy. Please select and copy manually.";
    }
  }

  /**
   * Switches between password and passphrase modes.
   *
   * @param {string} mode - 'password' or 'passphrase'
   */
  function switchMode(mode) {
    state.mode = mode;

    // Update tabs
    elements.passwordTab.setAttribute("aria-selected", mode === "password");
    elements.passphraseTab.setAttribute("aria-selected", mode === "passphrase");
    elements.passwordTab.classList.toggle("active", mode === "password");
    elements.passphraseTab.classList.toggle("active", mode === "passphrase");

    // Update panels
    elements.passwordPanel.hidden = mode !== "password";
    elements.passphrasePanel.hidden = mode !== "passphrase";

    // Update toggle indicator
    elements.modeToggle.setAttribute("data-mode", mode);

    // Update output label
    elements.outputContainer.setAttribute(
      "aria-label",
      `Generated ${mode}. Click to copy.`,
    );

    // Generate new output
    generate();
  }

  /**
   * Reads the current state from UI controls.
   */
  function readStateFromUI() {
    // Password options
    state.password.length = parseInt(elements.passwordLengthSlider.value, 10);
    state.password.lowercase = elements.optLowercase.checked;
    state.password.uppercase = elements.optUppercase.checked;
    state.password.digits = elements.optDigits.checked;
    state.password.symbols = elements.optSymbols.checked;
    state.password.symbolSet = elements.symbolsInput.value;
    state.password.avoidAmbiguous = elements.optAmbiguous.checked;

    // Passphrase options
    state.passphrase.wordCount = parseInt(
      elements.passphraseWordsSlider.value,
      10,
    );
    state.passphrase.separator = elements.separatorSelect.value;
    state.passphrase.customSeparator = elements.customSeparator.value;
    state.passphrase.capitalization = elements.capitalizationSelect.value;
    state.passphrase.addNumber = elements.optAddNumber.checked;
    state.passphrase.addSymbol = elements.optAddSymbol.checked;
    state.passphrase.symbolSet = elements.passphraseSymbolsInput.value;
  }

  /**
   * Updates visibility of conditional UI elements.
   */
  function updateConditionalUI() {
    // Show/hide password symbols config
    elements.symbolsConfig.hidden = !state.password.symbols;

    // Show/hide custom separator input
    elements.customSeparator.hidden =
      elements.separatorSelect.value !== "custom";

    // Show/hide passphrase symbols config
    elements.passphraseSymbolsConfig.hidden = !state.passphrase.addSymbol;
  }

  /**
   * Main render function - reads state and regenerates.
   */
  function render() {
    readStateFromUI();
    updateConditionalUI();
    generate();
  }

  // ========================================================================
  // EVENT LISTENERS
  // ========================================================================

  function initEventListeners() {
    // Mode toggle
    elements.passwordTab.addEventListener("click", () =>
      switchMode("password"),
    );
    elements.passphraseTab.addEventListener("click", () =>
      switchMode("passphrase"),
    );

    // Output copy
    elements.outputContainer.addEventListener("click", handleCopy);
    elements.outputContainer.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleCopy();
      }
    });

    // Regenerate button
    elements.btnRegenerate.addEventListener("click", generate);

    // Keyboard shortcut (Ctrl/Cmd + Enter)
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        generate();
      }
    });

    // Sync sliders with inputs
    syncControls(elements.passwordLengthSlider, elements.passwordLengthInput);
    syncControls(elements.passphraseWordsSlider, elements.passphraseWordsInput);

    // Password controls
    elements.passwordLengthSlider.addEventListener("input", render);
    elements.passwordLengthInput.addEventListener("input", render);
    elements.optLowercase.addEventListener("change", render);
    elements.optUppercase.addEventListener("change", render);
    elements.optDigits.addEventListener("change", render);
    elements.optSymbols.addEventListener("change", render);
    elements.symbolsInput.addEventListener("input", render);
    elements.optAmbiguous.addEventListener("change", render);

    // Passphrase controls
    elements.passphraseWordsSlider.addEventListener("input", render);
    elements.passphraseWordsInput.addEventListener("input", render);
    elements.separatorSelect.addEventListener("change", () => {
      updateConditionalUI();
      render();
    });
    elements.customSeparator.addEventListener("input", render);
    elements.capitalizationSelect.addEventListener("change", render);
    elements.optAddNumber.addEventListener("change", render);
    elements.optAddSymbol.addEventListener("change", render);
    elements.passphraseSymbolsInput.addEventListener("input", render);
  }

  // ========================================================================
  // INITIALIZATION
  // ========================================================================

  function init() {
    // Initialize DOM element references first
    elements = {
      // Mode toggle
      modeToggle: document.querySelector(".mode-toggle"),
      passwordTab: document.getElementById("tab-password"),
      passphraseTab: document.getElementById("tab-passphrase"),
      passwordPanel: document.getElementById("panel-password"),
      passphrasePanel: document.getElementById("panel-passphrase"),

      // Output
      outputContainer: document.getElementById("output-container"),
      output: document.getElementById("output"),
      btnRegenerate: document.getElementById("btn-regenerate"),
      liveRegion: document.getElementById("live-region"),
      errorDisplay: document.getElementById("error-display"),

      // Password controls
      passwordLengthSlider: document.getElementById("password-length-slider"),
      passwordLengthInput: document.getElementById("password-length-input"),
      optLowercase: document.getElementById("opt-lowercase"),
      optUppercase: document.getElementById("opt-uppercase"),
      optDigits: document.getElementById("opt-digits"),
      optSymbols: document.getElementById("opt-symbols"),
      symbolsConfig: document.getElementById("symbols-config"),
      symbolsInput: document.getElementById("symbols-input"),
      optAmbiguous: document.getElementById("opt-ambiguous"),

      // Passphrase controls
      passphraseWordsSlider: document.getElementById("passphrase-words-slider"),
      passphraseWordsInput: document.getElementById("passphrase-words-input"),
      separatorSelect: document.getElementById("separator-select"),
      customSeparator: document.getElementById("custom-separator"),
      capitalizationSelect: document.getElementById("capitalization-select"),
      optAddNumber: document.getElementById("opt-add-number"),
      optAddSymbol: document.getElementById("opt-add-symbol"),
      passphraseSymbolsConfig: document.getElementById(
        "passphrase-symbols-config",
      ),
      passphraseSymbolsInput: document.getElementById(
        "passphrase-symbols-input",
      ),

      // Strength panel
      strengthBar: document.getElementById("strength-bar"),
      strengthLabel: document.getElementById("strength-label"),
      strengthBits: document.getElementById("strength-bits"),
    };

    // Verify Web Crypto API is available
    if (
      typeof crypto === "undefined" ||
      typeof crypto.getRandomValues !== "function"
    ) {
      showError(
        "Your browser does not support the Web Crypto API. Please use a modern browser.",
      );
      return;
    }

    initEventListeners();

    // Initial render
    render();
  }

  // Start the app when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
