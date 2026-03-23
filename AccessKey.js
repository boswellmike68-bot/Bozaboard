// ── Access Tiers ─────────────────────────────────────────────────
// owner    = Mike only. Unlimited. No restrictions.
// sponsor  = Paid subscriber or sponsor. Full access.
// demo     = Potential sponsor preview. Limited interactions.
// denied   = No access.

const ACCESS_TIERS = {
  // "steward" → owner
  "76faa0295e4f0a68c6ab2dac601d308a7170260be3f245eb3b63a784e4a03824": "owner",
  // "demo" → demo
  "2a97516c354b68848cdbd8f54a226a0a55b21ed138e207ad6c5cbb9c00aa5aea": "demo"
};

// Sponsor keys can be added here as: hash → "sponsor"

const DEMO_LIMITS = {
  maxAdvisories: 5,
  stewardAI: false,
  voiceEnabled: false
};

async function sha256Hex(input) {
  const msgUint8 = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function getAccessTier() {
  return window.__bozaboardTier || "denied";
}

export function getDemoLimits() {
  return { ...DEMO_LIMITS };
}

export function isDemoMode() {
  return getAccessTier() === "demo";
}

export function isOwner() {
  return getAccessTier() === "owner";
}

export function hasFullAccess() {
  const tier = getAccessTier();
  return tier === "owner" || tier === "sponsor";
}

export async function verifyAccess(options = {}) {
  const inputEl = document.getElementById("accessKey");
  const messageEl = document.getElementById("greeter-message");

  const raw = inputEl ? inputEl.value : "";
  const hashHex = await sha256Hex(raw);
  const tier = ACCESS_TIERS[hashHex] || "denied";

  window.__bozaboardTier = tier;
  window.__bozaboardDemoCount = 0;

  if (tier !== "denied") {
    if (typeof window.runWelcomeSequence === "function") {
      window.runWelcomeSequence();
    }
    return { status: "ok", tier };
  }

  if (messageEl) {
    messageEl.textContent = "Access Denied. Governance Integrity Maintained.";
  }

  return { status: "denied", tier: "denied" };
}
