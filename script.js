/**
 * Keysmith Vault v1.0.0
 * Local-first password manager
 * Zero-knowledge • Offline-first • Web Crypto API
 */

(() => {
  "use strict";

  // ===== Constants =====
  const APP_NAME = "Keysmith Vault";
  const VERSION = "1.0.0";
  const DB_NAME = "keysmith-vault";
  const DB_VERSION = 1;
  const PBKDF2_ITERATIONS = 600000;
  const INACTIVITY_CHECK_INTERVAL = 10000;
  const CLIPBOARD_CLEAR_DELAY = 30000;
  const BACKUP_REMINDER_DAYS = 30;
  const TOTP_STEP = 30;
  const TOTP_DIGITS = 6;

  // Common passwords for breach check (subset for bundle size)
  const COMMON_PASSWORDS = new Set([
    "password",
    "123456",
    "12345678",
    "qwerty",
    "abc123",
    "monkey",
    "1234567",
    "letmein",
    "trustno1",
    "dragon",
    "baseball",
    "iloveyou",
    "master",
    "sunshine",
    "ashley",
    "bailey",
    "passw0rd",
    "shadow",
    "123123",
    "654321",
    "superman",
    "qazwsx",
    "michael",
    "football",
    "password1",
    "password123",
    "welcome",
    "welcome1",
    "p@ssw0rd",
    "admin",
    "login",
    "princess",
    "starwars",
    "solo",
    "qwerty123",
    "!@#$%^&*",
    "admin123",
    "root",
    "toor",
    "pass",
    "test",
    "guest",
    "master",
    "changeme",
    "123456789",
    "12345",
    "1234",
    "123",
    "1",
    "password!",
    "winter",
    "summer",
    "spring",
    "autumn",
    "fall",
    "hello",
    "charlie",
    "donald",
    "jordan",
    "thomas",
    "aaaaaa",
    "0000",
    "00000",
    "696969",
    "assword",
    "fuckoff",
    "fuckyou",
    "fuck",
    "shit",
    "secret",
    "private",
    "access",
  ]);

  // Entry templates
  const ENTRY_TEMPLATES = {
    login: {
      name: "Login",
      icon: '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>',
      fields: [
        { key: "username", label: "Username", type: "text", icon: "user" },
        { key: "password", label: "Password", type: "password", icon: "lock" },
        { key: "url", label: "Website", type: "url", icon: "link" },
        {
          key: "totp",
          label: "TOTP Secret",
          type: "password",
          icon: "clock",
          optional: true,
        },
        {
          key: "notes",
          label: "Notes",
          type: "textarea",
          icon: "note",
          optional: true,
        },
      ],
    },
    note: {
      name: "Secure Note",
      icon: '<path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor"/>',
      fields: [
        { key: "content", label: "Note", type: "textarea", icon: "note" },
      ],
    },
    wifi: {
      name: "Wi-Fi",
      icon: '<path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z" fill="currentColor"/>',
      fields: [
        {
          key: "ssid",
          label: "Network Name (SSID)",
          type: "text",
          icon: "wifi",
        },
        { key: "password", label: "Password", type: "password", icon: "lock" },
        {
          key: "security",
          label: "Security Type",
          type: "select",
          icon: "shield",
          options: ["WPA3", "WPA2", "WPA", "WEP", "None"],
        },
        {
          key: "notes",
          label: "Notes",
          type: "textarea",
          icon: "note",
          optional: true,
        },
      ],
    },
    identity: {
      name: "Identity",
      icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="currentColor"/>',
      fields: [
        { key: "firstName", label: "First Name", type: "text", icon: "user" },
        { key: "lastName", label: "Last Name", type: "text", icon: "user" },
        { key: "email", label: "Email", type: "email", icon: "mail" },
        { key: "phone", label: "Phone", type: "tel", icon: "phone" },
        {
          key: "address",
          label: "Address",
          type: "textarea",
          icon: "home",
          optional: true,
        },
        {
          key: "notes",
          label: "Notes",
          type: "textarea",
          icon: "note",
          optional: true,
        },
      ],
    },
    card: {
      name: "Payment Card",
      icon: '<path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" fill="currentColor"/>',
      fields: [
        { key: "cardName", label: "Name on Card", type: "text", icon: "user" },
        { key: "cardNumber", label: "Card Number", type: "text", icon: "card" },
        {
          key: "expiry",
          label: "Expiry (MM/YY)",
          type: "text",
          icon: "calendar",
        },
        { key: "cvv", label: "CVV", type: "password", icon: "lock" },
        {
          key: "pin",
          label: "PIN",
          type: "password",
          icon: "lock",
          optional: true,
        },
        {
          key: "notes",
          label: "Notes",
          type: "textarea",
          icon: "note",
          optional: true,
        },
      ],
    },
  };

  // ===== State =====
  let db = null;
  let currentVaultId = null;
  let currentVaultKey = null;
  let currentVault = null;
  let entries = [];
  let selectedEntryId = null;
  let activeFilters = { favorites: false, tags: [] };
  let settings = {
    theme: "system",
    accent: "blue",
    lockOnBlur: false,
    inactivityTimeout: 0,
    clearClipboard: true,
    auditEntropy: 50,
    auditAge: 365,
    auditWords: 4,
    lastBackup: null,
    onboardingComplete: false,
    installDismissed: false,
  };
  let inactivityTimer = null;
  let clipboardTimer = null;
  let totpInterval = null;
  let deferredInstallPrompt = null;

  // ===== Crypto Utilities =====
  const Crypto = {
    getRandomBytes(length) {
      const arr = new Uint8Array(length);
      crypto.getRandomValues(arr);
      return arr;
    },

    bufferToBase64(buffer) {
      return btoa(String.fromCharCode(...new Uint8Array(buffer)));
    },

    base64ToBuffer(base64) {
      const bin = atob(base64);
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      return arr.buffer;
    },

    async deriveKey(password, salt) {
      const enc = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        "PBKDF2",
        false,
        ["deriveKey"],
      );
      return crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt,
          iterations: PBKDF2_ITERATIONS,
          hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"],
      );
    },

    async encrypt(data, key) {
      const iv = this.getRandomBytes(12);
      const enc = new TextEncoder();
      const ciphertext = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        enc.encode(JSON.stringify(data)),
      );
      return {
        iv: this.bufferToBase64(iv),
        data: this.bufferToBase64(ciphertext),
      };
    },

    async decrypt(encrypted, key) {
      const iv = this.base64ToBuffer(encrypted.iv);
      const data = this.base64ToBuffer(encrypted.data);
      const dec = new TextDecoder();
      const plaintext = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        data,
      );
      return JSON.parse(dec.decode(plaintext));
    },

    generateId() {
      return Array.from(this.getRandomBytes(16), (b) =>
        b.toString(16).padStart(2, "0"),
      ).join("");
    },
  };

  // ===== IndexedDB Storage =====
  const Storage = {
    async init() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          db = request.result;
          resolve();
        };
        request.onupgradeneeded = (e) => {
          const database = e.target.result;
          if (!database.objectStoreNames.contains("vaults")) {
            database.createObjectStore("vaults", { keyPath: "id" });
          }
          if (!database.objectStoreNames.contains("settings")) {
            database.createObjectStore("settings", { keyPath: "key" });
          }
        };
      });
    },

    async getAll(store) {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readonly");
        const req = tx.objectStore(store).getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    },

    async get(store, key) {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readonly");
        const req = tx.objectStore(store).get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    },

    async put(store, data) {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readwrite");
        const req = tx.objectStore(store).put(data);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    },

    async delete(store, key) {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readwrite");
        const req = tx.objectStore(store).delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    },

    async loadSettings() {
      try {
        const stored = await this.get("settings", "app");
        if (stored?.data) Object.assign(settings, stored.data);
      } catch (e) {
        console.warn("Failed to load settings:", e);
      }
    },

    async saveSettings() {
      await this.put("settings", { key: "app", data: settings });
    },

    async getVaults() {
      return this.getAll("vaults");
    },

    async getVault(id) {
      return this.get("vaults", id);
    },

    async saveVault(vault) {
      return this.put("vaults", vault);
    },

    async deleteVault(id) {
      return this.delete("vaults", id);
    },
  };

  // ===== Vault Operations =====
  const Vault = {
    async create(name, password) {
      const salt = Crypto.getRandomBytes(32);
      const key = await Crypto.deriveKey(password, salt);
      const id = Crypto.generateId();
      const now = Date.now();
      const vaultData = { entries: [], tags: [] };
      const encrypted = await Crypto.encrypt(vaultData, key);
      const vault = {
        id,
        name,
        salt: Crypto.bufferToBase64(salt),
        encrypted,
        created: now,
        modified: now,
        entryCount: 0,
      };
      await Storage.saveVault(vault);
      return { id, key, data: vaultData };
    },

    async unlock(vaultId, password) {
      const vault = await Storage.getVault(vaultId);
      if (!vault) throw new Error("Vault not found");
      const salt = Crypto.base64ToBuffer(vault.salt);
      const key = await Crypto.deriveKey(password, salt);
      try {
        const data = await Crypto.decrypt(vault.encrypted, key);
        return { vault, key, data };
      } catch {
        throw new Error("Incorrect password");
      }
    },

    async save() {
      if (!currentVaultId || !currentVaultKey || !currentVault) return;
      const vaultData = { entries, tags: currentVault.tags || [] };
      const encrypted = await Crypto.encrypt(vaultData, currentVaultKey);
      const vault = await Storage.getVault(currentVaultId);
      vault.encrypted = encrypted;
      vault.modified = Date.now();
      vault.entryCount = entries.length;
      if (currentVault.name !== vault.name) vault.name = currentVault.name;
      await Storage.saveVault(vault);
    },

    lock() {
      currentVaultId = null;
      currentVaultKey = null;
      currentVault = null;
      entries = [];
      selectedEntryId = null;
      activeFilters = { favorites: false, tags: [] };
      if (totpInterval) {
        clearInterval(totpInterval);
        totpInterval = null;
      }
    },
  };

  // ===== Password Generator =====
  const Generator = {
    CHARSETS: {
      upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lower: "abcdefghijklmnopqrstuvwxyz",
      digits: "0123456789",
      symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
    },

    WORDLIST: [
      "apple",
      "river",
      "happy",
      "cloud",
      "tiger",
      "ocean",
      "music",
      "dream",
      "forest",
      "mountain",
      "silver",
      "golden",
      "purple",
      "orange",
      "yellow",
      "green",
      "blue",
      "red",
      "white",
      "black",
      "sunset",
      "sunrise",
      "thunder",
      "lightning",
      "rainbow",
      "crystal",
      "diamond",
      "emerald",
      "ruby",
      "pearl",
      "falcon",
      "eagle",
      "dragon",
      "phoenix",
      "unicorn",
      "wizard",
      "knight",
      "queen",
      "king",
      "prince",
      "castle",
      "tower",
      "bridge",
      "garden",
      "meadow",
      "valley",
      "canyon",
      "desert",
      "island",
      "beach",
      "voyage",
      "quest",
      "journey",
      "adventure",
      "mystery",
      "legend",
      "story",
      "chapter",
      "novel",
      "poem",
      "guitar",
      "piano",
      "violin",
      "trumpet",
      "flute",
      "melody",
      "harmony",
      "rhythm",
      "tempo",
      "chorus",
      "canvas",
      "palette",
      "brush",
      "sketch",
      "portrait",
      "landscape",
      "sculpture",
      "gallery",
      "museum",
      "studio",
      "quantum",
      "nebula",
      "cosmos",
      "galaxy",
      "stellar",
      "lunar",
      "solar",
      "meteor",
      "comet",
      "asteroid",
      "cipher",
      "binary",
      "matrix",
      "vector",
      "scalar",
      "tensor",
      "fractal",
      "algorithm",
      "function",
      "variable",
      "anchor",
      "compass",
      "harbor",
      "voyage",
      "captain",
      "sailor",
      "vessel",
      "horizon",
      "current",
      "tide",
      "blossom",
      "petal",
      "garden",
      "meadow",
      "orchard",
      "vineyard",
      "harvest",
      "season",
      "spring",
      "autumn",
      "whisper",
      "echo",
      "silence",
      "thunder",
      "harmony",
      "melody",
      "symphony",
      "crescendo",
      "tempo",
      "rhythm",
      "ember",
      "flame",
      "spark",
      "blaze",
      "inferno",
      "ash",
      "smoke",
      "kindle",
      "torch",
      "lantern",
      "frost",
      "glacier",
      "arctic",
      "polar",
      "tundra",
      "winter",
      "snowfall",
      "icicle",
      "frozen",
      "chill",
    ],

    config: {
      mode: "password",
      length: 20,
      upper: true,
      lower: true,
      digits: true,
      symbols: true,
      wordCount: 4,
      separator: "-",
      capitalize: true,
      includeNumber: true,
    },

    generate() {
      if (this.config.mode === "password") {
        return this.generatePassword();
      } else {
        return this.generatePassphrase();
      }
    },

    generatePassword() {
      const { length, upper, lower, digits, symbols } = this.config;
      let chars = "";
      const required = [];
      if (upper) {
        chars += this.CHARSETS.upper;
        required.push(this.CHARSETS.upper);
      }
      if (lower) {
        chars += this.CHARSETS.lower;
        required.push(this.CHARSETS.lower);
      }
      if (digits) {
        chars += this.CHARSETS.digits;
        required.push(this.CHARSETS.digits);
      }
      if (symbols) {
        chars += this.CHARSETS.symbols;
        required.push(this.CHARSETS.symbols);
      }
      if (!chars) chars = this.CHARSETS.lower;

      const arr = new Uint32Array(length);
      crypto.getRandomValues(arr);
      let password = Array.from(arr, (n) => chars[n % chars.length]).join("");

      // Ensure at least one from each required set
      if (required.length > 0 && length >= required.length) {
        const positions = new Set();
        const posArr = new Uint32Array(required.length);
        crypto.getRandomValues(posArr);
        required.forEach((set, i) => {
          let pos = posArr[i] % length;
          while (positions.has(pos)) pos = (pos + 1) % length;
          positions.add(pos);
          const randIdx = new Uint32Array(1);
          crypto.getRandomValues(randIdx);
          password =
            password.substring(0, pos) +
            set[randIdx[0] % set.length] +
            password.substring(pos + 1);
        });
      }
      return password;
    },

    generatePassphrase() {
      const { wordCount, separator, capitalize, includeNumber } = this.config;
      const arr = new Uint32Array(wordCount);
      crypto.getRandomValues(arr);
      let words = Array.from(
        arr,
        (n) => this.WORDLIST[n % this.WORDLIST.length],
      );
      if (capitalize) {
        words = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1));
      }
      if (includeNumber) {
        const numArr = new Uint32Array(2);
        crypto.getRandomValues(numArr);
        const pos = numArr[0] % (words.length + 1);
        const num = (numArr[1] % 900) + 100;
        words.splice(pos, 0, String(num));
      }
      return words.join(separator);
    },

    calculateEntropy(password) {
      let poolSize = 0;
      if (/[a-z]/.test(password)) poolSize += 26;
      if (/[A-Z]/.test(password)) poolSize += 26;
      if (/[0-9]/.test(password)) poolSize += 10;
      if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;
      return Math.floor(Math.log2(Math.pow(poolSize || 1, password.length)));
    },

    getStrength(password) {
      const entropy = this.calculateEntropy(password);
      if (entropy < 28) return { level: "weak", label: "Weak", entropy };
      if (entropy < 36) return { level: "fair", label: "Fair", entropy };
      if (entropy < 60) return { level: "good", label: "Good", entropy };
      return { level: "strong", label: "Strong", entropy };
    },
  };

  // ===== TOTP Generator =====
  const TOTP = {
    base32Decode(str) {
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
      const cleanStr = str.toUpperCase().replace(/[^A-Z2-7]/g, "");
      let bits = "";
      for (const c of cleanStr) {
        const val = alphabet.indexOf(c);
        if (val === -1) continue;
        bits += val.toString(2).padStart(5, "0");
      }
      const bytes = new Uint8Array(Math.floor(bits.length / 8));
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(bits.substr(i * 8, 8), 2);
      }
      return bytes;
    },

    async hmacSha1(key, data) {
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        key,
        { name: "HMAC", hash: "SHA-1" },
        false,
        ["sign"],
      );
      const sig = await crypto.subtle.sign("HMAC", cryptoKey, data);
      return new Uint8Array(sig);
    },

    async generate(secret) {
      try {
        const key = this.base32Decode(secret);
        const time = Math.floor(Date.now() / 1000 / TOTP_STEP);
        const timeBuffer = new ArrayBuffer(8);
        const view = new DataView(timeBuffer);
        view.setUint32(4, time, false);

        const hmac = await this.hmacSha1(key, new Uint8Array(timeBuffer));
        const offset = hmac[hmac.length - 1] & 0x0f;
        const code =
          (((hmac[offset] & 0x7f) << 24) |
            ((hmac[offset + 1] & 0xff) << 16) |
            ((hmac[offset + 2] & 0xff) << 8) |
            (hmac[offset + 3] & 0xff)) %
          Math.pow(10, TOTP_DIGITS);

        return code.toString().padStart(TOTP_DIGITS, "0");
      } catch {
        return null;
      }
    },

    getSecondsRemaining() {
      return TOTP_STEP - (Math.floor(Date.now() / 1000) % TOTP_STEP);
    },
  };

  // ===== Security Audit =====
  const Audit = {
    run() {
      const results = { weak: [], reused: [], old: [], breach: [] };
      const passwordMap = new Map();
      const now = Date.now();
      const maxAge = settings.auditAge * 24 * 60 * 60 * 1000;

      for (const entry of entries) {
        const pw = entry.fields?.password;
        if (!pw) continue;

        // Weak check
        const strength = Generator.getStrength(pw);
        if (strength.entropy < settings.auditEntropy) {
          results.weak.push({
            entry,
            reason: `${strength.label} (${strength.entropy} bits)`,
          });
        }

        // Reused check
        if (passwordMap.has(pw)) {
          const existing = passwordMap.get(pw);
          if (!results.reused.find((r) => r.entry.id === existing.id)) {
            results.reused.push({ entry: existing, reason: "Reused password" });
          }
          results.reused.push({ entry, reason: "Reused password" });
        }
        passwordMap.set(pw, entry);

        // Old check
        const modified = entry.modified || entry.created;
        if (now - modified > maxAge) {
          const days = Math.floor((now - modified) / (24 * 60 * 60 * 1000));
          results.old.push({ entry, reason: `${days} days old` });
        }

        // Breach/common check
        if (COMMON_PASSWORDS.has(pw.toLowerCase())) {
          results.breach.push({ entry, reason: "Common password" });
        }
      }

      return results;
    },
  };

  // ===== UI Utilities =====
  const UI = {
    $(selector) {
      return document.querySelector(selector);
    },

    $$(selector) {
      return document.querySelectorAll(selector);
    },

    show(el) {
      if (typeof el === "string") el = this.$(el);
      if (el) el.hidden = false;
    },

    hide(el) {
      if (typeof el === "string") el = this.$(el);
      if (el) el.hidden = true;
    },

    toast(message, type = "info") {
      const toast = this.$("#toast");
      const icons = {
        success:
          '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg>',
        error:
          '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/></svg>',
        info: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/></svg>',
      };
      toast.className = `toast ${type}`;
      toast.querySelector(".toast-icon").innerHTML = icons[type];
      toast.querySelector(".toast-msg").textContent = message;
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 3000);
    },

    announce(message) {
      const region = this.$("#live-region");
      region.textContent = message;
    },

    openModal(id) {
      const modal = this.$(`#${id}`);
      this.show(modal);
      const firstInput = modal.querySelector(
        'input:not([type="hidden"]),select,textarea',
      );
      if (firstInput) setTimeout(() => firstInput.focus(), 100);
      document.body.style.overflow = "hidden";
    },

    closeModal(id) {
      const modal = this.$(`#${id}`);
      this.hide(modal);
      document.body.style.overflow = "";
    },

    closeAllModals() {
      this.$$(".modal-backdrop").forEach((m) => this.hide(m));
      this.hide("#cmd-palette");
      document.body.style.overflow = "";
    },

    formatDate(timestamp) {
      return new Date(timestamp).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },

    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        this.toast("Copied to clipboard", "success");
        if (settings.clearClipboard) {
          if (clipboardTimer) clearTimeout(clipboardTimer);
          clipboardTimer = setTimeout(async () => {
            try {
              await navigator.clipboard.writeText("");
            } catch {}
          }, CLIPBOARD_CLEAR_DELAY);
        }
        return true;
      } catch {
        this.toast("Failed to copy", "error");
        return false;
      }
    },
  };

  // ===== Navigation =====
  const Nav = {
    currentView: "vault",

    init() {
      UI.$$(".nav-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const view = btn.id.replace("nav-", "");
          this.switchTo(view);
        });
      });
      this.updateIndicator();
    },

    switchTo(view) {
      this.currentView = view;
      UI.$$(".nav-btn").forEach((btn) => {
        const isActive = btn.id === `nav-${view}`;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-selected", isActive);
      });
      UI.$$(".view").forEach((v) => {
        const isActive = v.id === `view-${view}`;
        v.classList.toggle("active", isActive);
        v.hidden = !isActive;
      });
      this.updateIndicator();
      if (view === "generator") GeneratorUI.mount("#generator-mount");
      if (view === "audit") AuditUI.refresh();
    },

    updateIndicator() {
      const indicator = UI.$(".nav-indicator");
      const activeBtn = UI.$(".nav-btn.active");
      if (indicator && activeBtn) {
        indicator.style.left = `${activeBtn.offsetLeft}px`;
        indicator.style.width = `${activeBtn.offsetWidth}px`;
      }
    },
  };

  // ===== Generator UI =====
  const GeneratorUI = {
    mounted: false,

    mount(selector) {
      const container = UI.$(selector);
      if (!container || this.mounted) return;
      this.mounted = true;

      container.innerHTML = `
        <div class="generator">
          <div class="gen-header">
            <h2>Generator</h2>
            <div class="gen-mode">
              <button class="mode-btn active" data-mode="password">Password</button>
              <button class="mode-btn" data-mode="passphrase">Passphrase</button>
            </div>
          </div>
          <div class="gen-output">
            <div class="gen-display" id="gen-value"></div>
            <div class="gen-actions">
              <button class="btn-icon" id="gen-copy" title="Copy"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/></svg></button>
              <button class="btn-icon" id="gen-refresh" title="Regenerate"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/></svg></button>
            </div>
          </div>
          <div class="gen-strength">
            <div class="strength-bar"><div class="strength-fill" id="gen-strength-fill"></div></div>
            <span class="strength-label" id="gen-strength-label">—</span>
            <span class="strength-bits" id="gen-strength-bits"></span>
          </div>
          <div class="controls-panel" id="password-controls">
            <div class="control-row">
              <span class="control-label">Length</span>
              <input type="range" id="gen-length" min="8" max="64" value="${Generator.config.length}">
              <span class="control-value" id="gen-length-val">${Generator.config.length}</span>
            </div>
            <div class="toggle-grid">
              <label class="toggle-item ${Generator.config.upper ? "active" : ""}"><input type="checkbox" id="gen-upper" ${Generator.config.upper ? "checked" : ""}><span class="toggle-box"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg></span><span class="toggle-text">ABC</span></label>
              <label class="toggle-item ${Generator.config.lower ? "active" : ""}"><input type="checkbox" id="gen-lower" ${Generator.config.lower ? "checked" : ""}><span class="toggle-box"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg></span><span class="toggle-text">abc</span></label>
              <label class="toggle-item ${Generator.config.digits ? "active" : ""}"><input type="checkbox" id="gen-digits" ${Generator.config.digits ? "checked" : ""}><span class="toggle-box"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg></span><span class="toggle-text">123</span></label>
              <label class="toggle-item ${Generator.config.symbols ? "active" : ""}"><input type="checkbox" id="gen-symbols" ${Generator.config.symbols ? "checked" : ""}><span class="toggle-box"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg></span><span class="toggle-text">!@#</span></label>
            </div>
          </div>
          <div class="controls-panel pp-options" id="passphrase-controls" hidden>
            <div class="control-row">
              <span class="control-label">Words</span>
              <input type="range" id="gen-words" min="3" max="10" value="${Generator.config.wordCount}">
              <span class="control-value" id="gen-words-val">${Generator.config.wordCount}</span>
            </div>
            <div class="control-row">
              <span class="control-label">Separator</span>
              <div class="sep-group">
                <button class="sep-btn ${Generator.config.separator === "-" ? "active" : ""}" data-sep="-">-</button>
                <button class="sep-btn ${Generator.config.separator === "_" ? "active" : ""}" data-sep="_">_</button>
                <button class="sep-btn ${Generator.config.separator === "." ? "active" : ""}" data-sep=".">.</button>
                <button class="sep-btn ${Generator.config.separator === " " ? "active" : ""}" data-sep=" ">␣</button>
              </div>
            </div>
            <div class="toggle-grid">
              <label class="toggle-item ${Generator.config.capitalize ? "active" : ""}"><input type="checkbox" id="gen-cap" ${Generator.config.capitalize ? "checked" : ""}><span class="toggle-box"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg></span><span class="toggle-text">Capitalize</span></label>
              <label class="toggle-item ${Generator.config.includeNumber ? "active" : ""}"><input type="checkbox" id="gen-num" ${Generator.config.includeNumber ? "checked" : ""}><span class="toggle-box"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg></span><span class="toggle-text">Add Number</span></label>
            </div>
          </div>
        </div>
      `;

      this.bindEvents(container);
      this.regenerate();
    },

    bindEvents(container) {
      // Mode toggle
      container.querySelectorAll(".mode-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          container
            .querySelectorAll(".mode-btn")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          Generator.config.mode = btn.dataset.mode;
          UI.$("#password-controls").hidden =
            Generator.config.mode !== "password";
          UI.$("#passphrase-controls").hidden =
            Generator.config.mode !== "passphrase";
          this.regenerate();
        });
      });

      // Copy & Refresh
      UI.$("#gen-copy").addEventListener("click", () => {
        UI.copyToClipboard(UI.$("#gen-value").textContent);
      });
      UI.$("#gen-refresh").addEventListener("click", () => this.regenerate());

      // Password controls
      const lengthSlider = UI.$("#gen-length");
      lengthSlider.addEventListener("input", () => {
        Generator.config.length = parseInt(lengthSlider.value);
        UI.$("#gen-length-val").textContent = lengthSlider.value;
        this.regenerate();
      });

      ["upper", "lower", "digits", "symbols"].forEach((key) => {
        const cb = UI.$(`#gen-${key}`);
        cb.addEventListener("change", () => {
          Generator.config[key] = cb.checked;
          cb.closest(".toggle-item").classList.toggle("active", cb.checked);
          this.regenerate();
        });
      });

      // Passphrase controls
      const wordsSlider = UI.$("#gen-words");
      wordsSlider.addEventListener("input", () => {
        Generator.config.wordCount = parseInt(wordsSlider.value);
        UI.$("#gen-words-val").textContent = wordsSlider.value;
        this.regenerate();
      });

      container.querySelectorAll(".sep-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          container
            .querySelectorAll(".sep-btn")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          Generator.config.separator = btn.dataset.sep;
          this.regenerate();
        });
      });

      const capCb = UI.$("#gen-cap");
      capCb?.addEventListener("change", () => {
        Generator.config.capitalize = capCb.checked;
        capCb.closest(".toggle-item").classList.toggle("active", capCb.checked);
        this.regenerate();
      });

      const numCb = UI.$("#gen-num");
      numCb?.addEventListener("change", () => {
        Generator.config.includeNumber = numCb.checked;
        numCb.closest(".toggle-item").classList.toggle("active", numCb.checked);
        this.regenerate();
      });
    },

    regenerate() {
      const value = Generator.generate();
      const display = UI.$("#gen-value");
      if (display) {
        display.textContent = value;
        display.classList.remove("fresh");
        void display.offsetWidth;
        display.classList.add("fresh");
      }
      this.updateStrength(value);
      return value;
    },

    updateStrength(password) {
      const strength = Generator.getStrength(password);
      const fill = UI.$("#gen-strength-fill");
      const label = UI.$("#gen-strength-label");
      const bits = UI.$("#gen-strength-bits");
      if (fill) {
        fill.dataset.level = strength.level;
        fill.style.width = "";
      }
      if (label) {
        label.textContent = strength.label;
        label.dataset.level = strength.level;
      }
      if (bits) bits.textContent = `${strength.entropy} bits`;
    },

    getPassword() {
      return UI.$("#gen-value")?.textContent || Generator.generate();
    },
  };

  // ===== Audit UI =====
  const AuditUI = {
    results: null,

    refresh() {
      this.results = Audit.run();
      this.updateCounts();
      this.renderResults();
    },

    updateCounts() {
      if (!this.results) return;
      UI.$("#count-weak").textContent = this.results.weak.length;
      UI.$("#count-reused").textContent = this.results.reused.length;
      UI.$("#count-old").textContent = this.results.old.length;
      UI.$("#count-breach").textContent = this.results.breach.length;
      const total =
        this.results.weak.length +
        this.results.reused.length +
        this.results.old.length +
        this.results.breach.length;
      const badge = UI.$("#audit-badge");
      badge.textContent = total;
      badge.hidden = total === 0;
    },

    renderResults() {
      const container = UI.$("#audit-results");
      if (!this.results) {
        container.innerHTML =
          '<div class="audit-empty"><svg viewBox="0 0 24 24" width="48" height="48" opacity="0.3"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="currentColor"/></svg><p>Run an audit to check your passwords</p></div>';
        return;
      }

      const allClear = Object.values(this.results).every(
        (arr) => arr.length === 0,
      );
      if (allClear) {
        container.innerHTML =
          '<div class="audit-empty" style="color:var(--success)"><svg viewBox="0 0 24 24" width="48" height="48"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="currentColor"/></svg><p>All passwords pass the audit!</p></div>';
        return;
      }

      let html = "";
      const groups = [
        { key: "weak", label: "Weak Passwords", color: "var(--error)" },
        { key: "reused", label: "Reused Passwords", color: "var(--warning)" },
        { key: "old", label: "Old Passwords", color: "var(--info)" },
        { key: "breach", label: "Common Passwords", color: "#FF2D55" },
      ];

      for (const group of groups) {
        const items = this.results[group.key];
        if (items.length === 0) continue;
        html += `<div class="audit-group"><div class="audit-group-header" style="color:${group.color}"><svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg>${group.label} <span>(${items.length})</span></div>`;
        for (const { entry, reason } of items) {
          const template = ENTRY_TEMPLATES[entry.type] || ENTRY_TEMPLATES.login;
          html += `<div class="audit-entry" data-id="${entry.id}"><div class="entry-icon"><svg viewBox="0 0 24 24" width="20" height="20">${template.icon}</svg></div><div class="entry-info"><div class="entry-name">${this.escapeHtml(entry.name)}</div></div><span class="audit-reason">${reason}</span></div>`;
        }
        html += "</div>";
      }

      container.innerHTML = html;

      container.querySelectorAll(".audit-entry").forEach((el) => {
        el.addEventListener("click", () => {
          const id = el.dataset.id;
          Nav.switchTo("vault");
          setTimeout(() => EntryUI.select(id), 100);
        });
      });
    },

    escapeHtml(str) {
      const div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    },
  };

  // ===== Entry UI =====
  const EntryUI = {
    editingId: null,

    render() {
      const list = UI.$("#entry-list");
      const empty = UI.$("#empty-state");
      const filtered = this.getFiltered();

      if (entries.length === 0) {
        list.innerHTML = "";
        UI.show(empty);
        return;
      }

      UI.hide(empty);

      if (filtered.length === 0) {
        list.innerHTML =
          '<div class="empty-state"><p>No entries match your filters</p></div>';
        return;
      }

      list.innerHTML = filtered
        .map((entry) => {
          const template = ENTRY_TEMPLATES[entry.type] || ENTRY_TEMPLATES.login;
          const hasTOTP = entry.fields?.totp;
          const isWeak =
            entry.fields?.password &&
            Generator.getStrength(entry.fields.password).entropy <
              settings.auditEntropy;
          return `
          <div class="entry-item ${selectedEntryId === entry.id ? "selected" : ""}" data-id="${entry.id}" data-favorite="${entry.favorite || false}" role="option" tabindex="0">
            <div class="entry-icon"><svg viewBox="0 0 24 24" width="20" height="20">${template.icon}</svg></div>
            <div class="entry-info">
              <div class="entry-name">${this.escapeHtml(entry.name)}</div>
              <div class="entry-sub">${this.getSubtitle(entry)}</div>
            </div>
            <div class="entry-badges">
              ${hasTOTP ? '<span class="entry-badge totp" title="Has 2FA"><svg viewBox="0 0 24 24" width="14" height="14"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor"/></svg></span>' : ""}
              ${isWeak ? '<span class="entry-badge weak" title="Weak password"><svg viewBox="0 0 24 24" width="14" height="14"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="currentColor"/></svg></span>' : ""}
            </div>
          </div>
        `;
        })
        .join("");

      list.querySelectorAll(".entry-item").forEach((el) => {
        el.addEventListener("click", () => this.select(el.dataset.id));
        el.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this.select(el.dataset.id);
          }
        });
      });
    },

    getFiltered() {
      return entries
        .filter((entry) => {
          if (activeFilters.favorites && !entry.favorite) return false;
          if (activeFilters.tags.length > 0) {
            if (
              !entry.tags ||
              !activeFilters.tags.some((t) => entry.tags.includes(t))
            )
              return false;
          }
          const searchVal = UI.$("#search-input")?.value.toLowerCase() || "";
          if (searchVal) {
            const searchable = [
              entry.name,
              entry.fields?.username,
              entry.fields?.url,
              ...(entry.tags || []),
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();
            if (!searchable.includes(searchVal)) return false;
          }
          return true;
        })
        .sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          if (a.favorite && !b.favorite) return -1;
          if (!a.favorite && b.favorite) return 1;
          return (b.modified || b.created) - (a.modified || a.created);
        });
    },

    getSubtitle(entry) {
      if (entry.type === "login")
        return entry.fields?.username || entry.fields?.url || "";
      if (entry.type === "wifi") return entry.fields?.ssid || "";
      if (entry.type === "card")
        return entry.fields?.cardNumber
          ? "•••• " + entry.fields.cardNumber.slice(-4)
          : "";
      if (entry.type === "identity")
        return [entry.fields?.firstName, entry.fields?.lastName]
          .filter(Boolean)
          .join(" ");
      if (entry.type === "note") return "Secure Note";
      return "";
    },

    select(id) {
      selectedEntryId = id;
      this.render();
      this.renderDetail();
      // On mobile, show detail as modal-like view
      if (window.innerWidth < 900) {
        // Could add mobile detail view here
      }
    },

    renderDetail() {
      const content = UI.$("#detail-content");
      const empty = UI.$(".detail-empty");

      if (!selectedEntryId) {
        UI.hide(content);
        if (empty) empty.style.display = "";
        return;
      }

      const entry = entries.find((e) => e.id === selectedEntryId);
      if (!entry) return;

      if (empty) empty.style.display = "none";
      UI.show(content);

      const template = ENTRY_TEMPLATES[entry.type] || ENTRY_TEMPLATES.login;

      let fieldsHtml = "";
      for (const field of template.fields) {
        const value = entry.fields?.[field.key];
        if (!value && field.optional) continue;

        const isSecret = field.type === "password";
        fieldsHtml += `
          <div class="detail-field" data-key="${field.key}">
            <div class="detail-field-label">${field.label}</div>
            <div class="detail-field-value ${isSecret ? "secret hidden" : ""}">
              <span>${isSecret ? "••••••••••••" : this.escapeHtml(value || "—")}</span>
              ${isSecret ? `<button class="btn-icon" data-action="toggle" title="Show"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/></svg></button>` : ""}
              <button class="btn-icon" data-action="copy" data-value="${this.escapeHtml(value || "")}" title="Copy"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/></svg></button>
              ${field.key === "totp" && value ? `<button class="btn-icon" data-action="totp" title="Show TOTP"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor"/></svg></button>` : ""}
            </div>
          </div>
        `;
      }

      const tagsHtml = (entry.tags || [])
        .map((t) => `<span class="tag">${this.escapeHtml(t)}</span>`)
        .join("");

      content.innerHTML = `
        <div class="detail-header">
          <div class="detail-icon"><svg viewBox="0 0 24 24">${template.icon}</svg></div>
          <div class="detail-title">
            <h2>${this.escapeHtml(entry.name)}</h2>
            <span>${template.name} • Updated ${UI.formatDate(entry.modified || entry.created)}</span>
          </div>
          <div class="detail-actions">
            <button class="btn-icon" id="detail-fav" title="${entry.favorite ? "Unfavorite" : "Favorite"}"><svg viewBox="0 0 24 24" width="20" height="20" ${entry.favorite ? 'fill="var(--warning)"' : ""}><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" ${entry.favorite ? 'fill="var(--warning)"' : 'fill="none" stroke="currentColor" stroke-width="2"'}/></svg></button>
            <button class="btn-icon" id="detail-edit" title="Edit"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 000-1.41l-2.34-2.34a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg></button>
          </div>
        </div>
        ${fieldsHtml}
        ${tagsHtml ? `<div class="detail-tags">${tagsHtml}</div>` : ""}
      `;

      // Bind detail actions
      content.querySelectorAll('[data-action="copy"]').forEach((btn) => {
        btn.addEventListener("click", () =>
          UI.copyToClipboard(btn.dataset.value),
        );
      });

      content.querySelectorAll('[data-action="toggle"]').forEach((btn) => {
        btn.addEventListener("click", () => {
          const field = btn.closest(".detail-field");
          const valueEl = field.querySelector(".detail-field-value");
          const span = valueEl.querySelector("span");
          const key = field.dataset.key;
          const isHidden = valueEl.classList.contains("hidden");
          if (isHidden) {
            span.textContent = entry.fields?.[key] || "";
            valueEl.classList.remove("hidden");
          } else {
            span.textContent = "••••••••••••";
            valueEl.classList.add("hidden");
          }
        });
      });

      content.querySelectorAll('[data-action="totp"]').forEach((btn) => {
        btn.addEventListener("click", () => this.showTOTP(entry.fields?.totp));
      });

      UI.$("#detail-fav")?.addEventListener("click", () => {
        entry.favorite = !entry.favorite;
        Vault.save();
        this.render();
        this.renderDetail();
      });

      UI.$("#detail-edit")?.addEventListener("click", () =>
        this.openEdit(entry.id),
      );
    },

    async showTOTP(secret) {
      if (!secret) return;
      UI.openModal("totp-modal");

      const updateTOTP = async () => {
        const code = await TOTP.generate(secret);
        UI.$("#totp-code").textContent = code || "------";
        const secs = TOTP.getSecondsRemaining();
        UI.$("#totp-secs").textContent = secs;
        const ring = UI.$("#totp-ring");
        const circumference = 2 * Math.PI * 16;
        ring.style.strokeDashoffset = circumference * (1 - secs / 30);
      };

      await updateTOTP();
      if (totpInterval) clearInterval(totpInterval);
      totpInterval = setInterval(updateTOTP, 1000);

      UI.$("#btn-copy-totp").onclick = async () => {
        const code = UI.$("#totp-code").textContent;
        if (code && code !== "------") {
          UI.copyToClipboard(code);
        }
      };
    },

    openNew() {
      this.editingId = null;
      UI.$("#entry-modal-title").textContent = "Add Entry";
      UI.$("#entry-type").value = "login";
      UI.$("#entry-form").reset();
      UI.hide("#btn-delete-entry");
      UI.hide("#history-section");
      this.renderFields("login");
      this.renderTagsInput([]);
      UI.$("#custom-fields").innerHTML = "";
      UI.openModal("entry-modal");
    },

    openEdit(id) {
      const entry = entries.find((e) => e.id === id);
      if (!entry) return;

      this.editingId = id;
      UI.$("#entry-modal-title").textContent = "Edit Entry";
      UI.$("#entry-type").value = entry.type;
      UI.show("#btn-delete-entry");
      this.renderFields(entry.type, entry.fields);
      this.renderTagsInput(entry.tags || []);
      this.renderCustomFields(entry.customFields || []);
      this.renderPasswordHistory(entry.passwordHistory || []);
      UI.openModal("entry-modal");
    },

    renderFields(type, values = {}) {
      const template = ENTRY_TEMPLATES[type];
      if (!template) return;

      const container = UI.$("#entry-fields");
      container.innerHTML = `
        <div class="form-field">
          <label for="entry-name">Name</label>
          <input type="text" id="entry-name" class="text-input" placeholder="e.g., Google Account" value="${this.escapeHtml(values._name || "")}" required>
        </div>
        ${template.fields
          .map((field) => {
            if (field.type === "textarea") {
              return `<div class="form-field"><label for="entry-${field.key}">${field.label}</label><textarea id="entry-${field.key}" class="text-input" rows="3" placeholder="${field.optional ? "(Optional)" : ""}">${this.escapeHtml(values[field.key] || "")}</textarea></div>`;
            }
            if (field.type === "select") {
              return `<div class="form-field"><label for="entry-${field.key}">${field.label}</label><select id="entry-${field.key}" class="select-input">${field.options.map((o) => `<option value="${o}" ${values[field.key] === o ? "selected" : ""}>${o}</option>`).join("")}</select></div>`;
            }
            const isPassword = field.type === "password";
            return `
            <div class="form-field">
              <label for="entry-${field.key}">${field.label}</label>
              <div class="${isPassword ? "password-wrapper" : ""}">
                <input type="${isPassword ? "password" : field.type}" id="entry-${field.key}" class="text-input" placeholder="${field.optional ? "(Optional)" : ""}" value="${this.escapeHtml(values[field.key] || "")}">
                ${isPassword ? `<button type="button" class="btn-toggle-vis"><svg class="eye-open" viewBox="0 0 24 24" width="20" height="20"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/></svg><svg class="eye-closed" viewBox="0 0 24 24" width="20" height="20" hidden><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 001 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="currentColor"/></svg></button>` : ""}
                ${field.key === "password" ? `<button type="button" class="btn-icon" id="btn-gen-pw" title="Generate"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/></svg></button>` : ""}
              </div>
            </div>
          `;
          })
          .join("")}
      `;

      // Bind password visibility toggles
      container.querySelectorAll(".btn-toggle-vis").forEach((btn) => {
        btn.addEventListener("click", () => {
          const input = btn.parentElement.querySelector("input");
          const eyeOpen = btn.querySelector(".eye-open");
          const eyeClosed = btn.querySelector(".eye-closed");
          if (input.type === "password") {
            input.type = "text";
            eyeOpen.hidden = true;
            eyeClosed.hidden = false;
          } else {
            input.type = "password";
            eyeOpen.hidden = false;
            eyeClosed.hidden = true;
          }
        });
      });

      // Bind generate password button
      UI.$("#btn-gen-pw")?.addEventListener("click", () => {
        UI.openModal("gen-modal");
        GeneratorUI.mount("#modal-gen-mount");
      });
    },

    renderTagsInput(tags) {
      const list = UI.$("#entry-tags-list");
      list.innerHTML = tags
        .map(
          (t) =>
            `<span class="tag">${this.escapeHtml(t)}<button type="button" data-tag="${this.escapeHtml(t)}"><svg viewBox="0 0 24 24" width="12" height="12"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/></svg></button></span>`,
        )
        .join("");
      list.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => {
          const tag = btn.dataset.tag;
          const current = this.getCurrentTags();
          this.renderTagsInput(current.filter((t) => t !== tag));
        });
      });
    },

    getCurrentTags() {
      return Array.from(UI.$$("#entry-tags-list .tag")).map((el) =>
        el.textContent.trim(),
      );
    },

    renderCustomFields(fields) {
      const container = UI.$("#custom-fields");
      container.innerHTML = fields
        .map(
          (f, i) => `
        <div class="custom-field" data-index="${i}">
          <input type="text" class="text-input" placeholder="Label" value="${this.escapeHtml(f.label)}">
          <input type="text" class="text-input" placeholder="Value" value="${this.escapeHtml(f.value)}">
          <button type="button" class="btn-icon" data-remove="${i}"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/></svg></button>
        </div>
      `,
        )
        .join("");

      container.querySelectorAll("[data-remove]").forEach((btn) => {
        btn.addEventListener("click", () => {
          btn.closest(".custom-field").remove();
        });
      });
    },

    renderPasswordHistory(history) {
      const section = UI.$("#history-section");
      const container = UI.$("#password-history");
      if (!history || history.length === 0) {
        UI.hide(section);
        return;
      }
      UI.show(section);
      container.innerHTML = history
        .map(
          (h) => `
        <div class="history-item">
          <span class="history-pw">${"•".repeat(12)}</span>
          <span class="history-date">${UI.formatDate(h.date)}</span>
          <button class="btn-icon" data-pw="${this.escapeHtml(h.password)}"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/></svg></button>
        </div>
      `,
        )
        .join("");

      container.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => UI.copyToClipboard(btn.dataset.pw));
      });
    },

    async save() {
      const type = UI.$("#entry-type").value;
      const name = UI.$("#entry-name").value.trim();
      if (!name) {
        UI.$("#entry-error").textContent = "Name is required";
        UI.show("#entry-error");
        return;
      }

      const template = ENTRY_TEMPLATES[type];
      const fields = {};
      for (const field of template.fields) {
        const el = UI.$(`#entry-${field.key}`);
        if (el) fields[field.key] = el.value;
      }

      const tags = this.getCurrentTags();
      const customFields = Array.from(UI.$$("#custom-fields .custom-field"))
        .map((el) => {
          const inputs = el.querySelectorAll("input");
          return { label: inputs[0].value, value: inputs[1].value };
        })
        .filter((f) => f.label && f.value);

      const now = Date.now();

      if (this.editingId) {
        const entry = entries.find((e) => e.id === this.editingId);
        if (entry) {
          // Track password history
          if (
            entry.fields?.password &&
            fields.password &&
            entry.fields.password !== fields.password
          ) {
            entry.passwordHistory = entry.passwordHistory || [];
            entry.passwordHistory.unshift({
              password: entry.fields.password,
              date: entry.modified || entry.created,
            });
            if (entry.passwordHistory.length > 10) entry.passwordHistory.pop();
          }
          entry.type = type;
          entry.name = name;
          entry.fields = { ...fields, _name: name };
          entry.tags = tags;
          entry.customFields = customFields;
          entry.modified = now;
        }
      } else {
        const entry = {
          id: Crypto.generateId(),
          type,
          name,
          fields: { ...fields, _name: name },
          tags,
          customFields,
          favorite: false,
          pinned: false,
          created: now,
          modified: now,
          passwordHistory: [],
        };
        entries.push(entry);
        selectedEntryId = entry.id;
      }

      await Vault.save();
      UI.closeModal("entry-modal");
      this.render();
      this.renderDetail();
      UI.toast(this.editingId ? "Entry updated" : "Entry created", "success");
      this.editingId = null;
    },

    async delete() {
      if (!selectedEntryId) return;
      const entry = entries.find((e) => e.id === selectedEntryId);
      if (!entry) return;

      UI.$("#del-entry-name").textContent = entry.name;
      UI.openModal("delete-entry-modal");
    },

    async confirmDelete() {
      entries = entries.filter((e) => e.id !== selectedEntryId);
      selectedEntryId = null;
      await Vault.save();
      UI.closeModal("delete-entry-modal");
      this.render();
      this.renderDetail();
      UI.toast("Entry deleted", "success");
    },

    escapeHtml(str) {
      const div = document.createElement("div");
      div.textContent = str || "";
      return div.innerHTML;
    },
  };

  // ===== Command Palette =====
  const CommandPalette = {
    commands: [
      {
        id: "new-entry",
        label: "New Entry",
        icon: '<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>',
        shortcut: "N",
        action: () => EntryUI.openNew(),
      },
      {
        id: "lock",
        label: "Lock Vault",
        icon: '<path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="currentColor"/>',
        shortcut: "⌘L",
        action: () => lock(),
      },
      {
        id: "generator",
        label: "Open Generator",
        icon: '<path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>',
        shortcut: "2",
        action: () => Nav.switchTo("generator"),
      },
      {
        id: "audit",
        label: "Run Security Audit",
        icon: '<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="currentColor"/>',
        shortcut: "3",
        action: () => {
          Nav.switchTo("audit");
          AuditUI.refresh();
        },
      },
      {
        id: "export",
        label: "Export Vault",
        icon: '<path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z" fill="currentColor"/>',
        action: () => exportVault(),
      },
      {
        id: "settings",
        label: "Open Settings",
        icon: '<path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="currentColor"/>',
        shortcut: "4",
        action: () => Nav.switchTo("settings"),
      },
      {
        id: "shortcuts",
        label: "Keyboard Shortcuts",
        icon: '<path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z" fill="currentColor"/>',
        action: () => UI.openModal("shortcuts-modal"),
      },
    ],
    selectedIndex: 0,

    open() {
      UI.show("#cmd-palette");
      UI.$("#cmd-input").value = "";
      UI.$("#cmd-input").focus();
      this.selectedIndex = 0;
      this.render();
    },

    close() {
      UI.hide("#cmd-palette");
    },

    render(filter = "") {
      const filtered = filter
        ? [
            ...this.commands.filter((c) =>
              c.label.toLowerCase().includes(filter.toLowerCase()),
            ),
            ...entries
              .filter((e) =>
                e.name.toLowerCase().includes(filter.toLowerCase()),
              )
              .map((e) => ({
                id: `entry-${e.id}`,
                label: e.name,
                icon:
                  ENTRY_TEMPLATES[e.type]?.icon || ENTRY_TEMPLATES.login.icon,
                action: () => {
                  Nav.switchTo("vault");
                  EntryUI.select(e.id);
                },
              })),
          ]
        : this.commands;

      if (filtered.length === 0) {
        UI.$("#cmd-results").innerHTML =
          '<div class="cmd-empty">No results found</div>';
        return;
      }

      UI.$("#cmd-results").innerHTML = `
        <div class="cmd-group">
          ${filter && entries.some((e) => e.name.toLowerCase().includes(filter.toLowerCase())) ? '<div class="cmd-group-title">Entries</div>' : ""}
          ${filtered
            .filter((c) => c.id.startsWith("entry-"))
            .map(
              (c, i) => `
            <div class="cmd-item ${this.selectedIndex === i ? "selected" : ""}" data-index="${i}">
              <svg viewBox="0 0 24 24">${c.icon}</svg>
              <span>${c.label}</span>
            </div>
          `,
            )
            .join("")}
          ${filtered.some((c) => !c.id.startsWith("entry-")) ? '<div class="cmd-group-title">Commands</div>' : ""}
          ${filtered
            .filter((c) => !c.id.startsWith("entry-"))
            .map((c, i) => {
              const idx =
                filtered.filter((x) => x.id.startsWith("entry-")).length + i;
              return `
              <div class="cmd-item ${this.selectedIndex === idx ? "selected" : ""}" data-index="${idx}">
                <svg viewBox="0 0 24 24">${c.icon}</svg>
                <span>${c.label}</span>
                ${c.shortcut ? `<kbd>${c.shortcut}</kbd>` : ""}
              </div>
            `;
            })
            .join("")}
        </div>
      `;

      UI.$$("#cmd-results .cmd-item").forEach((el) => {
        el.addEventListener("click", () => {
          const idx = parseInt(el.dataset.index);
          this.execute(filtered[idx]);
        });
      });
    },

    navigate(dir) {
      const items = UI.$$("#cmd-results .cmd-item");
      this.selectedIndex = Math.max(
        0,
        Math.min(items.length - 1, this.selectedIndex + dir),
      );
      items.forEach((el, i) =>
        el.classList.toggle("selected", i === this.selectedIndex),
      );
      items[this.selectedIndex]?.scrollIntoView({ block: "nearest" });
    },

    execute(cmd) {
      if (cmd?.action) {
        this.close();
        cmd.action();
      }
    },

    executeSelected() {
      const filter = UI.$("#cmd-input").value;
      const filtered = filter
        ? [
            ...this.commands.filter((c) =>
              c.label.toLowerCase().includes(filter.toLowerCase()),
            ),
            ...entries
              .filter((e) =>
                e.name.toLowerCase().includes(filter.toLowerCase()),
              )
              .map((e) => ({
                id: `entry-${e.id}`,
                label: e.name,
                action: () => {
                  Nav.switchTo("vault");
                  EntryUI.select(e.id);
                },
              })),
          ]
        : this.commands;
      if (filtered[this.selectedIndex]) {
        this.execute(filtered[this.selectedIndex]);
      }
    },
  };

  // ===== Screens =====
  function showScreen(screen) {
    UI.hide("#vault-select");
    UI.hide("#unlock-screen");
    UI.hide("#main-app");
    UI.show(`#${screen}`);
  }

  async function renderVaultList() {
    const vaults = await Storage.getVaults();
    const list = UI.$("#vault-list");

    if (vaults.length === 0) {
      list.innerHTML =
        '<p style="text-align:center;color:var(--text-tertiary);padding:20px;">No vaults yet. Create one to get started.</p>';
      return;
    }

    list.innerHTML = vaults
      .map(
        (v) => `
      <button class="vault-card" data-id="${v.id}">
        <div class="v-icon"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="currentColor"/></svg></div>
        <div class="v-info"><div class="v-name">${v.name}</div><div class="v-meta">${v.entryCount || 0} entries • Updated ${UI.formatDate(v.modified)}</div></div>
        <div class="v-arrow"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/></svg></div>
      </button>
    `,
      )
      .join("");

    list.querySelectorAll(".vault-card").forEach((card) => {
      card.addEventListener("click", () => {
        currentVaultId = card.dataset.id;
        const vault = vaults.find((v) => v.id === currentVaultId);
        UI.$("#unlock-name").textContent = vault?.name || "Vault";
        showScreen("unlock-screen");
        UI.$("#master-password").focus();
      });
    });
  }

  async function unlock() {
    const password = UI.$("#master-password").value;
    if (!password) {
      UI.$("#unlock-error").textContent = "Password required";
      UI.show("#unlock-error");
      return;
    }

    UI.hide("#unlock-error");
    UI.$(".unlock-loader").hidden = false;
    UI.$("#btn-unlock").disabled = true;

    try {
      const { vault, key, data } = await Vault.unlock(currentVaultId, password);
      currentVaultKey = key;
      currentVault = vault;
      entries = data.entries || [];
      UI.$("#vault-title").textContent = vault.name;
      UI.$("#master-password").value = "";
      showScreen("main-app");
      Nav.switchTo("vault");
      EntryUI.render();
      checkBackupReminder();
      resetInactivityTimer();
      UI.announce("Vault unlocked");
    } catch (e) {
      UI.$("#unlock-error").textContent = e.message || "Failed to unlock";
      UI.show("#unlock-error");
    } finally {
      UI.$(".unlock-loader").hidden = true;
      UI.$("#btn-unlock").disabled = false;
    }
  }

  function lock() {
    Vault.lock();
    showScreen("vault-select");
    renderVaultList();
    UI.announce("Vault locked");
  }

  async function createVault() {
    const name = UI.$("#vault-name").value.trim();
    const password = UI.$("#vault-pw").value;
    const confirm = UI.$("#vault-confirm").value;

    if (!name) {
      UI.$("#vault-error").textContent = "Name required";
      UI.show("#vault-error");
      return;
    }
    if (password.length < 8) {
      UI.$("#vault-error").textContent =
        "Password must be at least 8 characters";
      UI.show("#vault-error");
      return;
    }
    if (password !== confirm) {
      UI.$("#vault-error").textContent = "Passwords do not match";
      UI.show("#vault-error");
      return;
    }

    try {
      const { id, key, data } = await Vault.create(name, password);
      currentVaultId = id;
      currentVaultKey = key;
      currentVault = { name, tags: [] };
      entries = data.entries;
      UI.$("#vault-title").textContent = name;
      UI.closeModal("vault-modal");
      showScreen("main-app");
      Nav.switchTo("vault");
      EntryUI.render();
      UI.toast("Vault created", "success");
    } catch (e) {
      UI.$("#vault-error").textContent = e.message || "Failed to create vault";
      UI.show("#vault-error");
    }
  }

  // ===== Export/Import =====
  async function exportVault() {
    if (!currentVaultId) return;
    const vault = await Storage.getVault(currentVaultId);
    const data = JSON.stringify(vault, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `keysmith-${vault.name.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    settings.lastBackup = Date.now();
    await Storage.saveSettings();
    UI.hide("#backup-banner");
    UI.toast("Vault exported", "success");
  }

  function importVault() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const vault = JSON.parse(text);
        if (!vault.id || !vault.encrypted || !vault.salt) {
          throw new Error("Invalid vault file");
        }
        vault.id = Crypto.generateId(); // New ID to avoid conflicts
        await Storage.saveVault(vault);
        await renderVaultList();
        UI.toast("Vault imported", "success");
      } catch (e) {
        UI.toast("Failed to import: " + e.message, "error");
      }
    };
    input.click();
  }

  // ===== Emergency Kit =====
  function generateEmergencyKit() {
    const hint = UI.$("#emergency-hint").value;
    const vault = currentVault;

    const html = `
      <!DOCTYPE html>
      <html>
      <head><title>Keysmith Emergency Kit</title>
      <style>
        body{font-family:Georgia,serif;max-width:600px;margin:40px auto;padding:20px;line-height:1.6}
        h1{border-bottom:2px solid #333;padding-bottom:10px}
        h2{margin-top:30px;border-bottom:1px solid #ccc;padding-bottom:5px}
        .hint-box{border:2px dashed #666;padding:20px;margin:20px 0;text-align:center}
        .warning{background:#fff3cd;padding:15px;border-radius:5px;margin:20px 0}
        footer{margin-top:40px;font-size:0.9em;color:#666;border-top:1px solid #ccc;padding-top:10px}
      </style>
      </head>
      <body>
        <h1>🔐 Keysmith Emergency Kit</h1>
        <p><strong>Vault:</strong> ${vault?.name || "Unknown"}</p>
        <p><strong>Created:</strong> ${new Date().toLocaleDateString()}</p>

        <div class="warning">
          <strong>⚠️ Keep this document secure!</strong><br>
          Store in a safe place. This contains sensitive recovery information.
        </div>

        <h2>Password Hint</h2>
        <div class="hint-box">
          ${hint || "(No hint provided)"}
        </div>

        <h2>Recovery Steps</h2>
        <ol>
          <li>Open Keysmith Vault in your browser</li>
          <li>Click "Import Vault"</li>
          <li>Select your backup file (.json)</li>
          <li>Enter your master password</li>
        </ol>

        <h2>Important Notes</h2>
        <ul>
          <li>Your master password cannot be recovered</li>
          <li>Keep backup files in multiple locations</li>
          <li>Export a new backup after major changes</li>
        </ul>

        <footer>
          Generated by Keysmith Vault v${VERSION}<br>
          This document does not contain your passwords.
        </footer>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "keysmith-emergency-kit.html";
    a.click();
    URL.revokeObjectURL(url);
    UI.closeModal("emergency-modal");
    UI.toast("Emergency kit generated", "success");
  }

  // ===== Backup Reminder =====
  function checkBackupReminder() {
    if (!settings.lastBackup) {
      UI.show("#backup-banner");
      return;
    }
    const daysSinceBackup =
      (Date.now() - settings.lastBackup) / (1000 * 60 * 60 * 24);
    if (daysSinceBackup > BACKUP_REMINDER_DAYS) {
      UI.show("#backup-banner");
    }
  }

  // ===== Inactivity Timer =====
  function resetInactivityTimer() {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (settings.inactivityTimeout > 0 && currentVaultKey) {
      inactivityTimer = setTimeout(() => {
        lock();
        UI.toast("Locked due to inactivity", "info");
      }, settings.inactivityTimeout * 1000);
    }
  }

  // ===== Settings =====
  function applySettings() {
    document.body.dataset.theme = settings.theme;
    document.body.dataset.accent = settings.accent;
    UI.$("#set-theme").value = settings.theme;
    UI.$$(".color-opt").forEach((el) => {
      el.classList.toggle("active", el.dataset.color === settings.accent);
    });
    UI.$("#set-lock-blur").checked = settings.lockOnBlur;
    UI.$("#set-inactivity").value = settings.inactivityTimeout;
    UI.$("#set-clipboard").checked = settings.clearClipboard;
    UI.$("#audit-entropy").value = settings.auditEntropy;
    UI.$("#audit-age").value = settings.auditAge;
    UI.$("#audit-words").value = settings.auditWords;
  }

  // ===== Event Bindings =====
  function bindEvents() {
    // Unlock form
    UI.$("#unlock-form").addEventListener("submit", (e) => {
      e.preventDefault();
      unlock();
    });

    // Password visibility toggle
    UI.$$(".btn-toggle-vis").forEach((btn) => {
      btn.addEventListener("click", () => {
        const input = btn.parentElement.querySelector("input");
        const eyeOpen = btn.querySelector(".eye-open");
        const eyeClosed = btn.querySelector(".eye-closed");
        if (input.type === "password") {
          input.type = "text";
          eyeOpen.hidden = true;
          eyeClosed.hidden = false;
        } else {
          input.type = "password";
          eyeOpen.hidden = false;
          eyeClosed.hidden = true;
        }
      });
    });

    // Back to vaults
    UI.$("#btn-back-vaults").addEventListener("click", () => {
      showScreen("vault-select");
      currentVaultId = null;
    });

    // Lock button
    UI.$("#btn-lock").addEventListener("click", lock);

    // Create vault
    UI.$("#btn-create-vault").addEventListener("click", () => {
      UI.$("#vault-modal-title").textContent = "Create Vault";
      UI.$("#vault-form").reset();
      UI.hide("#vault-error");
      UI.show("#vault-pw-field");
      UI.show("#vault-confirm-field");
      UI.openModal("vault-modal");
    });

    UI.$("#vault-form").addEventListener("submit", (e) => {
      e.preventDefault();
      createVault();
    });

    // Password strength indicator
    UI.$("#vault-pw").addEventListener("input", (e) => {
      const strength = Generator.getStrength(e.target.value);
      const bar = UI.$("#vault-pw-bar");
      const levels = { weak: 0, fair: 1, good: 2, strong: 3 };
      bar.dataset.strength = levels[strength.level] + 1;
    });

    // Import vault
    UI.$("#btn-import-vault").addEventListener("click", importVault);

    // Vault options
    UI.$("#btn-vault-options").addEventListener("click", async () => {
      const vault = await Storage.getVault(currentVaultId);
      if (!vault) return;
      UI.$("#opt-vault-name").value = vault.name;
      UI.$("#opt-created").textContent = UI.formatDate(vault.created);
      UI.$("#opt-count").textContent = vault.entryCount || 0;
      UI.openModal("vault-opts-modal");
    });

    UI.$("#btn-save-opts").addEventListener("click", async () => {
      const name = UI.$("#opt-vault-name").value.trim();
      if (!name) return;
      currentVault.name = name;
      await Vault.save();
      UI.$("#vault-title").textContent = name;
      UI.closeModal("vault-opts-modal");
      UI.toast("Vault updated", "success");
    });

    UI.$("#btn-delete-vault").addEventListener("click", async () => {
      const vault = await Storage.getVault(currentVaultId);
      UI.$("#del-vault-name").textContent = vault?.name;
      UI.$("#del-confirm").value = "";
      UI.$("#btn-del-vault").disabled = true;
      UI.closeModal("vault-opts-modal");
      UI.openModal("delete-vault-modal");
    });

    UI.$("#del-confirm").addEventListener("input", (e) => {
      UI.$("#btn-del-vault").disabled = e.target.value !== "DELETE";
    });

    UI.$("#btn-del-vault").addEventListener("click", async () => {
      await Storage.deleteVault(currentVaultId);
      Vault.lock();
      UI.closeModal("delete-vault-modal");
      showScreen("vault-select");
      await renderVaultList();
      UI.toast("Vault deleted", "success");
    });

    // Add entry
    UI.$("#btn-add-entry").addEventListener("click", () => EntryUI.openNew());
    UI.$("#btn-empty-add")?.addEventListener("click", () => EntryUI.openNew());

    // Entry type change
    UI.$("#entry-type").addEventListener("change", (e) => {
      EntryUI.renderFields(e.target.value);
    });

    // Entry form
    UI.$("#entry-form").addEventListener("submit", (e) => {
      e.preventDefault();
      EntryUI.save();
    });

    // Tags input
    UI.$("#entry-tags-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        const value = e.target.value.trim().replace(/,/g, "");
        if (value) {
          const tags = EntryUI.getCurrentTags();
          if (!tags.includes(value)) {
            EntryUI.renderTagsInput([...tags, value]);
          }
          e.target.value = "";
        }
      }
    });

    // Add custom field
    UI.$("#btn-add-field").addEventListener("click", () => {
      const container = UI.$("#custom-fields");
      const idx = container.children.length;
      const div = document.createElement("div");
      div.className = "custom-field";
      div.dataset.index = idx;
      div.innerHTML = `
        <input type="text" class="text-input" placeholder="Label">
        <input type="text" class="text-input" placeholder="Value">
        <button type="button" class="btn-icon" data-remove="${idx}"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/></svg></button>
      `;
      container.appendChild(div);
      div
        .querySelector("[data-remove]")
        .addEventListener("click", () => div.remove());
    });

    // Delete entry
    UI.$("#btn-delete-entry").addEventListener("click", () => EntryUI.delete());
    UI.$("#btn-del-entry").addEventListener("click", () =>
      EntryUI.confirmDelete(),
    );

    // Generator modal
    UI.$("#btn-use-gen").addEventListener("click", () => {
      const pw = GeneratorUI.getPassword();
      const input = UI.$("#entry-password");
      if (input) input.value = pw;
      UI.closeModal("gen-modal");
    });

    // Search
    UI.$("#search-input").addEventListener("input", () => EntryUI.render());

    // Filters
    UI.$("#btn-filter-fav").addEventListener("click", () => {
      activeFilters.favorites = !activeFilters.favorites;
      UI.$("#btn-filter-fav").classList.toggle(
        "active",
        activeFilters.favorites,
      );
      EntryUI.render();
      updateActiveFilters();
    });

    UI.$("#btn-filter-tags").addEventListener("click", () => {
      const allTags = new Set();
      entries.forEach((e) => (e.tags || []).forEach((t) => allTags.add(t)));
      const container = UI.$("#all-tags");
      container.innerHTML =
        Array.from(allTags)
          .map(
            (t) => `
        <button class="tag-filter ${activeFilters.tags.includes(t) ? "active" : ""}" data-tag="${t}">${t}</button>
      `,
          )
          .join("") || '<p style="color:var(--text-tertiary)">No tags yet</p>';
      container.querySelectorAll(".tag-filter").forEach((btn) => {
        btn.addEventListener("click", () => {
          const tag = btn.dataset.tag;
          if (activeFilters.tags.includes(tag)) {
            activeFilters.tags = activeFilters.tags.filter((t) => t !== tag);
          } else {
            activeFilters.tags.push(tag);
          }
          btn.classList.toggle("active");
        });
      });
      UI.openModal("tags-modal");
    });

    UI.$("#btn-clear-tags").addEventListener("click", () => {
      activeFilters.tags = [];
      UI.closeModal("tags-modal");
      EntryUI.render();
      updateActiveFilters();
    });

    // Close tags modal applies filter
    UI.$("#tags-modal .modal-close, #tags-modal .btn-primary").forEach?.(
      (el) => {
        el?.addEventListener?.("click", () => {
          EntryUI.render();
          updateActiveFilters();
        });
      },
    );

    // Command palette
    UI.$("#btn-cmd").addEventListener("click", () => CommandPalette.open());

    UI.$("#cmd-input").addEventListener("input", (e) => {
      CommandPalette.selectedIndex = 0;
      CommandPalette.render(e.target.value);
    });

    UI.$("#cmd-input").addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        CommandPalette.navigate(1);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        CommandPalette.navigate(-1);
      }
      if (e.key === "Enter") {
        e.preventDefault();
        CommandPalette.executeSelected();
      }
      if (e.key === "Escape") {
        CommandPalette.close();
      }
    });

    // Settings
    UI.$("#set-theme").addEventListener("change", async (e) => {
      settings.theme = e.target.value;
      document.body.dataset.theme = settings.theme;
      await Storage.saveSettings();
    });

    UI.$$(".color-opt").forEach((btn) => {
      btn.addEventListener("click", async () => {
        settings.accent = btn.dataset.color;
        document.body.dataset.accent = settings.accent;
        UI.$$(".color-opt").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        await Storage.saveSettings();
      });
    });

    UI.$("#set-lock-blur").addEventListener("change", async (e) => {
      settings.lockOnBlur = e.target.checked;
      await Storage.saveSettings();
    });

    UI.$("#set-inactivity").addEventListener("change", async (e) => {
      settings.inactivityTimeout = parseInt(e.target.value);
      await Storage.saveSettings();
      resetInactivityTimer();
    });

    UI.$("#set-clipboard").addEventListener("change", async (e) => {
      settings.clearClipboard = e.target.checked;
      await Storage.saveSettings();
    });

    UI.$("#btn-export").addEventListener("click", exportVault);
    UI.$("#btn-export-now").addEventListener("click", exportVault);
    UI.$("#btn-dismiss-banner").addEventListener("click", () =>
      UI.hide("#backup-banner"),
    );

    UI.$("#btn-emergency").addEventListener("click", () =>
      UI.openModal("emergency-modal"),
    );
    UI.$("#btn-gen-kit").addEventListener("click", generateEmergencyKit);

    UI.$("#btn-shortcuts").addEventListener("click", () =>
      UI.openModal("shortcuts-modal"),
    );
    UI.$("#btn-about").addEventListener("click", () =>
      UI.openModal("about-modal"),
    );
    UI.$("#btn-about-main").addEventListener("click", () =>
      UI.openModal("about-modal"),
    );

    // Audit
    UI.$("#btn-run-audit").addEventListener("click", () => AuditUI.refresh());
    UI.$("#btn-audit-settings").addEventListener("click", () =>
      UI.openModal("audit-modal"),
    );
    UI.$("#btn-save-audit").addEventListener("click", async () => {
      settings.auditEntropy = parseInt(UI.$("#audit-entropy").value) || 50;
      settings.auditAge = parseInt(UI.$("#audit-age").value) || 365;
      settings.auditWords = parseInt(UI.$("#audit-words").value) || 4;
      await Storage.saveSettings();
      UI.closeModal("audit-modal");
      AuditUI.refresh();
    });

    // Modal close buttons
    UI.$$(".modal-close, .modal-cancel").forEach((btn) => {
      btn.addEventListener("click", () => {
        const modal = btn.closest(".modal-backdrop");
        if (modal) UI.hide(modal);
        document.body.style.overflow = "";
        if (totpInterval) {
          clearInterval(totpInterval);
          totpInterval = null;
        }
      });
    });

    // Close modal on backdrop click
    UI.$$(".modal-backdrop").forEach((backdrop) => {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) {
          UI.hide(backdrop);
          document.body.style.overflow = "";
        }
      });
    });

    UI.$("#cmd-palette")?.addEventListener("click", (e) => {
      if (e.target.id === "cmd-palette") CommandPalette.close();
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      // Don't trigger if typing in input
      const isInput = ["INPUT", "TEXTAREA", "SELECT"].includes(
        document.activeElement?.tagName,
      );

      // Command palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (currentVaultKey) CommandPalette.open();
      }

      // Lock
      if ((e.metaKey || e.ctrlKey) && e.key === "l" && currentVaultKey) {
        e.preventDefault();
        lock();
      }

      // Escape closes modals
      if (e.key === "Escape") {
        UI.closeAllModals();
        CommandPalette.close();
      }

      // Only if unlocked and not in input
      if (!currentVaultKey || isInput) return;

      // Quick nav with number keys
      if (e.key === "1") Nav.switchTo("vault");
      if (e.key === "2") Nav.switchTo("generator");
      if (e.key === "3") Nav.switchTo("audit");
      if (e.key === "4") Nav.switchTo("settings");

      // Search focus
      if (e.key === "/" && Nav.currentView === "vault") {
        e.preventDefault();
        UI.$("#search-input")?.focus();
      }

      // New entry
      if (e.key === "n" && Nav.currentView === "vault") {
        e.preventDefault();
        EntryUI.openNew();
      }

      // Edit selected entry
      if (e.key === "e" && selectedEntryId && Nav.currentView === "vault") {
        e.preventDefault();
        EntryUI.openEdit(selectedEntryId);
      }
    });

    // Reset inactivity on activity
    ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach(
      (event) => {
        document.addEventListener(event, resetInactivityTimer, {
          passive: true,
        });
      },
    );

    // Lock on blur if enabled
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && settings.lockOnBlur && currentVaultKey) {
        lock();
      }
    });

    // Onboarding
    UI.$("#btn-skip-onboarding").addEventListener("click", async () => {
      settings.onboardingComplete = true;
      await Storage.saveSettings();
      UI.hide("#onboarding");
    });

    UI.$("#btn-next-onboarding").addEventListener("click", async () => {
      const active = UI.$(".onboarding-step.active");
      const step = parseInt(active.dataset.step);
      if (step < 3) {
        active.classList.remove("active");
        UI.$(`.onboarding-step[data-step="${step + 1}"]`).classList.add(
          "active",
        );
        UI.$$(".onboarding-dots .dot").forEach((d, i) =>
          d.classList.toggle("active", i === step),
        );
        if (step + 1 === 3)
          UI.$("#btn-next-onboarding").textContent = "Get Started";
      } else {
        settings.onboardingComplete = true;
        await Storage.saveSettings();
        UI.hide("#onboarding");
      }
    });

    UI.$$(".onboarding-dots .dot").forEach((dot) => {
      dot.addEventListener("click", () => {
        const step = parseInt(dot.dataset.step);
        UI.$$(".onboarding-step").forEach((s) => s.classList.remove("active"));
        UI.$(`.onboarding-step[data-step="${step}"]`).classList.add("active");
        UI.$$(".onboarding-dots .dot").forEach((d, i) =>
          d.classList.toggle("active", i === step - 1),
        );
        UI.$("#btn-next-onboarding").textContent =
          step === 3 ? "Get Started" : "Next";
      });
    });

    // PWA install prompt
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      if (!settings.installDismissed) {
        UI.show("#install-prompt");
      }
    });

    UI.$("#btn-install")?.addEventListener("click", async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const result = await deferredInstallPrompt.userChoice;
        if (result.outcome === "accepted") {
          UI.hide("#install-prompt");
        }
        deferredInstallPrompt = null;
      }
    });

    UI.$("#btn-dismiss-install")?.addEventListener("click", async () => {
      settings.installDismissed = true;
      await Storage.saveSettings();
      UI.hide("#install-prompt");
    });
  }

  function updateActiveFilters() {
    const container = UI.$("#active-filters");
    const filters = [];
    if (activeFilters.favorites)
      filters.push({ type: "fav", label: "Favorites" });
    activeFilters.tags.forEach((t) => filters.push({ type: "tag", label: t }));

    if (filters.length === 0) {
      UI.hide(container);
      return;
    }

    UI.show(container);
    container.innerHTML = filters
      .map(
        (f) => `
      <span class="filter-tag">${f.label}<button data-type="${f.type}" data-label="${f.label}"><svg viewBox="0 0 24 24" width="12" height="12"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/></svg></button></span>
    `,
      )
      .join("");

    container.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.type === "fav") {
          activeFilters.favorites = false;
          UI.$("#btn-filter-fav").classList.remove("active");
        } else {
          activeFilters.tags = activeFilters.tags.filter(
            (t) => t !== btn.dataset.label,
          );
        }
        EntryUI.render();
        updateActiveFilters();
      });
    });
  }

  // ===== Initialize =====
  async function init() {
    await Storage.init();
    await Storage.loadSettings();
    applySettings();
    Nav.init();
    bindEvents();

    // Show onboarding if first time
    if (!settings.onboardingComplete) {
      UI.show("#onboarding");
    }

    await renderVaultList();
    showScreen("vault-select");

    // Register service worker
    if ("serviceWorker" in navigator) {
      try {
        await navigator.serviceWorker.register("sw.js");
      } catch (e) {
        console.warn("SW registration failed:", e);
      }
    }
  }

  // Start
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
