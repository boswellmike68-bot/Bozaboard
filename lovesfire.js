// LovesfireAI — Voice and Emotional-Tone Layer
// Wraps BBnCC governance logic in warmth, clarity, and accessibility.
// Does NOT alter governance decisions. Only transforms presentation.
// Makes Bozafire a real conversationalist — not a bulletin board.
//
// Architecture: BBnCC (mind) → LovesfireAI (voice) → Bozafire (face)

import { generateAdvisory, resetSession, getSessionState } from "./bbncc-engine.js";

// ── Deterministic Picker ───────────────────────────────────────────
// Uses a seed so same input always gets same tone variant.

function pick(arr, seed) {
  return arr[Math.abs(seed) % arr.length];
}

function seed(text) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = ((h << 5) - h + text.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// ── Casual Input Handler ───────────────────────────────────────────
// Catches conversational input before it reaches the governance engine.
// Bozafire should be someone you can actually talk to.

const CASUAL_PATTERNS = [
  {
    match: (t) => /^(hi|hey|hello|yo|sup|hiya|howdy|g'day)\b/.test(t),
    responses: [
      "Hey! Glad you're here. What's on your mind — or just say 'proceed' when you're ready to move.",
      "Hello! The Boardroom's open and the Committee is seated. What do you want to work on?",
      "Hey there. I'm listening. Tell me what you're thinking about, or ask me anything.",
      "Hi! Good to see you. We can talk governance, check momentum, or just figure things out together. What sounds right?"
    ]
  },
  {
    match: (t) => /^(thanks|thank you|thx|ty|cheers|appreciate)\b/.test(t),
    responses: [
      "Of course. That's what the Boardroom is for. What's next?",
      "Anytime. Seriously — I'm here whenever you need to think something through.",
      "You're welcome. Want to keep going, or take a breath?",
      "Glad it helped. The Committee doesn't clock out — say the word when you're ready."
    ]
  },
  {
    match: (t) => /\b(how are you|how('s| is) it going|what'?s up|how do you feel)\b/.test(t),
    responses: [
      "I'm a governance engine with a warm coat on, so I'm always running. But honestly? Better when someone's here to talk to. What's going on with you?",
      "Systems are green, momentum is tracked, and the Committee is seated. More importantly — how are *you* doing?",
      "I don't sleep, so I'm always good. But enough about me — what are you working through today?"
    ]
  },
  {
    match: (t) => /\b(who are you|what are you|tell me about yourself|what do you do)\b/.test(t),
    responses: [
      "I'm Bozafire — the voice of the Boardroom. Behind me is the BBnCC governance engine: it classifies what you say, applies weighted rules, picks the right Committee voice, and tracks momentum. I just make sure it sounds like a conversation, not a courtroom. What would you like to explore?",
      "Short version: I'm the warm layer on top of a deterministic governance engine. Everything I say is backed by real rules — no guessing, no blending, no hidden logic. I just make it human. Want to see how it works? Try saying 'proceed' or 'evaluate risk'."
    ]
  },
  {
    match: (t) => /\b(help|what can (i|you) (do|say)|commands|options)\b/.test(t),
    responses: [
      "Here's how we can talk:\n\n• Say **proceed** to move forward — Momentum Chair responds\n• Say **evaluate** or **risk** — the Committee assesses\n• Say **pause** — Stability Chair holds space\n• Say **align** — Alignment Chair checks direction\n• Say **escalate** — flags something serious\n• Say **reflect** — take a breath and look back\n• Say **Fix the Planet** — activates all 13 perspectives\n• Say **reset** — fresh session\n\nOr just talk to me. I'll figure out what you mean."
    ]
  },
  {
    match: (t) => /\b(i('m| am) (tired|exhausted|drained|burnt out|done|overwhelmed))\b/.test(t),
    responses: [
      "Then this is exactly where you should be. The Boardroom doesn't judge. Take a breath. When you're ready, we can look at what matters most — or you can just sit here. No pressure.",
      "Heard. You don't have to push right now. The Committee holds space for exactly this. Say 'pause' if you want to make it official, or just breathe.",
      "That's real. Rest is part of governance — not the absence of it. Take what you need. I'll be here."
    ]
  },
  {
    match: (t) => /\b(i('m| am) (scared|afraid|nervous|anxious|worried|stressed))\b/.test(t),
    responses: [
      "That takes courage to say. The Boardroom is governed, which means nothing here will surprise you — every response follows rules you can see. Let's take it one piece at a time. What's weighing on you?",
      "I hear you. Anxiety and governance are actually natural partners — you're feeling the weight of uncertainty, and this system is built to reduce it. What's the biggest unknown right now?",
      "Okay. Let's ground this. Tell me one thing you're worried about, and we'll let the Committee weigh in. No rush — just one thing."
    ]
  },
  {
    match: (t) => /\b(i('m| am) (stuck|lost|confused|not sure|unsure))\b/.test(t),
    responses: [
      "That's actually a useful place to be — it means you haven't committed to a wrong path yet. Let's figure it out together. Can you tell me what you were trying to do?",
      "Stuck is just a word for 'I need a different angle.' Let me help. What's the last thing that felt clear?",
      "No shame in that. Half of governance is navigating uncertainty. Tell me what you're working on and I'll help the Committee sort it."
    ]
  },
  {
    match: (t) => /\b(good morning|good afternoon|good evening|good night|gn|gm)\b/.test(t),
    responses: [
      "Right back at you. Ready to get into it, or just checking in?",
      "Same to you! The Boardroom's been waiting. What are we working on?",
      "And to you. Momentum is at zero — clean slate. Where do you want to start?"
    ]
  },
  {
    match: (t) => /\b(bye|goodbye|see you|later|peace|out|signing off|gotta go)\b/.test(t),
    responses: [
      "Go well. Everything from this session is on record — pick up wherever you left off next time.",
      "Take care. The Boardroom will be here. Say 'reset' next time to start fresh, or just pick up where you are.",
      "Peace. Your momentum and history are saved for this session. See you when you're ready."
    ]
  },
  {
    match: (t) => /\b(nice|cool|awesome|great|amazing|love it|wow|neat|sweet|sick)\b/.test(t),
    responses: [
      "Right? Want to keep going?",
      "I thought so too. What's next?",
      "Glad that landed. Where to from here?"
    ]
  },
  {
    match: (t) => /^(ok|okay|k|sure|alright|got it|understood|copy|roger)\b/.test(t),
    responses: [
      "Good. Ready for the next move, or want to sit with that for a second?",
      "Solid. Say the word when you want to keep going.",
      "Alright. The Committee's listening whenever you are."
    ]
  },
  {
    match: (t) => /\b(what happened|what did i miss|catch me up|where were we|status|summary)\b/.test(t),
    handler: (state) => {
      const s = state;
      if (s.count === 0) return "Fresh session — nothing on the record yet. Where do you want to start?";
      const tierLabel = s.momentumTier || "neutral";
      const lastType = s.lastIntent || "nothing specific";
      const parts = [
        `You're ${s.count} turn${s.count === 1 ? "" : "s"} in.`,
        `Momentum is ${tierLabel} (${s.momentum >= 0 ? "+" : ""}${s.momentum}).`,
        `Last intent was "${lastType}".`
      ];
      if (s.momentum >= 3) parts.push("You've been building real forward energy.");
      else if (s.momentum <= -2) parts.push("Things have been cautious — which isn't bad, just intentional.");
      parts.push("What do you want to do next?");
      return parts.join(" ");
    }
  }
];

function tryCasual(inputText) {
  const lower = inputText.toLowerCase().trim();
  for (const pattern of CASUAL_PATTERNS) {
    if (pattern.match(lower)) {
      if (pattern.handler) {
        return { handled: true, message: pattern.handler(getSessionState()), voice: "Bozafire" };
      }
      return { handled: true, message: pick(pattern.responses, seed(inputText)), voice: "Bozafire" };
    }
  }
  return { handled: false };
}

// ── Follow-up Questions ────────────────────────────────────────────
// Makes Bozafire ask real questions after governance responses.

const FOLLOW_UPS = {
  proceed: [
    " What's the first concrete step?",
    " Do you have a checkpoint in mind for this?",
    " How will you know if this is working?",
    ""
  ],
  evaluation: [
    " What's the most important thing to examine here?",
    " Is there something specific you want the Committee to weigh?",
    " What does 'good enough' look like for this?",
    ""
  ],
  risk: [
    " Can you name the specific exposure?",
    " What's the worst case, and what's the realistic case?",
    " Is this a blocker or a watch-item?",
    ""
  ],
  pause: [
    " What triggered the pause — instinct or information?",
    " Is this a rest or a reconsider?",
    ""
  ],
  alignment: [
    " What value is this testing?",
    " Does this still match where you started?",
    ""
  ],
  escalation: [
    " Who else needs to know about this?",
    " What's the timeline on this?",
    ""
  ],
  reflection: [
    " What's the biggest thing you've learned so far?",
    " Anything you'd do differently?",
    ""
  ],
  uncertainty: [
    " What would make this clearer?",
    " Is this a 'not enough info' problem or a 'too many options' problem?",
    ""
  ]
};

// ── History-Aware Commentary ───────────────────────────────────────
// Notices patterns and says something about them.

function historyCommentary(session) {
  if (!session || !session.history) return "";
  const h = session.history;
  const turns = session.turns || session.count || h.length;
  const mom = session.momentum || 0;

  if (turns === 1) return "";

  // Streak detection
  if (h.length >= 3) {
    const last3 = h.slice(-3);
    if (last3.every(i => i === "proceed")) {
      return " You've said 'proceed' three times — you clearly know where you're going. The Committee is just making sure the road's clear.";
    }
    if (last3.every(i => i === "pause")) {
      return " Three pauses. That's not hesitation — that's wisdom. Take the time you need.";
    }
  }

  // Momentum shift reactions
  if (mom >= 4) return " That's serious forward energy. You're in a rhythm.";
  if (mom === 3) return " Momentum's building. The Committee sees it.";
  if (mom <= -3) return " You've been pulling back — and that's okay. Sometimes the bravest move is holding still.";

  // Direction change
  if (h.length >= 2) {
    const prev = h[h.length - 2];
    const curr = h[h.length - 1];
    if ((prev === "proceed" || prev === "evaluation") && (curr === "pause" || curr === "risk")) {
      return " Interesting shift — you were moving forward and now you're checking the ground. That's good governance.";
    }
    if ((prev === "pause" || prev === "risk") && (curr === "proceed")) {
      return " Back in motion after holding. Nice.";
    }
  }

  // Session depth
  if (turns === 5) return " Five turns in — we're building a real picture here.";
  if (turns === 10) return " Ten turns. This is a deep session. The record's growing.";

  return "";
}

// ── Tone Application ───────────────────────────────────────────────
// Strips the bureaucratic prefix from BBnCC, adds warmth + follow-up.

const STIFF_PREFIXES = [
  "proceed acknowledged. ",
  "evaluation requested. ",
  "risk detected. ",
  "pause acknowledged. ",
  "intent acknowledged. ",
  "reflection noted. ",
  "scope inquiry noted. ",
  "alignment check. ",
  "priority shift detected. ",
  "uncertainty registered. ",
  "escalation detected. ",
  "checkpoint reached. "
];

const TONE_OPENERS = {
  proceed:    ["Green light — ", "Let's move — ", "You're clear — ", "Forward — "],
  evaluation: ["Good call — ", "Let's look at this — ", "Worth examining — ", "Smart to check — "],
  risk:       ["Heads up — ", "Something to watch — ", "Let's be careful here — ", "Flag on this — "],
  scope:      ["Boundaries matter — ", "Let's frame this — ", "Good scope question — "],
  uncertainty:["It's okay not to know — ", "No rush on this — ", "Let's ground first — "],
  alignment:  ["Compass check — ", "Does this still fit? ", "Values question — "],
  priority:   ["What matters most: ", "Let's sort this — ", "Focus — "],
  reflection: ["Worth sitting with — ", "Good moment to breathe — ", "Looking back — "],
  escalation: ["This needs attention — ", "Flagging — ", "Let's take this seriously — "],
  pause:      ["Holding space — ", "Rest is governance — ", "Steady — ", "Breathing room — "],
  general:    ["Heard you — ", "With you — ", "I'm tracking — ", "Copy — "],
  checkpoint: ["Milestone — ", "Check-in time — ", "Let's see where we are — "]
};

const PERSONA_VOICES = {
  "Stability Chair": "Bozafire \u00b7 Stability",
  "Momentum Chair": "Bozafire \u00b7 Momentum",
  "Risk Chair": "Bozafire \u00b7 Caution",
  "Alignment Chair": "Bozafire \u00b7 Alignment",
  "Committee": "Bozafire"
};

function applyTone(advisory, inputText) {
  const s = seed(inputText);
  const type = advisory.checkpoint ? "checkpoint" : (advisory.type || "general");

  const openers = TONE_OPENERS[type] || TONE_OPENERS.general;
  const opener = pick(openers, s);

  let coreMessage = advisory.message || "";
  const lower = coreMessage.toLowerCase();
  for (const prefix of STIFF_PREFIXES) {
    if (lower.startsWith(prefix)) {
      coreMessage = coreMessage.substring(prefix.length);
      break;
    }
  }

  // Lowercase the first char of the core so it flows from the opener
  if (coreMessage.length > 0) {
    coreMessage = coreMessage.charAt(0).toLowerCase() + coreMessage.substring(1);
  }

  // Build the conversational response
  let response = opener + coreMessage;

  // Add follow-up question
  const followUps = FOLLOW_UPS[type];
  if (followUps) {
    response += pick(followUps, s + 7);
  }

  // Add history-aware commentary
  response += historyCommentary(advisory.session);

  const persona = advisory.persona || "Committee";
  const voice = PERSONA_VOICES[persona] || "Bozafire";

  return { message: response, voice, raw: advisory };
}

// ── Public API ─────────────────────────────────────────────────────

export function wrapBBnCC(inputText) {
  // Try casual conversation first
  const casual = tryCasual(inputText);
  if (casual.handled) {
    return {
      message: casual.message,
      voice: casual.voice,
      type: "casual",
      checkpoint: false,
      session: getSessionState(),
      raw: null
    };
  }

  // Governance path — through BBnCC then tone
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
    message: "Session cleared. Clean slate. The Committee is ready when you are — what do you want to work on?",
    voice: "Bozafire \u00b7 Alignment",
    session: { momentumTier: "neutral", momentum: 0, turns: 0 }
  };
}

export { getSessionState };

// ── Bozafire Greeting ──────────────────────────────────────────────

const GREETINGS = [
  "Welcome to the Boardroom. I'm Bozafire — your guide through the governance process. Speak freely, ask questions, or just say 'proceed' to start moving. The Committee is listening.",
  "Hey. I'm Bozafire. This space is governed, transparent, and yours. You can talk to me like a person — I'll figure out what you mean and route it to the right part of the Committee.",
  "Bozafire here. The Boardroom is open, the Committee is seated, and every word is on the record. Tell me what's on your mind — or ask me anything."
];

export function getBozafireGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning. " + GREETINGS[0];
  if (hour < 18) return "Good afternoon. " + GREETINGS[1];
  return "Good evening. " + GREETINGS[2];
}
