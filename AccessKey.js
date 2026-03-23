const DEFAULT_SECURE_HASH =
  "76faa0295e4f0a68c6ab2dac601d308a7170260be3f245eb3b63a784e4a03824";

async function sha256Hex(input) {
  const msgUint8 = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyAccess(options = {}) {
  const inputEl = document.getElementById("accessKey");
  const messageEl = document.getElementById("greeter-message");

  const raw = inputEl ? inputEl.value : "";
  const secureHash = options.secureHash ?? DEFAULT_SECURE_HASH;

  const hashHex = await sha256Hex(raw);

  if (hashHex === secureHash) {
    if (typeof window.runWelcomeSequence === "function") {
      window.runWelcomeSequence();
    }
    return { status: "ok" };
  }

  if (messageEl) {
    messageEl.textContent = "Access Denied. Governance Integrity Maintained.";
  }

  return { status: "denied" };
}
