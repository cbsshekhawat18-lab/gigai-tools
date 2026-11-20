---
title: "How to Create a Wi-Fi QR Code: Share Your Network With a Scan"
description: "Make a Wi-Fi QR code so guests join your network by scanning. No typing passwords. How it works, the SSID/security fields, encoding gotchas, and print tips."
date: "2026-07-25"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
tool: "wifi-qr-code-generator"
category: "qr-tools"
tags: ["wifi", "qr codes", "networking", "how-to"]
featured: true
---

Reading a Wi-Fi password aloud, letter by letter, capital-S-lowercase-t-the-number-3, is one of modern life's small miseries: especially when the password is a random string on the back of a router. A Wi-Fi QR code fixes it completely. Guests point their camera at a little square, tap a prompt, and they're connected. No typing, no dictation, no "is that a zero or an O?" This guide shows how to make one, how it works, and the small gotchas that trip people up.

## What a Wi-Fi QR code actually contains

A Wi-Fi QR code isn't a link to anything: it's a small, structured block of text that describes your network, encoded directly into the pattern. When a phone scans it, the operating system recognises that specific format and offers to join the network, filling in the details automatically.

The encoded text follows a standard structure that packs three key pieces of information:

- **SSID**: the network name.
- **Security type**, WPA/WPA2/WPA3, WEP, or none (open).
- **Password**: the network key.

Because everything needed to connect is baked right into the code, a Wi-Fi QR code is inherently a **static** code, the details never change until you make a new one. (If you're curious about that distinction, we cover [static vs dynamic codes](/blog/dynamic-vs-static-qr-codes-explained) in full.) Our [Wi-Fi QR code generator](/wifi-qr-code-generator) assembles this text correctly for you, so you never have to format it by hand.

## How to make one, step by step

1. **Open the [Wi-Fi QR code generator](/wifi-qr-code-generator).**
2. **Enter the network name (SSID) exactly** as it appears on your router, capitalisation matters, and a single wrong character means the phone tries to join a network that doesn't exist.
3. **Choose the security type.** For almost all home and office networks this is **WPA/WPA2** (WPA3 is the newer standard. Select it if your router uses it). Only pick "None" if the network is genuinely open with no password.
4. **Type the password** carefully. This is exactly the tedious string you're trying to spare your guests, so get it right once.
5. **Generate and download** the code, then print it or display it.

That's it. The whole point is that you do the careful typing a single time, and everyone after you just scans.

## The gotchas that cause "it won't connect"

Wi-Fi codes fail in a few predictable ways. Knowing them saves a lot of frustration:

- **Hidden networks.** If your SSID is hidden (not broadcast), a plain Wi-Fi QR code may not connect, because the phone can't find a network it can't see. Many generators offer a "hidden network" toggle: enable it if that's your setup, or simply un-hide the network.
- **Special characters in the password.** Passwords containing characters like `;`, `,`, `:`, `\`, or `"` need to be escaped inside the code's text format. A good generator handles this automatically. This is a strong reason to use a proper tool rather than hand-typing the format, where a stray semicolon breaks everything.
- **Wrong security type.** Selecting "WEP" or "None" when your network is actually WPA2 will fail. When unsure, WPA/WPA2 is the safe modern default.
- **Case-sensitive SSID.** "HomeWiFi" and "homewifi" are different networks to a phone. Match your router's spelling exactly.

If you ever want to check what a Wi-Fi code contains before trusting it, you can read its raw text with a [QR code decoder](/qr-code-decoder), handy for verifying a code you didn't make yourself.

## Where a Wi-Fi QR code shines

- **Cafés, restaurants, and shops.** Print it on a table tent or by the counter so customers connect without asking staff.
- **Airbnbs and guest rooms.** A framed card in the room means every guest gets online instantly, no welcome-book flipping.
- **Offices and meeting rooms.** A code by the door gets visitors onto the guest network in seconds.
- **Home.** Stick one inside a cupboard or on the fridge for friends and family. No more reciting the router's cryptic default password.

A nice security bonus: because guests scan rather than see the password typed, you can use a strong, ugly, random password (which you should) without it being any less convenient. The QR code carries the complexity so humans don't have to.

## Printing it so it actually scans

A Wi-Fi code is only useful if people can reliably scan it, so a little care in presentation pays off:

- **Size it for the scan distance.** A code on a table tent scanned from arm's length should be at least a few centimetres across. Follow the [best size for print](/blog/best-qr-code-size-for-print) guidance: roughly 1 cm of code per 10 cm of distance, and never smaller than about 2 cm.
- **Leave a quiet-zone margin.** Keep clear space around the code. Don't crowd it with text or borders.
- **Keep strong contrast.** Dark code on a light background reads best, especially in the dim lighting of a café or bedroom.
- **Add a line of human-readable text.** Print the network name (and, if it's a guest network you don't mind sharing, the password too) beneath the code as a fallback for anyone whose camera won't cooperate.
- **Test before you frame it.** Scan the printed card with a couple of phones to confirm it connects, not just that it "reads."

## A note on security

A Wi-Fi QR code is exactly as sensitive as the password inside it: anyone who scans it can join your network. That's the intended behaviour for a guest network, but think before you post one publicly:

- **Use a separate guest network** if your router supports it, keeping visitors off the same network as your personal devices.
- **Don't post your primary network's code** somewhere strangers can photograph it from the street.
- **Change the password** if a shared code ever ends up somewhere it shouldn't, and generate a fresh code.

## The semicolon that breaks hand-made Wi-Fi codes

A builder's confession: the WIFI format is trivial right up until punctuation shows up. Our [Wi-Fi QR code generator](/wifi-qr-code-generator) writes the standard `WIFI:T:WPA;S:YourNetwork;P:YourPassword;;` string, and because semicolons, commas, colons, quotes and backslashes are all structural in that format, it backslash-escapes each one inside your SSID and password automatically. A password like `caffe;latte:3` encodes correctly instead of silently truncating at the semicolon. Choosing an open network drops the password field entirely rather than emitting an empty one, and the hidden-network toggle appends the `H:true` flag covered above. All of this is plain string assembly happening in your browser tab, so the password never travels anywhere. What the tool cannot do is check your credentials: it encodes exactly what you type, so join the network from the printed code once before you frame it.

## Retire the password recital

A Wi-Fi QR code takes the most annoying part of hospitality (dictating a random password) and replaces it with a single scan. Enter your SSID and password once, pick the right security type (usually WPA/WPA2), let a proper generator handle the special-character encoding, then print it at a sensible size with good contrast and a text fallback. Guests connect in seconds, and you can finally use a password strong enough to be worth having.

Make yours now with the free [Wi-Fi QR code generator](/wifi-qr-code-generator) (no sign-up, no watermark) and never spell out a password again.

## Sources

- [QR code (Wikipedia)](https://en.wikipedia.org/wiki/QR_code)
- [Reed-Solomon error correction (Wikipedia)](https://en.wikipedia.org/wiki/Reed%E2%80%93Solomon_error_correction), the maths behind QR damage tolerance
