// LovesfireAI — Voice and Emotional-Tone Layer
// Wraps BBnCC governance logic in warmth, clarity, and accessibility.
// Does NOT alter governance decisions. Only transforms presentation.
//
// Architecture: BBnCC (mind) → LovesfireAI (voice) → Bozafire (face)

import { generateAdvisory, resetSession, getSessionState } from "./bbncc-engine.js";

// ── Tone Maps ──────────────────────────────────────────────────────
// Each intent type gets a warm wrapper that preserves governance meaning.

const TONE_OPENERS = {
  proceed: [
    "Green light — ",
    "Let's move — ",
    "You're clear — "
  ],
  evaluation: [
    "Good call pausing to look at this — ",
    "Let's take a closer look — ",
    "Worth examining — "
  ],
  risk: [
    "Heads up — ",
    "Something to watch here — ",
    "Let's be careful — "
  ],
  scope: [
    "Good question on boundaries — ",
    "Let's frame this right — ",
    "Clarity matters here — "
  ],
  uncertainty: [
    "It's okay to not know yet — ",
    "No rush — ",
    "Let's ground this first — "
  ],
  alignment: [
    "Checking the compass — ",
    "Let's make sure this fits — ",
    "Values check — "
  ],
  priority: [
    "What matters most right now — ",
    "Let's sort this — ",
    "Focus point — "
  ],
  reflection: [
    "That's worth sitting with — ",
    "Good moment to breathe — ",
    "Reflection time — "
  ],
  escalation: [
    "This needs attention — ",
    "Flagging this — ",
    "Let's take this seriously — "
  ],
  pause: [
    "Holding space — ",
    "Rest is part of the process — ",
    "Steady — "
  ],
  general: [
    "Heard — ",
    "Noted — ",
    "With you — "
  ],
  checkpoint: [
    "Milestone — ",
    "Let's check in — ",
    "Breath point — "
  ]
};

const TONE_CLOSERS = [
  " You've got this.",
  " One step at a time.",
  " We're right here.",
  " The board is with you.",
  " Steady hands, clear heart.",
  "",
  "",
  ""
];

const PERSONA_VOICES = {
  "Stability Chair": "Bozafire \u00b7 Stability",
  "Momentum Chair": "Bozafire \u00b7 Momentum",
  "Risk Chair": "Bozafire \u00b7 Caution",
  "Alignment Chair": "Bozafire \u00b7 Alignment",
  "Committee": "Bozafire"
};

// ── Deterministic Picker ───────────────────────────────────────────
// Uses input length as seed so same input always gets same tone.

function pick(arr, seed) {
  return arr[seed % arr.length];
}

// ── Tone Application ───────────────────────────────────────────────

function applyTone(advisory, inputText) {
  const seed = inputText.length;
  const type = advisory.checkpoint ? "checkpoint" : (advisory.type || "general");

  const openers = TONE_OPENERS[type] || TONE_OPENERS.general;
  const opener = pick(openers, seed);
  const closer = pick(TONE_CLOSERS, seed + 3);

  const rawMessage = advisory.message || "";

  const lowerMsg = rawMessage.toLowerCase();
  let coreMessage = rawMessage;

  if (lowerMsg.startsWith("proceed acknowledged. ")) {
    coreMessage = rawMessage.substring("Proceed acknowledged. ".length);
  } else if (lowerMsg.startsWith("evaluation requested. ")) {
    coreMessage = rawMessage.substring("Evaluation requested. ".length);
  } else if (lowerMsg.startsWith("risk detected. ")) {
    coreMessage = rawMessage.substring("Risk detected. ".length);
  } else if (lowerMsg.startsWith("pause acknowledged. ")) {
    coreMessage = rawMessage.substring("Pause acknowledged. ".length);
  } else if (lowerMsg.startsWith("intent acknowledged. ")) {
    coreMessage = rawMessage.substring("Intent acknowledged. ".length);
  } else if (lowerMsg.startsWith("reflection noted. ")) {
    coreMessage = rawMessage.substring("Reflection noted. ".length);
  } else if (lowerMsg.startsWith("scope inquiry noted. ")) {
    coreMessage = rawMessage.substring("Scope inquiry noted. ".length);
  }

  const firstChar = coreMessage.charAt(0).toLowerCase();
  const restOfMessage = coreMessage.substring(1);
  const toned = opener + firstChar + restOfMessage + closer;

  const persona = advisory.persona || "Committee";
  const voice = PERSONA_VOICES[persona] || "Bozafire";

  return {
    message: toned,
    voice: voice,
    raw: advisory
  };
}

// ── Public API ─────────────────────────────────────────────────────
// wrapBBnCC: same interface as generateAdvisory but with tone applied.

export function wrapBBnCC(inputText) {
  const advisory = generateAdvisory(inputText);
  const toned = applyTone(advisory, inputText);

  return {
    message: toned.message,
    voice: toned.voice,
    type: advisory.type,
    checkpoint: advisory.checkpoint || false,
    session: advisory.session,
    raw: advisory
  };
}

export function wrapReset() {
  const result = resetSession();
  return {
    message: "Session cleared. Fresh start. The Committee is ready when you are.",
    voice: "Bozafire \u00b7 Alignment",
    session: { momentumTier: "neutral", momentum: 0, turns: 0 }
  };
}

export { getSessionState };

// ── Bozafire Greeting ──────────────────────────────────────────────

const GREETINGS = [
  "Welcome to the Boardroom. I'm Bozafire — your guide through the governance process. Speak freely. The Committee is listening.",
  "Hey. I'm Bozafire. This space is governed, transparent, and yours. Ask anything — or just say 'proceed' to start moving.",
  "Bozafire here. The Boardroom is open, the Committee is seated, and every word is on the record. What's on your mind?"
];

export function getBozafireGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning. " + GREETINGS[0];
  if (hour < 18) return "Good afternoon. " + GREETINGS[1];
  return "Good evening. " + GREETINGS[2];
}
