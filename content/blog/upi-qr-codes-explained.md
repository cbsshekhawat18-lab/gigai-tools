---
title: "UPI QR Codes Explained: How India's Payment QR Strings Actually Work"
description: "A clear breakdown of how UPI payment QR codes work, the underlying string, the pa/pn/am parameters, static vs. dynamic amounts, and how to make a safe one."
date: "2026-07-03"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
tool: "upi-qr-code-generator"
category: "qr-tools"
tags: ["upi", "payment qr", "india", "qr codes", "how-it-works"]
featured: true
---

In India, a small printed square taped to a counter now moves more money than most card networks. Scan it, confirm the amount, enter your PIN, done. That square is a **UPI QR code**, and while it looks like magic, what's actually encoded inside it is refreshingly simple, a short line of text that any UPI app knows how to read. This guide opens up that line so you understand exactly what your payment QR code is telling the world, and how to make one that's correct and safe.

## What a UPI QR code contains

A QR code doesn't store money, an account, or a bank connection. It stores **text**, and for UPI, that text is a specially formatted URI that begins with `upi://pay?`. Everything after the `?` is a set of parameters separated by `&`, exactly like a web link's query string.

A typical UPI string looks like this:

```
upi://pay?pa=name@bank&pn=Merchant%20Name&am=250.00&cu=INR&tn=Order%20No%2012
```

When you scan it, your UPI app parses those parameters and pre-fills a payment screen. It does **not** pull money on its own. You still confirm and authenticate. The QR code is just a fast, error-proof way of typing in who to pay.

## The parameters, one by one

Each parameter has a two-letter key. These are the ones that matter:

- **`pa`. Payee Address (VPA).** This is the critical field: the recipient's UPI ID, like `store@okaxis` or `9876543210@ybl`. This is *who gets paid.* Everything else is convenience. This is the destination.
- **`pn`, Payee Name.** The display name your app shows so you can confirm you're paying the right party. Spaces are URL-encoded as `%20`.
- **`am`: Amount.** The transaction value, e.g. `250.00`. **This field is optional.** Leave it out and the payer types the amount themselves, that's how an open "pay us anything" merchant code works.
- **`cu`. Currency.** Almost always `INR`. UPI is a domestic system, so this rarely changes.
- **`tn`: Transaction Note.** A short reference like an order number or a description. Again URL-encoded.
- **`mc`, Merchant Category Code** and **`tr`: Transaction Reference ID** appear on formal merchant codes for reconciliation, but personal codes usually omit them.

That's genuinely most of it. If you can read a web URL's query string, you can read a UPI QR code.

## Static vs. dynamic amount

There are two flavours of UPI code, and the difference is simply whether `am` is present:

- **Fixed-amount (dynamic) codes** include `am=250.00`. The payer sees a locked amount. A point-of-sale terminal generates a fresh one of these per transaction, which is why the amount on a shop's screen QR changes with each customer.
- **Open-amount (static) codes** omit `am` entirely. The payer enters the amount. This is the printed sticker on the counter that handles every sale, whatever the total. It never changes, so you can print it once and use it forever.

For a small shop, a tea stall, or an individual, the open static code is usually all you need: one printed square, any amount. The [UPI QR code generator](/upi-qr-code-generator) lets you build either kind: enter your VPA and name to make an open code, or add an amount to lock it.

## Why the destination is baked in, and why that's a feature

Because the VPA is encoded directly in a static code, a printed UPI QR points at your account and *nothing else*. There's no server in the middle, no redirect, no third party that can quietly change where the money goes after you print it. What you encode is what gets paid. That directness is exactly why UPI codes are trustworthy, and also why you should treat the encoding step carefully. (Contrast this with re-directable marketing codes, which we cover in [using QR codes in marketing campaigns](/blog/using-qr-codes-in-marketing-campaigns).)

## Making a safe UPI code

A few rules keep your payment code correct and secure:

1. **Verify the VPA character for character.** A single wrong digit or a typo in the bank handle sends money to a stranger, or nowhere. Copy your UPI ID directly from your banking app rather than typing it from memory.
2. **Set the payee name to match your business.** Payers glance at the name to confirm before paying. A blank or wrong name creates hesitation and abandoned payments.
3. **Test with a tiny real payment.** Before printing, scan your generated code and send yourself one rupee. If it lands in the right account with the right name showing, the code is correct. This is the only test that matters.
4. **Decide static vs. fixed deliberately.** A counter sticker should be open-amount. A specific invoice or a single-item sale is better as a fixed-amount code so the customer can't fat-finger the total.

## Protecting a printed payment code

UPI codes carry a real-world risk that novelty codes don't: **tampering.** There have been cases of a scammer pasting their own QR sticker over a shop's legitimate one. Because the payee name shows on the payer's screen before they pay, the defence is partly on the customer, but as a merchant:

- Laminate or frame your code so a sticker can't be slapped over it unnoticed.
- Check it periodically. Scan your own code and confirm *your* name appears.
- Display your business name near the code so customers can cross-check what their app shows.

## How to read a code you've been handed

If someone sends you a UPI QR image and you want to know exactly what it'll pay before you scan with your banking app, you can decode the raw string first. A [QR code scanner](/blog/how-to-scan-a-qr-code-on-any-device) or decoder will reveal the underlying `upi://pay?...` text, and now you can read it: check the `pa` is who you expect and the `am`, if present, is the right amount. Reading the string before you authenticate is a simple, powerful habit.

## Only the fields you fill make it into the string

Since I built the [UPI QR code generator](/upi-qr-code-generator), one habit of its encoder is worth knowing: it writes parameters only when they carry a value. Leave the amount blank and there is no empty `am=` in the output. The parameter simply never appears, which is exactly what makes an open-amount counter code. The payee name and note are percent-encoded before they join the string, so a space or an ampersand in a shop name cannot corrupt the parameters after it, and the currency defaults to `INR` as the specification expects. The assembly is a pure string function running in your browser. Nothing is sent, stored or registered anywhere. Which is also the limit: the tool cannot check that a VPA exists or belongs to you. Only the small test payment described above proves that.

## A line of text, not a black box

A UPI QR code is not a mysterious financial instrument, it's a short, human-readable line of text starting with `upi://pay?`, where `pa` names the account, `pn` names the payee, and an optional `am` fixes the amount. Understanding those few fields lets you make a correct code, spot a tampered one, and know exactly what you're about to pay before you enter your PIN.

Need one for your shop or a one-off invoice? Build it with the [UPI QR code generator](/upi-qr-code-generator): enter your VPA, choose open or fixed amount, and download a print-ready code. It's free and nothing is uploaded.

## Sources

- [QR code (Wikipedia)](https://en.wikipedia.org/wiki/QR_code)
- [Reed-Solomon error correction (Wikipedia)](https://en.wikipedia.org/wiki/Reed%E2%80%93Solomon_error_correction), the maths behind QR damage tolerance
