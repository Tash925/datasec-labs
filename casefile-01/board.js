/*
 * DataSec Chronicles — Labs
 * Case File 01: The Silent Intercept
 * ------------------------------------------------------------------
 * Per-case config consumed by the shared engine.js.
 * Same pattern as the Bingo boards: engine.js + bingo.css are shared,
 * this file is the only thing that changes per case.
 *
 * Drop-in path (mirrors your existing structure):
 *   labs.datasecchronicles.com/casefiles/01/board.js
 *
 * The reveal answer is lightly obfuscated (base64) so it isn't sitting
 * in plain text in the shipped file. This is NOT real security — anyone
 * who opens dev tools can decode it. Because the daily story lives on X
 * and only the verdict lives here, that's an acceptable trade: a
 * determined snooper spoils a grid, not the week-long narrative.
 *
 * Reveal timestamp is a fixed ISO instant, so every visitor hits the
 * same moment regardless of when they load the page (global countdown).
 * ------------------------------------------------------------------
 */

window.DATASEC_CASE = {
  meta: {
    id: "case-01",
    volume: "Foundations",
    number: "01",
    title: "The Silent Intercept",
    tagline: "One attacker. Seven indicators. One chain.",
    eventTag: "#[EVENTTAG]",          // swap after X check
    signature: "the tool changes, the question doesn't",
    emoji: "\uD83D\uDC9C"             // 💜
  },

  // Fixed global reveal instant. 2026-08-31 20:00 America/New_York = 00:00Z (EDT, UTC-4).
  reveal: {
    at: "2026-09-01T00:00:00Z",
    label: "Verdict unlocks Sun Aug 31, 8:00 PM ET",
    // base64 of the verdict headline; full narrative lives in `verdict` below,
    // gated by the engine until `reveal.at` passes.
    sealedHeadline: "VGhlIFNpbGVudCBJbnRlcmNlcHQg4oCUIHNvbHZlZA=="
  },

  // Seven answers. `slot` describes grid placement for a word-fit layout
  // (not a true interlocking crossword — see note in engine.js).
  // `hintDay` maps each answer to the X hint that unlocks it.
  clues: [
    {
      id: "1A", answer: "PHISHING", len: 8,
      def: "Lure email that trades on trust to harvest a credential",
      hintDay: "2026-08-25",
      role: "initial access"
    },
    {
      id: "2D", answer: "WORM", len: 4,
      def: "Self-propagating code that spreads through a service, no file to click",
      hintDay: "2026-08-26",
      role: "spread"
    },
    {
      id: "3A", answer: "FIREWALL", len: 8,
      def: "The rule-based gate that decides which traffic passes",
      hintDay: "2026-08-27",
      role: "reach / segmentation gap"
    },
    {
      id: "4D", answer: "BRUTEFORCE", len: 10,
      def: "Guessing every combination against a service until one gives",
      hintDay: "2026-08-28",
      role: "privilege escalation"
    },
    {
      id: "5A", answer: "MALWARE", len: 7,
      def: "Umbrella term for any software built to do harm",
      hintDay: "2026-08-29",
      role: "category"
    },
    {
      id: "6D", answer: "MITM", len: 4,
      def: "Relaying traffic between two hosts that each believe it's direct",
      hintDay: "2026-08-30",
      role: "objective"
    },
    {
      id: "7A", answer: "ANOMALY", len: 7,
      def: "The deviation from baseline that starts every investigation",
      hintDay: "2026-08-31",
      role: "detection"
    }
  ],

  // Verdict narrative, revealed only after reveal.at. Ordered by kill-chain
  // stage so the engine can render it as a sequence.
  verdict: {
    intro: "Here's what actually happened, in order.",
    chain: [
      { stage: "Initial access", answer: "PHISHING",
        text: "One email, one trusted-looking sender, one harvested credential. No exploit. Just a click, and a valid login the attacker now owned." },
      { stage: "Escalation", answer: "BRUTEFORCE",
        text: "That first credential was low-privilege. A brute-force run against an internal admin service \u2014 hundreds of attempts climbing in the auth logs \u2014 handed over a stronger account. Now they had reach." },
      { stage: "Spread", answer: "WORM",
        text: "A worm self-propagated across an unpatched service: no credential needed per host, no file to click. It spread through the vulnerability itself, which is why endpoint scans kept coming back clean." },
      { stage: "Reach", answer: "FIREWALL",
        text: "It got that far because an internal firewall rule was never tightened \u2014 flat, over-permissive segmentation let it cross into a zone it should never have reached." },
      { stage: "Objective", answer: "MITM",
        text: "In that zone, the payload: the worm poisoned ARP so one host answered for two, and the attacker sat in the path relaying traffic between machines that each believed the channel was direct. Nothing on disk \u2014 the compromise lived in the path, not the host. That's why the endpoint tools stayed silent, and it's what the case is named for." },
      { stage: "Detection", answer: "ANOMALY",
        text: "No signature caught this. One deviation did: a single IP answering to two MAC addresses in the ARP table. Small. Easy to scroll past. That one line unraveled all seven." }
    ],
    read: "Every indicator was noise on its own. The case was never about naming the pieces \u2014 it was about seeing the shape they made together. Same move whether you're reading a storm cell before it drops or a SOC feed before it breaks.",
    close: "The tool changes. The question doesn't. \uD83D\uDC9C"
  },

  next: {
    teaser: "Case File 02 loads this fall. Bookmark the board."
  }
};
