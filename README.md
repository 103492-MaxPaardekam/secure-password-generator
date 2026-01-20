# Keysmith

**Secure Password & Passphrase Generator**

A privacy-first, offline password generator with a premium Apple-like interface. No tracking, no network requests, no storage—just cryptographically secure passwords generated entirely in your browser.

## Features

### 🔐 Security First

- **Web Crypto API** — All randomness comes from `crypto.getRandomValues()`, not `Math.random()`
- **Unbiased Sampling** — Rejection sampling eliminates modulo bias for uniform distribution
- **No Network** — Works completely offline; no data ever leaves your device
- **No Storage** — Nothing saved to localStorage, cookies, or any persistent storage
- **CSP Ready** — Strict Content Security Policy compatible (no inline scripts)

### 🔑 Password Mode

- Configurable length (8–128 characters)
- Character type toggles: lowercase, uppercase, digits, symbols
- Custom symbol set support
- Option to avoid ambiguous characters (O/0, I/l/1, etc.)

### 📝 Passphrase Mode

- 3–10 word passphrases from a curated 1,500+ word list
- Multiple separators: hyphen, space, underscore, dot, or custom
- Capitalization options: lowercase, Title Case, rAnDoM cAsE
- Optional number and symbol suffixes

### 📊 Strength Meter

- Real-time entropy calculation in bits
- Visual strength indicator (Weak → Very Strong)
- Educational breakdown of what entropy means

### ✨ Premium Micro-Interactions

- Apple-like animation system with consistent motion tokens
- Smooth transitions for all state changes
- Tactile button press and tap feedback
- Toast notifications for copy confirmation
- Sheen effect on successful copy
- Animated panel transitions between modes
- Spring-physics toggle switches
- Respects `prefers-reduced-motion` for accessibility

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

## License

MIT License — feel free to use, modify, and distribute.

---

**Remember:** The strongest password is useless if reused. Use a password manager and never reuse passwords across accounts.
