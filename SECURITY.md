# Security Policy

## Supported Versions

<<<<<<< HEAD
| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

I take security seriously. If you discover a security vulnerability in Keysmith, please report it responsibly.

### How to Report

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please report security issues by emailing directly or using GitHub's private vulnerability reporting feature:

1. Go to the **Security** tab of this repository
2. Click **"Report a vulnerability"**
3. Provide a detailed description of the vulnerability

### What to Include

When reporting a vulnerability, please include:

- **Description**: A clear description of the vulnerability
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Impact**: What an attacker could achieve by exploiting this vulnerability
- **Affected Components**: Which files or features are affected
- **Suggested Fix**: If you have one (optional)

### Response Timeline

- **Acknowledgment**: Within 48 hours of receiving your report
- **Initial Assessment**: Within 7 days
- **Resolution**: Depends on severity and complexity

### Severity Levels

| Severity | Description                                       | Target Resolution |
| -------- | ------------------------------------------------- | ----------------- |
| Critical | Direct compromise of password generation security | 24-48 hours       |
| High     | Significant security weakness                     | 7 days            |
| Medium   | Limited security impact                           | 30 days           |
| Low      | Minimal security impact                           | 90 days           |

## Security Design Principles

Keysmith is built with the following security principles:

### Cryptographic Security

- Uses Web Crypto API (`crypto.getRandomValues()`) exclusively
- Implements rejection sampling to eliminate modulo bias
- No use of `Math.random()` or other insecure PRNGs

### Privacy by Design

- **No network requests**: Works entirely offline
- **No storage**: Nothing saved to localStorage, cookies, or IndexedDB
- **No tracking**: No analytics, telemetry, or external resources
- **No dependencies**: Zero third-party libraries

### Content Security Policy

- Compatible with strict CSP headers
- No inline scripts or styles
- No eval() or similar dynamic code execution

## Out of Scope

The following are NOT considered security vulnerabilities:

- Browser-level vulnerabilities (report to browser vendor)
- Physical access attacks (e.g., shoulder surfing)
- Social engineering attacks
- Clipboard access by other applications (OS-level concern)
- Denial of service via resource exhaustion in the browser

## Acknowledgments

Security researchers who responsibly disclose vulnerabilities will be acknowledged here (with permission).

---

Thank you for helping keep Keysmith secure.
=======
Use this section to tell people about which versions of your project are
currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 5.1.x   | :white_check_mark: |
| 5.0.x   | :x:                |
| 4.0.x   | :white_check_mark: |
| < 4.0   | :x:                |

## Reporting a Vulnerability

Use this section to tell people how to report a vulnerability.

Tell them where to go, how often they can expect to get an update on a
reported vulnerability, what to expect if the vulnerability is accepted or
declined, etc.
>>>>>>> 5d0a9916d2165d1da2b984a77e3c6ef43cc13fdc
