// ── Access Tiers ─────────────────────────────────────────────────
// owner    = Mike only. Unlimited. No restrictions.
// sponsor  = Paid subscriber or sponsor. Full access.
// demo     = Potential sponsor preview. Limited interactions.
// denied   = No access.

const ACCESS_TIERS = {
  // Owner key → Mike only
  "34d15903662964f9a53c99ae6ef53b4cc0290d87416be15111f5169f769ae094": "owner",
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
    // Show accessibility preferences screen before entering boardroom
    const gate = document.getElementById("gatekeeper-ui");
    const prefs = document.getElementById("prefsScreen");
    if (gate) gate.style.display = "none";
    if (prefs) prefs.style.display = "block";
    // Store the launch callback — preferences screen will call it
    window.__bozaLaunchBoardroom = function () {
      if (prefs) prefs.style.display = "none";
      if (typeof window.runWelcomeSequence === "function") {
        window.runWelcomeSequence();
      }
    };
    return { status: "ok", tier };
  }

  if (messageEl) {
    messageEl.textContent = "Access Denied. Governance Integrity Maintained.";
  }

  return { status: "denied", tier: "denied" };
}
