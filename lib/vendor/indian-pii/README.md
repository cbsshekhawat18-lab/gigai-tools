# Vendored: indian-pii v0.1.1

Source: https://github.com/cbsshekhawat18-lab/indian-pii
Commit: 2b598f304613614e19ec2872524a5970303861d9
License: MIT (Chandrabhan Shekhawat / Gigai Kripa Services - same owner as this site)

Detects, validates and masks 18 Indian identifier types (Aadhaar with Verhoeff,
PAN, GSTIN with mod-36, UPI, IFSC, voter ID, ...) with context gating and
confidence scores. Zero dependencies, browser-safe, ReDoS-safe patterns.

Vendored as built ESM because the package is not on npm and its GitHub tarball
ships without dist/. To update: clone the repo, `npm install --include=dev &&
npm run build`, copy dist/index.js + chunk + the two .d.ts files here, and
bump the commit hash above. Evaluated 2026-09-03: its own suite 83/83; checksum
validation verified against valid and invalid Aadhaar samples.
