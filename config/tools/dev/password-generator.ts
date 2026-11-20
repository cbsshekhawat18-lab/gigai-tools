import type { Tool } from "@/types";

/**
 * Password Generator, a crypto-secure, entirely client-side password and
 * passphrase maker. It uses `crypto.getRandomValues` with rejection sampling for
 * an unbiased draw across the chosen character pool, shows a live entropy and
 * strength meter, can guarantee at least one character from every selected
 * class, exclude look-alike characters, generate in bulk, and switch into a
 * memorable diceware-style passphrase mode. All copy is unique to password
 * generation: written to rank for the exact queries people type when they need
 * a strong password they can trust was never sent to a server.
 */
const passwordGenerator: Tool = {
  slug: "password-generator",
  title: "Password Generator",
  description:
    "Generate strong, crypto-secure passwords and memorable passphrases in your browser: control length, character sets, look-alikes and guaranteed classes, with a live entropy meter. Nothing is uploaded.",
  category: "developer-tools",
  icon: "KeyRound",
  accent: "emerald",
  status: "live",
  createdAt: "2026-06-24",

  h1: "Password Generator, Strong, Random Passwords & Passphrases Online",
  tagline:
    "Create truly random passwords with cryptographic entropy, or generate memorable word-based passphrases: with a live strength meter, exclude-look-alikes, guaranteed character classes and bulk output. 100% in your browser, nothing uploaded.",
  longDescription:
    "The GigAI Password Generator builds high-entropy passwords and passphrases entirely on your device using the browser's Web Crypto engine (the same cryptographically secure random source browsers use for TLS) so every character is drawn with real, unbiased randomness rather than the predictable Math.random() many web generators quietly rely on. Dial the length anywhere from 4 to 128 characters, toggle uppercase, lowercase, digits and symbols, optionally require at least one character from every set you enabled, and exclude visually ambiguous look-alikes like O/0 and l/1 that cause typos when read aloud or copied by hand. A live entropy readout and strength label update on every change, so you can see exactly how much guessing resistance you're buying. Prefer something you can actually remember? Switch to passphrase mode for diceware-style word combinations: four or more random words joined by a separator of your choice, which are long, memorable and brutally hard to brute-force. Need a batch for seeding accounts or fixtures? Generate up to fifty at once and copy them individually or all together. Because generation happens locally and nothing is ever transmitted, logged or stored, the passwords you create here are yours alone, close the tab and they're gone.",

  ctaText: "Generate Password",

  keywords: [
    "password generator",
    "strong password generator",
    "random password generator",
    "secure password generator",
    "passphrase generator",
    "diceware generator",
    "memorable password generator",
    "crypto secure password",
    "password entropy calculator",
    "bulk password generator",
    "online password maker",
    "generate password no upload",
  ],

  seo: {
    title:
      "Password Generator, Strong Random Passwords & Passphrases Online | GigAI Tools",
    description:
      "Free crypto-secure password generator. Create strong random passwords or memorable passphrases with a live entropy meter, exclude look-alikes and bulk output, 100% in your browser, no uploads.",
  },

  features: [
    {
      icon: "ShieldCheck",
      title: "Cryptographically secure",
      description:
        "Every character is drawn from crypto.getRandomValues with rejection sampling, so the distribution is unbiased and unpredictable. Never the guessable Math.random() weaker generators use.",
    },
    {
      icon: "Gauge",
      title: "Live entropy & strength meter",
      description:
        "See the exact entropy in bits and a Very weak → Very strong label update as you change length and character sets, so you know how much guessing resistance you actually have.",
    },
    {
      icon: "Type",
      title: "Full character-set control",
      description:
        "Toggle uppercase, lowercase, digits and symbols, and optionally require at least one from every enabled set so a password never accidentally drops a class.",
    },
    {
      icon: "EyeOff",
      title: "Exclude look-alikes",
      description:
        "Drop visually ambiguous characters like O/0, I/l/1 and S/5 to prevent transcription errors when a password is read aloud, printed or typed from a screen.",
    },
    {
      icon: "MessageSquareText",
      title: "Memorable passphrase mode",
      description:
        "Switch to diceware-style word passphrases (four or more random words with your choice of separator and capitalisation) long, high-entropy and genuinely easy to remember.",
    },
    {
      icon: "Layers",
      title: "Bulk generate & copy",
      description:
        "Produce up to fifty passwords at once for seeding accounts, fixtures or handovers, then copy them one by one or all together with a single click.",
    },
  ],

  benefits: [
    {
      title: "Trust the randomness",
      description:
        "Web Crypto is the browser's cryptographically secure RNG. Unlike generators built on Math.random(), the passwords here can't be predicted by reconstructing a seed.",
    },
    {
      title: "Strength you can see",
      description:
        "The entropy readout turns 'is this strong enough?' into a concrete number of bits, so you can meet a policy or exceed a threshold with confidence instead of guessing.",
    },
    {
      title: "Passwords people won't mistype",
      description:
        "Excluding look-alikes and choosing readable separators makes generated secrets safe to dictate, print on a card or type from a second screen without errors.",
    },
    {
      title: "Private by design",
      description:
        "Nothing is uploaded, logged or stored. Generation is local and ephemeral, so the secret you create is never seen by us or anyone on the network.",
    },
  ],

  howTo: [
    {
      title: "Pick a mode",
      description:
        "Choose Password for a random character string or Passphrase for a memorable diceware-style set of words.",
    },
    {
      title: "Set length & rules",
      description:
        "Drag the length slider and toggle the character sets you want. Optionally require every set and exclude look-alike characters.",
    },
    {
      title: "Check the strength",
      description:
        "Watch the live entropy and strength meter update. Aim for at least 60–80 bits, and higher for accounts that matter.",
    },
    {
      title: "Generate & copy",
      description:
        "Generate one or a batch, then copy an individual password or all of them at once. Regenerate instantly if you want a different set.",
    },
  ],

  formats: {
    input: [],
    output: ["Password", "Passphrase", "TXT"],
  },

  useCases: [
    {
      audience: "Everyday user",
      title: "A master password you can remember",
      description:
        "Use passphrase mode to create a four-or-five-word secret that's easy to recall for your password manager but effectively impossible to brute-force.",
    },
    {
      audience: "Developer / DevOps",
      title: "Secrets for config and services",
      description:
        "Generate high-entropy strings for database users, API service accounts and .env values, with symbols on and look-alikes off so they survive copy-paste and shell escaping.",
    },
    {
      audience: "IT administrator",
      title: "Bulk provisioning",
      description:
        "Mint a batch of unique passwords for new accounts or device handovers, then hand each out individually: nothing ever leaves the machine you generated them on.",
    },
    {
      audience: "Security-conscious team",
      title: "Meet a password policy",
      description:
        "Require every character class and a minimum length, and use the entropy readout to prove each credential clears the bit threshold your policy demands.",
    },
  ],

  troubleshooting: [
    {
      problem: "The Generate button says to enable a character set.",
      solution:
        "In Password mode at least one of uppercase, lowercase, digits or symbols must be on: with everything off there's no pool to draw from. Toggle a set back on and it will generate immediately.",
    },
    {
      problem: "Require-each-class is disabled or greyed out.",
      solution:
        "That option only applies when the length is at least as large as the number of sets you enabled. You can't guarantee four classes in a three-character password. Increase the length and it re-enables.",
    },
    {
      problem: "My passphrase looks too short in characters.",
      solution:
        "Passphrase strength comes from the number of words and the size of the word list, not the character count. Four random words already give strong entropy. Add a word or two for high-value accounts.",
    },
    {
      problem: "A site rejected my password's symbols.",
      solution:
        "Some systems disallow certain punctuation. Turn symbols off (or regenerate) to get an alphanumeric password, or use passphrase mode with a hyphen separator, which nearly every system accepts.",
    },
  ],

  tips: [
    "Aim for 80+ bits of entropy for anything important, the meter tells you the moment you cross it.",
    "Turn off look-alikes for any password you'll type by hand or read aloud to avoid O/0 and l/1 mix-ups.",
    "Passphrases beat short random strings for memorability at the same entropy: great for master passwords.",
    "Always store generated secrets in a password manager rather than reusing one strong password everywhere.",
    "Use bulk mode to seed multiple accounts, but give every account its own unique password.",
  ],

  security:
    "Every password and passphrase is generated locally in your browser with the Web Crypto API, the same cryptographically secure randomness browsers use for encryption. Nothing is uploaded, transmitted, logged or stored: the tool has no server that could see your secret. Generation is ephemeral, so once you close the tab there is no trace left anywhere. It is safe to create even your most sensitive credentials here.",

  faq: [
    {
      question: "Are these passwords actually random and secure?",
      answer:
        "Yes. Every character is drawn from crypto.getRandomValues, the browser's cryptographically secure random number generator, using rejection sampling to avoid the modulo bias that skews naïve generators. This is far stronger than the Math.random() that many online password tools rely on, which is not designed for security and can, in principle, be predicted.",
    },
    {
      question: "Is my password sent to a server?",
      answer:
        "No. Everything happens on your device inside your browser. There is no upload, no logging and no storage. The tool has no backend that could ever receive your password. Because generation is local and ephemeral, closing the tab leaves no trace, so it's safe even for master passwords and production secrets.",
    },
    {
      question: "How long should my password be?",
      answer:
        "For most accounts, 16 or more random characters with mixed classes gives ample entropy. For high-value accounts or anything protecting money or identity, go longer or use a passphrase. Watch the entropy meter: 60 bits is a reasonable floor, 80+ bits is strong, and 100+ bits is excellent.",
    },
    {
      question: "What is entropy and how many bits do I need?",
      answer:
        "Entropy measures how many guesses an attacker would need on average, expressed in bits: each extra bit doubles the work. Around 60 bits resists casual attacks, 80 bits is strong against serious offline cracking, and 100+ bits is effectively unbreakable with current technology. The meter shows your exact figure as you adjust the options.",
    },
    {
      question: "What is a passphrase and is it more secure than a password?",
      answer:
        "A passphrase is several random words strung together (diceware-style), such as 'harbor-violet-cactus-mellow'. At the same strength it's far easier to remember than a random string, and adding words raises entropy quickly. Four random words from a large list is already strong. Five or six is excellent for master passwords.",
    },
    {
      question: "Why should I exclude ambiguous or look-alike characters?",
      answer:
        "Characters like O and 0, or I, l and 1, are easy to confuse when a password is printed, shown on screen or read aloud, leading to failed logins and support tickets. Excluding them slightly reduces the pool size (and entropy per character), so the tool keeps the length the same and the meter reflects the trade-off.",
    },
    {
      question: "Can I make sure every character type appears?",
      answer:
        "Yes. Turn on 'require each selected set' and the generator guarantees at least one uppercase, lowercase, digit and symbol (whichever you enabled), which many corporate password policies demand. It's available whenever the length is at least the number of sets you've selected.",
    },
    {
      question: "Can I generate many passwords at once?",
      answer:
        "Yes. Increase the count to produce a batch of unique passwords in one go: useful for provisioning accounts or creating test fixtures. You can copy each password individually or export them all together, and every one is generated with the same cryptographically secure randomness.",
    },
  ],

  changelog: [
    {
      date: "2026-06-24",
      change:
        "Initial release, crypto-secure password generation with length slider (4–128), character-set toggles, exclude look-alikes, require-each-class, live entropy/strength meter, bulk output and per-row copy.",
    },
    {
      date: "2026-06-28",
      change:
        "Added diceware-style passphrase mode with word-count control, selectable separators, capitalisation and an optional trailing digit, plus keyboard shortcuts and a shareable options link.",
    },
    {
      date: "2026-07-02",
      change:
        "Refined the strength thresholds, improved the require-each-class shuffle to stay unbiased, and added TXT export for bulk batches.",
    },
  ],

  relatedTools: ["uuid-generator", "hash-generator", "jwt-decoder", "base64-encoder"],
};

export default passwordGenerator;
