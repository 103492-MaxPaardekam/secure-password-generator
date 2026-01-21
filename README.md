# Keysmith Vault

**Secure Local-First Password Manager**

A privacy-first, offline password manager with a premium Apple-like interface. Zero-knowledge encryption, no tracking, no network requests—your passwords stay on your device, encrypted with military-grade AES-256-GCM.

## Features

### 🔐 Security First

- **PBKDF2 + AES-256-GCM** — Industry-standard encryption with 600,000 iterations
- **Web Crypto API** — All randomness from `crypto.getRandomValues()`, not `Math.random()`
- **Zero-Knowledge** — Your master password never stored; decryption happens client-side
- **No Network** — Works completely offline; no data ever leaves your device
- **CSP Ready** — Strict Content Security Policy compatible (no inline scripts)
- **Local Breach Check** — Embedded common password list for offline security audits

### 🗄️ Multi-Vault Support

- Create multiple vaults for work, personal, family
- Each vault independently encrypted with its own master password
- IndexedDB storage with automatic migration support

### 📋 Entry Templates

- **Login** — Username, password, URL, TOTP secret, notes
- **Secure Note** — Encrypted text notes
- **Wi-Fi** — Network name, password, security type
- **Identity** — Name, email, phone, address
- **Payment Card** — Card number, expiry, CVV, PIN

### 🔑 Password Generator

- Configurable length (8–64 characters)
- Character type toggles: uppercase, lowercase, digits, symbols
- Passphrase mode with 3–10 words
- Multiple separators: hyphen, underscore, dot, space
- Real-time entropy calculation

### 🛡️ Security Audit

- **Weak passwords** — Below configurable entropy threshold
- **Reused passwords** — Same password across entries
- **Old passwords** — Exceed configurable age limit
- **Common passwords** — Match known breached passwords

### ⏱️ TOTP (2FA) Generator

- RFC 6238 compliant implementation
- Base32 secret decoding
- Live 6-digit code generation with countdown timer
- Copy codes with one click

### 📦 Import/Export

- Export encrypted vault backups (JSON)
- Import from backup files
- Emergency Kit generator (printable recovery info)
- Backup reminders after 30 days

### ⌨️ Power User Features

- **Command Palette** (⌘K) — Quick access to all commands
- **Keyboard Shortcuts** — Navigate with 1-4, search with /, new with N
- **Favorites & Tags** — Organize and filter entries
- **Password History** — Track up to 10 previous passwords per entry
- **Custom Fields** — Add arbitrary label/value pairs

### ✨ Premium Design

- Apple-like interface with smooth animations
- Light/Dark/System theme with 6 accent colors
- Two-pane layout on desktop, mobile-optimized
- Respects `prefers-reduced-motion` for accessibility
- PWA installable for native-like experience

### 🔒 Session Safety

- Lock on tab blur (optional)
- Inactivity auto-lock (1/5/15 minutes)
- Clipboard auto-clear after 30 seconds

## Quick Start

1. **Clone or download** this repository
2. **Open** `index.html` in any modern browser
3. **Generate** secure passwords instantly

```bash
# Clone the repository
git clone https://github.com/yourusername/keysmith.git

# Open in browser (macOS)
open keysmith/index.html

# Or serve locally
npx serve keysmith
```

## File Structure

```
keysmith/
├── index.html      # Main HTML structure
├── styles.css      # Styles with motion tokens
├── script.js       # Password generation & UI logic
└── README.md       # This file
```

## Browser Support

| Browser | Version |
| ------- | ------- |
| Chrome  | 60+     |
| Firefox | 55+     |
| Safari  | 11+     |
| Edge    | 79+     |

Requires support for:

- Web Crypto API (`crypto.getRandomValues`)
- CSS Custom Properties
- ES6+ JavaScript

## Security Details

### Entropy Calculation

**Passwords:**

```
Entropy = Length × log₂(CharsetSize)
```

**Passphrases:**

```
Entropy = WordCount × log₂(WordListSize) + OptionalAdditions
```

### Strength Thresholds

| Entropy     | Rating      | Use Case                      |
| ----------- | ----------- | ----------------------------- |
| < 50 bits   | Weak        | Avoid for any account         |
| 50–80 bits  | Okay        | Low-value accounts            |
| 80–110 bits | Strong      | Most accounts                 |
| > 110 bits  | Very Strong | High-value/sensitive accounts |

### Why Web Crypto?

`Math.random()` is a pseudo-random number generator (PRNG) that's predictable given the seed. `crypto.getRandomValues()` uses the operating system's cryptographic random number generator (CSPRNG), which is suitable for security-sensitive applications.

## Accessibility

- Full keyboard navigation
- ARIA labels and live regions for screen readers
- Focus indicators on all interactive elements
- Respects `prefers-reduced-motion: reduce`
- Color-independent state indicators
- Touch-friendly targets (44px minimum)

## Customization

### Motion Tokens

Edit the CSS variables in `styles.css` to adjust animation timing:

```css
:root {
  --dur-1: 120ms; /* Quick micro-interactions */
  --dur-2: 180ms; /* Standard interactions */
  --dur-3: 280ms; /* Panel transitions */
  --dur-4: 400ms; /* Complex animations */

  --ease-out: cubic-bezier(0.2, 0.8, 0.2, 1);
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.1);
}
```

### Word List

The passphrase word list in `script.js` can be replaced with alternatives like:

- [EFF Diceware Word List](https://www.eff.org/dice) (7,776 words)
- [BIP39 Word List](https://github.com/bitcoin/bips/blob/master/bip-0039/english.txt) (2,048 words)

## Content Security Policy

When deploying to a web server, enable the CSP meta tag in `index.html`:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"
/>
```

## Keyboard Shortcuts

| Shortcut           | Action                |
| ------------------ | --------------------- |
| `Cmd/Ctrl + Enter` | Generate new password |
| `Tab`              | Navigate controls     |
| `Space/Enter`      | Activate buttons      |
| `Click output`     | Copy to clipboard     |

## Contributing

Contributions are welcome! Please ensure:

- No external dependencies
- Maintain three-file structure
- Preserve accessibility features
- Test with reduced motion enabled
- Verify CSP compatibility

---

**Remember:** The strongest password is useless if reused. Use a password manager and never reuse passwords across accounts.
