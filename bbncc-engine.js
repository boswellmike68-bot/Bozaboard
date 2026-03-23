// BBnCC Governance Advisory Engine
// Consolidated from BBnCC-main: bbncc.js, intent.js, rules.js, pattern.js, personas.js
// Accuracy-first. Deterministic. No blending. No inference.

// ── Intent Classifier ──────────────────────────────────────────────
// Highest-specificity match wins. Order matters.

export function classifyIntent(input) {
  const text = String(input).toLowerCase();

  if (text.includes("escalate") || text.includes("escalation")) return "escalation";
  if (text.includes("align") || text.includes("alignment")) return "alignment";
  if (text.includes("prioritize") || text.includes("priority")) return "priority";
  if (text.includes("reflect") || text.includes("reflection")) return "reflection";

  if (text.includes("proceed")) return "proceed";
  if (text.includes("pause") || text.includes("hold")) return "pause";
  if (text.includes("evaluate") || text.includes("evaluation")) return "evaluation";

  if (text.includes("risk")) return "risk";
  if (text.includes("uncertain") || text.includes("unsure")) return "uncertainty";

  if (text.includes("scope")) return "scope";

  return "general";
}

// ── Committee Personas ─────────────────────────────────────────────
// Deterministic, accuracy-first domain voices.

export const PERSONAS = {
  stability: "Stability Chair",
  momentum: "Momentum Chair",
  risk: "Risk Chair",
  alignment: "Alignment Chair"
};

export function selectPersona({ type, momentumTier }) {
  if (type === "risk" || type === "escalation") return PERSONAS.risk;

  if (
    momentumTier === "strong-negative" ||
    momentumTier === "negative" ||
    type === "uncertainty" ||
    type === "pause"
  ) {
    return PERSONAS.stability;
  }

  if (
    momentumTier === "positive" ||
    momentumTier === "strong-positive" ||
    ["proceed", "evaluation", "priority"].includes(type)
  ) {
    return PERSONAS.momentum;
  }

  if (type === "alignment" || type === "scope" || type === "reflection") {
    return PERSONAS.alignment;
  }

  return PERSONAS.alignment;
}

// ── Advisory Patterns ──────────────────────────────────────────────

const PATTERNS = {
  proceed: "Proceed acknowledged. The Committee advises structured forward motion with defined checkpoints.",
  evaluation: "Evaluation requested. The Committee recommends reviewing objectives, constraints, and expected outcomes.",
  risk: "Risk detected. The Committee advises identifying exposures and establishing mitigation steps.",
  scope: "Scope inquiry noted. The Committee advises defining boundaries and clarifying deliverables.",
  uncertainty: "Uncertainty registered. The Committee advises grounding in intent before advancing.",
  alignment: "Alignment check. The Committee advises confirming values, direction, and expected impact.",
  priority: "Priority shift detected. The Committee advises ranking tasks by urgency and consequence.",
  reflection: "Reflection noted. The Committee advises capturing insights before proceeding.",
  escalation: "Escalation detected. The Committee advises assessing severity and required response level.",
  pause: "Pause acknowledged. The Committee advises holding position until clarity returns.",
  general: "The Committee is listening. Try telling us what you want to do — move forward, evaluate something, flag a risk, or take a pause."
};

function advisoryFor(type) {
  return PATTERNS[type] || PATTERNS.general;
}

// ── Governance Rule Engine ─────────────────────────────────────────
// ACCURACY = HIGHEST AUTHORITY
// The highest-weight rule is ALWAYS the single source of truth.
// No blending. No dilution. No secondary interpretation.

const RULE_WEIGHTS = {
  stability: 100,
  reinforcement: 90,
  escalation: 95,
  contradiction: 85,
  oscillation: 80,
  repetition: 70,
  sessionDepth: 60
};

function applyRules(type, state) {
  const candidates = [];

  if (state.momentum <= -3) {
    candidates.push({
      weight: RULE_WEIGHTS.stability,
      message: "Stability protocol triggered. The Committee advises grounding intent before further action."
    });
  }

  if (state.momentum >= 3) {
    candidates.push({
      weight: RULE_WEIGHTS.reinforcement,
      message: "Forward momentum confirmed. The Committee advises sustained motion with structured checkpoints."
    });
  }

  const lastThree = state.history.slice(-3);
  if (lastThree.length === 3 && lastThree.every((i) => i === type)) {
    candidates.push({
      weight: RULE_WEIGHTS.repetition,
      message: "Pattern detected. The Committee advises reviewing recurring intent for underlying drivers."
    });
  }

  const recent = state.history.slice(-4);
  if (recent.includes("proceed") && recent.includes("pause")) {
    candidates.push({
      weight: RULE_WEIGHTS.oscillation,
      message: "Oscillation detected. The Committee advises stabilizing direction before advancing."
    });
  }

  if (type === "escalation") {
    candidates.push({
      weight: RULE_WEIGHTS.escalation,
      message: "Escalation detected. The Committee advises assessing severity, impact, and required response level."
    });
  }

  if (recent.includes("alignment") && recent.includes("risk")) {
    candidates.push({
      weight: RULE_WEIGHTS.contradiction,
      message: "Contradiction detected. The Committee advises reconciling alignment goals with identified risks."
    });
  }

  if (state.count > 12 && state.count % 5 === 0) {
    candidates.push({
      weight: RULE_WEIGHTS.sessionDepth,
      message: "Session depth reached. The Committee advises pausing to review decisions made this cycle."
    });
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.weight - a.weight);
  return candidates[0].message;
}

// ── Momentum Tier ──────────────────────────────────────────────────

function calculateMomentumTier(value) {
  if (value <= -3) return "strong-negative";
  if (value === -2 || value === -1) return "negative";
  if (value === 0) return "neutral";
  if (value === 1 || value === 2) return "positive";
  if (value >= 3) return "strong-positive";
  return "neutral";
}

// ── Session State & Advisory Generator ─────────────────────────────

let sessionState = {
  count: 0,
  lastIntent: null,
  history: [],
  momentum: 0,
  momentumTier: "neutral"
};

function generateCheckpoint() {
  return {
    persona: PERSONAS.alignment,
    checkpoint: true,
    type: "checkpoint",
    message:
      "Checkpoint reached. The Committee advises reviewing recent direction, momentum, and intent patterns before proceeding.",
    session: { ...sessionState, history: [...sessionState.history] }
  };
}

export function generateAdvisory(input) {
  const type = classifyIntent(input);

  sessionState.count++;
  sessionState.lastIntent = type;
  sessionState.history.push(type);

  if (["proceed", "evaluation", "alignment", "priority"].includes(type)) {
    sessionState.momentum++;
  } else if (["uncertainty", "risk", "pause"].includes(type)) {
    sessionState.momentum--;
  }

  sessionState.momentumTier = calculateMomentumTier(sessionState.momentum);

  if (sessionState.count % 5 === 0) {
    return generateCheckpoint();
  }

  const ruleOverride = applyRules(type, sessionState);

  const persona = selectPersona({
    type,
    momentumTier: sessionState.momentumTier
  });

  const message = ruleOverride || advisoryFor(type);

  return {
    persona,
    type,
    message,
    session: {
      turns: sessionState.count,
      last: sessionState.lastIntent,
      momentum: sessionState.momentum,
      momentumTier: sessionState.momentumTier,
      history: [...sessionState.history]
    }
  };
}

export function resetSession() {
  sessionState.count = 0;
  sessionState.lastIntent = null;
  sessionState.history = [];
  sessionState.momentum = 0;
  sessionState.momentumTier = "neutral";

  return { status: "Session reset. The Committee is clear and ready." };
}

export function getSessionState() {
  return { ...sessionState, history: [...sessionState.history] };
}
