import { Markdown } from "./markdown.js";
import { parseCodeBlocks } from "./parseCodeBlocks.js";
import { parseHorizontalRules } from "./parseHorizontalRules.js";
import { parseHeadings } from "./parseHeadings.js";
import { parseLists } from "./parseLists.js";
import { wrapBBnCC, wrapReset, getSessionState, getBozafireGreeting, getDemoGreeting, DEMO_TOUR } from "./lovesfire.js";
import { isDemoMode, hasFullAccess, getDemoLimits } from "./AccessKey.js";
import { createPersonaController } from "./persona-controller.js";

const RESONANCE_DELAY_MS = 65;

const SPONSOR_COPY = {
  bronze: {
    label: "Bronze",
    copyLabel: "Copy Steward Contact Email",
    value: "Bozitivez@outlook.com"
  },
  gold: {
    label: "Gold",
    copyLabel: "Copy Funding Handle",
    value: "Send e-transfer to: boswellmike68@gmail.com"
  },
  founding: {
    label: "Founding Steward",
    copyLabel: "Copy Founding Steward Handle",
    value: "Bozitivez@outlook.com"
  }
};

const PILLAR_SOURCES = {
  governance: "pillars/governance.md",
  blueprint: "pillars/blueprint.md",
  launch: "pillars/launch.md"
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function copyToClipboard(text) {
  const value = String(text ?? "");

  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(value);
      return { status: "ok" };
    }
  } catch {
    // fall through
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = value;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    return { status: "ok" };
  } catch {
    return { status: "error" };
  }
}

async function typeInto(el, text, { delayMs, safeMode } = {}) {
  const delay = delayMs ?? RESONANCE_DELAY_MS;

  if (safeMode) {
    el.textContent = text;
    return;
  }

  el.textContent = "";
  for (const ch of text) {
    el.textContent += ch;
    await sleep(delay);
  }
}

function setSafeMode(enabled) {
  document.body.dataset.safeMode = enabled ? "1" : "0";
  localStorage.setItem("bozaboard.safeMode", enabled ? "1" : "0");
}

function getSafeMode() {
  return localStorage.getItem("bozaboard.safeMode") === "1";
}

let markdownHandlersRegistered = false;

function ensureMarkdownHandlers() {
  if (markdownHandlersRegistered) return;

  Markdown.use(parseCodeBlocks);
  Markdown.use(parseHorizontalRules);
  Markdown.use(parseHeadings);
  Markdown.use(parseLists);

  Markdown.use((html) => {
    const parts = String(html).split(/(<pre class="br-code">[\s\S]*?<\/pre>)/g);
    return parts
      .map((part) => {
        if (part.startsWith("<pre class=\"br-code\">")) return part;
        return part
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em>$1</em>");
      })
      .join("");
  });

  Markdown.use((text) => {
    const parts = String(text).split(/(<pre class="br-code">[\s\S]*?<\/pre>)/g);
    const out = [];

    for (const part of parts) {
      if (part.startsWith("<pre class=\"br-code\">")) {
        out.push(part);
        continue;
      }

      const lines = part.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed === "") {
          out.push("<br>");
          continue;
        }

        if (trimmed.startsWith("<")) {
          out.push(line);
          continue;
        }

        out.push(`<p>${line}</p>`);
      }
    }

    return out.join("\n");
  });

  markdownHandlersRegistered = true;
}

async function loadPillarMarkdown(pillarName) {
  const src = PILLAR_SOURCES[pillarName];
  if (!src) {
    return { status: "error", html: "<p>Pillar not found.</p>" };
  }

  try {
    const response = await fetch(`./${src}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const raw = await response.text();
    ensureMarkdownHandlers();
    const html = Markdown.render(raw);
    return { status: "ok", html };
  } catch {
    return { status: "error", html: "<p>Unable to load pillar content.</p>" };
  }
}

function createOrbRing({ tooltipEl }) {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const r = 92;

  const perspectives = [
    "Environmental Impact",
    "Financial Stability",
    "Social Vitality",
    "Operational Safety",
    "Compliance & Audit",
    "Accessibility & ABI",
    "System Integrity",
    "Risk Containment",
    "Human Clarity",
    "Execution Readiness",
    "Long-Horizon Resilience",
    "Stakeholder Trust",
    "Innovation Discipline"
  ];

  const svgNs = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNs, "svg");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
  svg.classList.add("orbs");

  const ring = document.createElementNS(svgNs, "circle");
  ring.setAttribute("cx", String(cx));
  ring.setAttribute("cy", String(cy));
  ring.setAttribute("r", String(r));
  ring.setAttribute("fill", "none");
  ring.setAttribute("stroke", "rgba(212,175,55,0.35)");
  ring.setAttribute("stroke-width", "2");
  svg.appendChild(ring);

  const orbs = [];
  for (let i = 0; i < 13; i++) {
    const a = (Math.PI * 2 * i) / 13 - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;

    const c = document.createElementNS(svgNs, "circle");
    c.setAttribute("cx", x.toFixed(2));
    c.setAttribute("cy", y.toFixed(2));
    c.setAttribute("r", "10");
    c.classList.add("orb");
    c.dataset.perspective = perspectives[i];

    c.addEventListener("mouseenter", (ev) => {
      const rect = svg.getBoundingClientRect();
      tooltipEl.textContent = c.dataset.perspective;
      tooltipEl.style.left = `${ev.clientX - rect.left + 12}px`;
      tooltipEl.style.top = `${ev.clientY - rect.top + 12}px`;
      tooltipEl.dataset.visible = "1";
    });

    c.addEventListener("mouseleave", () => {
      tooltipEl.dataset.visible = "0";
    });

    svg.appendChild(c);
    orbs.push(c);
  }

  function setMissionActive(isActive) {
    for (const c of orbs) {
      if (isActive) c.dataset.active = "1";
      else delete c.dataset.active;
    }
  }

  return { svg, setMissionActive };
}

function pillarSpec() {
  return [
    {
      id: "governance",
      title: "Governance",
      subtitle: "Ethical Framework (View-Only)",
      content:
        "View-only governance frame. No write operations. No external calls. Steward privacy is absolute."
    },
    {
      id: "blueprint",
      title: "Blueprint",
      subtitle: "Hemp-Phyto Discovery (High-Level)",
      content:
        "Summary only. Location is aliased and redacted. Work sites: Sector Alpha (The Field) and Command Center (Main Office)."
    },
    {
      id: "launch",
      title: "Launch Protocol",
      subtitle: "Public Rollout Status",
      content:
        "Status: Private Boardroom build in progress. Outputs are deterministic and local-first."
    },
    {
      id: "advisory",
      title: "Advisory Portal",
      subtitle: "Primary interaction surface",
      content: null
    }
  ];
}

function createAdvisoryPortal({ safeModeGetter, orbController, personaController }) {
  const wrap = document.createElement("div");
  wrap.className = "advisory";

  const log = document.createElement("div");
  log.className = "advisory-log";

  let greeted = false;

  const status = document.createElement("div");
  status.className = "advisory-hint";
  status.innerHTML = "Momentum: <code>neutral</code> · Turns: <code>0</code>";

  const input = document.createElement("input");
  input.className = "advisory-input";
  input.type = "text";
  input.placeholder = "Speak to Bozafire… (try: proceed, evaluate risk, pause, align, escalate, reflect)";

  const hint = document.createElement("div");
  hint.className = "advisory-hint";
  hint.innerHTML =
    "Mission keyword: <code>Fix the Planet</code> (activates orbs) · <code>reset</code> (clear session)";

  function updateStatus(session) {
    if (!session) return;
    const tier = session.momentumTier || session.momentum !== undefined
      ? (session.momentumTier || "neutral") : "neutral";
    const turns = session.turns || session.count || 0;
    const mom = session.momentum || 0;
    status.innerHTML =
      `Momentum: <code>${tier} (${mom >= 0 ? "+" : ""}${mom})</code> · Turns: <code>${turns}</code>`;
  }

  async function append(role, text, persona) {
    const line = document.createElement("div");
    line.className = `line line-${role}`;

    const label = document.createElement("span");
    label.className = "line-label";
    label.textContent = role === "steward" ? "Steward" : (persona || "Committee");

    const msg = document.createElement("span");
    msg.className = "line-msg";

    line.appendChild(label);
    line.appendChild(msg);
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;

    await typeInto(msg, text, { safeMode: safeModeGetter() });
  }

  input.addEventListener("focus", () => {
    if (personaController) personaController.setListening(true);
  });

  input.addEventListener("blur", () => {
    if (personaController) personaController.setListening(false);
  });

  input.addEventListener("keydown", async (e) => {
    if (e.key !== "Enter") return;
    const text = input.value.trim();
    if (!text) return;

    // Demo mode: enforce interaction limit
    if (isDemoMode()) {
      const limits = getDemoLimits();
      window.__bozaboardDemoCount = (window.__bozaboardDemoCount || 0) + 1;
      if (window.__bozaboardDemoCount > limits.maxAdvisories) {
        input.value = "";
        if (typeof window.showPaywall === "function") window.showPaywall();
        return;
      }
    }

    input.value = "";
    if (personaController) personaController.setListening(false);
    await append("steward", text);

    const lower = text.toLowerCase();

    if (lower === "reset" || lower === "reset session") {
      const result = wrapReset();
      orbController.setMissionActive(false);
      updateStatus(result.session);
      await append("boardroom", result.message, result.voice);
      return;
    }

    const missionActive = lower.includes("fix the planet");
    if (missionActive) {
      orbController.setMissionActive(true);
      await append("boardroom", "Mission acknowledged: Fix the Planet. Consensus ring synchronized. All 13 perspectives active.", "Bozafire · Alignment");
    }

    const result = wrapBBnCC(text);

    if (result.type === "casual") {
      // Casual conversation — Bozafire talks, no governance animation
      await append("boardroom", result.message, result.voice);
      if (personaController) {
        personaController.onAdvisory({
          persona: "Alignment Chair",
          type: "general",
          message: result.message,
          session: result.session
        });
      }
    } else {
      // Governance path — full engine response
      const isMomentumPositive = result.session &&
        (result.session.momentumTier === "positive" || result.session.momentumTier === "strong-positive");
      if (!missionActive) {
        orbController.setMissionActive(isMomentumPositive);
      }

      updateStatus(result.session);

      const prefix = result.checkpoint ? "[CHECKPOINT] " : "";
      await append("boardroom", prefix + result.message, result.voice);

      // Trigger persona face + voice
      if (personaController) {
        personaController.onAdvisory(result.raw);
      }
    }
  });

  wrap.appendChild(log);
  wrap.appendChild(status);
  wrap.appendChild(input);
  wrap.appendChild(hint);

  // Bozafire greeting on first view
  setTimeout(async () => {
    if (!greeted) {
      greeted = true;
      const greeting = isDemoMode() ? getDemoGreeting() : getBozafireGreeting();
      await append("boardroom", greeting, "Bozafire");
    }
  }, 200);

  return wrap;
}

function normalizePillarId(raw) {
  const t = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (!t) return null;

  if (t === "gov" || t === "govern" || t === "governance") return "governance";
  if (t === "blue" || t === "blueprint") return "blueprint";
  if (t === "launch" || t === "protocol") return "launch";
  if (t === "advisory" || t === "portal") return "advisory";

  return null;
}

function createStewardAgent({
  safeModeGetter,
  setActivePillar,
  showSponsorModal,
  appendAuditLine,
  appendStewardLine,
  appendAgentLine
}) {
  function audit(action, payload) {
    const msg = payload === undefined ? action : `${action} ${JSON.stringify(payload)}`;
    appendAuditLine(msg);
  }

  async function explainPillar(pillarId) {
    if (!pillarId) {
      await appendAgentLine(
        "Which pillar? Try: explain governance | explain blueprint | explain launch."
      );
      return;
    }

    audit("AI_ACTION: explain", { pillarId });
    const loaded = await loadPillarMarkdown(pillarId);
    const plain = String(loaded.html)
      .replace(/<pre class="br-code">[\s\S]*?<\/pre>/g, "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (loaded.status !== "ok") {
      await appendAgentLine("I could not load that pillar right now.");
      return;
    }

    const maxLen = 520;
    const snippet = plain.length > maxLen ? `${plain.slice(0, maxLen)}…` : plain;
    await appendAgentLine(snippet || "Pillar loaded (no plain text available).");
  }

  async function openPillar(pillarId) {
    if (!pillarId) {
      await appendAgentLine(
        "Which pillar? Try: open governance | open blueprint | open launch | open advisory."
      );
      return;
    }

    audit("AI_ACTION: openPillar", { pillarId });
    await setActivePillar(pillarId);
    await appendAgentLine(`Opened: ${pillarId}.`);
  }

  async function runDemo() {
    audit("AI_ACTION: demo", { version: 1 });

    await appendAgentLine(
      "Demo mode engaged. I will guide a short governed walkthrough: Blueprint → Governance → Launch → Sponsor."
    );

    await openPillar("blueprint");
    await sleep(500);
    await appendAgentLine(
      "Blueprint: local-first discovery summary with privacy redaction and aliased locations."
    );
    await sleep(550);

    await openPillar("governance");
    await sleep(500);
    await appendAgentLine(
      "Governance: neutrality protocol, privacy constraints, and view-only posture. This agent is constrained by these rules."
    );
    await sleep(550);

    await openPillar("launch");
    await sleep(500);
    await appendAgentLine(
      "Launch Protocol: sponsor-ready packaging focuses on deterministic UX, clear docs, and reproducible demos."
    );
    await sleep(550);

    audit("AI_ACTION: showSponsorModal");
    showSponsorModal(true);
    await appendAgentLine(
      "Sponsor panel is open. You can copy contact/funding details directly—local-first, no tracking."
    );
    await sleep(450);

    await appendAgentLine(
      "Demo complete. Commands: help | open <pillar> | explain <pillar> | show sponsor | demo."
    );
  }

  async function showSponsor() {
    audit("AI_ACTION: showSponsorModal");
    showSponsorModal(true);
    await appendAgentLine("Sponsor panel opened.");
  }

  function helpText() {
    return (
      "Governed commands:\n" +
      "- demo\n" +
      "- open governance | open blueprint | open launch | open advisory\n" +
      "- explain governance | explain blueprint | explain launch\n" +
      "- show sponsor\n" +
      "Notes: offline, pillar-sourced only, audited actions."
    );
  }

  async function handleInput(raw) {
    const text = String(raw ?? "").trim();
    if (!text) return;

    audit("AI_INPUT", { text });

    const lower = text.toLowerCase();
    const parts = lower.split(/\s+/).filter(Boolean);
    const cmd = parts[0];

    if (cmd === "help" || cmd === "?" || cmd === "commands") {
      await appendAgentLine(helpText());
      return;
    }

    if (cmd === "demo") {
      await runDemo();
      return;
    }

    if (cmd === "open") {
      const pillarId = normalizePillarId(parts.slice(1).join(" "));
      await openPillar(pillarId);
      return;
    }

    if (cmd === "explain") {
      const pillarId = normalizePillarId(parts.slice(1).join(" "));
      await explainPillar(pillarId);
      return;
    }

    if (cmd === "show" && parts[1] === "sponsor") {
      await showSponsor();
      return;
    }

    if (cmd === "sponsor") {
      await showSponsor();
      return;
    }

    await appendAgentLine(
      "Unrecognized command. Try: help | demo | open governance | explain blueprint | show sponsor."
    );
  }

  return {
    handleInput,
    helpText
  };
}

export function bootBoardroom() {
  const gate = document.getElementById("gatekeeper-ui");
  const dashboard = document.getElementById("boardroom-ui");
  const greeter = document.getElementById("greeter-message");

  const safeModeBtn = document.getElementById("safeModeBtn");
  const sponsorBtn = document.getElementById("sponsorBtn");
  const sponsorModal = document.getElementById("sponsorModal");
  const sponsorClose = document.getElementById("sponsorClose");
  const sponsorToast = document.getElementById("sponsorToast");

  const stewardBtn = document.getElementById("stewardBtn");
  const stewardModal = document.getElementById("stewardModal");
  const stewardClose = document.getElementById("stewardClose");
  const stewardLog = document.getElementById("stewardLog");
  const stewardInput = document.getElementById("stewardInput");
  const stewardAudit = document.getElementById("stewardAudit");

  function setSponsorModalOpen(open) {
    if (!sponsorModal) return;
    sponsorModal.dataset.open = open ? "1" : "0";
    sponsorModal.setAttribute("aria-hidden", open ? "false" : "true");
  }

  function setStewardModalOpen(open) {
    if (!stewardModal) return;
    stewardModal.dataset.open = open ? "1" : "0";
    stewardModal.setAttribute("aria-hidden", open ? "false" : "true");

    if (open && stewardInput) {
      window.setTimeout(() => stewardInput.focus(), 10);
    }
  }

  async function sponsorCopy(kind) {
    const spec = SPONSOR_COPY[kind];
    if (!spec) return;

    const res = await copyToClipboard(spec.value);
    if (sponsorToast) {
      sponsorToast.textContent =
        res.status === "ok" ? "Copied." : "Copy failed (clipboard unavailable).";
      sponsorToast.dataset.visible = "1";
      window.setTimeout(() => {
        sponsorToast.dataset.visible = "0";
      }, 1200);
    }
  }
  // ── Persona Controller ──
  const persona = createPersonaController({ avatarSize: 130, safeMode: getSafeMode() });
  const personaMount = document.getElementById("personaMount");
  if (personaMount) {
    personaMount.insertBefore(persona.avatar.el, personaMount.firstChild);
  }

  // ── Voice Toggle ──
  const voiceBtn = document.getElementById("voiceBtn");
  if (voiceBtn) {
    const initVoice = persona.getVoiceEnabled();
    voiceBtn.textContent = initVoice ? "Voice: ON" : "Voice: OFF";
    voiceBtn.dataset.active = initVoice ? "1" : "0";

    voiceBtn.addEventListener("click", () => {
      const nowOn = persona.toggleVoice();
      voiceBtn.textContent = nowOn ? "Voice: ON" : "Voice: OFF";
      voiceBtn.dataset.active = nowOn ? "1" : "0";
    });
  }

  const safeModeState = getSafeMode();
  setSafeMode(safeModeState);
  safeModeBtn.textContent = safeModeState ? "Safe Mode: ON" : "Safe Mode: OFF";

  safeModeBtn.addEventListener("click", () => {
    const next = !getSafeMode();
    setSafeMode(next);
    safeModeBtn.textContent = next ? "Safe Mode: ON" : "Safe Mode: OFF";
    persona.setSafeMode(next);
  });

  if (sponsorBtn && sponsorModal) {
    sponsorBtn.addEventListener("click", () => setSponsorModalOpen(true));

    sponsorModal.addEventListener("click", (e) => {
      if (e.target === sponsorModal) setSponsorModalOpen(false);
    });

    if (sponsorClose) {
      sponsorClose.addEventListener("click", () => setSponsorModalOpen(false));
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setSponsorModalOpen(false);
    });

    const copyBtns = sponsorModal.querySelectorAll("[data-sponsor-copy]");
    for (const btn of copyBtns) {
      btn.addEventListener("click", () => sponsorCopy(btn.dataset.sponsorCopy));
    }
  }

  function appendAuditLine(text) {
    if (!stewardAudit) return;
    const div = document.createElement("div");
    div.className = "audit-line";
    div.textContent = text;
    stewardAudit.appendChild(div);
    stewardAudit.scrollTop = stewardAudit.scrollHeight;
  }

  async function appendStewardLine(text) {
    if (!stewardLog) return;
    const line = document.createElement("div");
    line.className = "line line-steward";

    const label = document.createElement("span");
    label.className = "line-label";
    label.textContent = "Steward";

    const msg = document.createElement("span");
    msg.className = "line-msg";

    line.appendChild(label);
    line.appendChild(msg);
    stewardLog.appendChild(line);
    stewardLog.scrollTop = stewardLog.scrollHeight;

    await typeInto(msg, text, { safeMode: safeModeGetter() });
  }

  async function appendAgentLine(text) {
    if (!stewardLog) return;
    const line = document.createElement("div");
    line.className = "line line-boardroom";

    const label = document.createElement("span");
    label.className = "line-label";
    label.textContent = "Steward AI";

    const msg = document.createElement("span");
    msg.className = "line-msg";

    line.appendChild(label);
    line.appendChild(msg);
    stewardLog.appendChild(line);
    stewardLog.scrollTop = stewardLog.scrollHeight;

    await typeInto(msg, text, { safeMode: safeModeGetter() });
  }

  const tooltipEl = document.getElementById("orbTooltip");
  const orbController = createOrbRing({ tooltipEl });
  document.getElementById("orbRingMount").appendChild(orbController.svg);

  const pillarNav = document.getElementById("pillarNav");
  const pillarTitle = document.getElementById("pillarTitle");
  const pillarSub = document.getElementById("pillarSubtitle");
  const pillarBody = document.getElementById("pillarBody");

  const safeModeGetter = () => getSafeMode();

  const specs = pillarSpec();

  async function setActivePillar(id) {
    for (const b of pillarNav.querySelectorAll("button")) {
      if (b.dataset.pillar === id) b.dataset.active = "1";
      else delete b.dataset.active;
    }

    const spec = specs.find((s) => s.id === id) ?? specs[0];
    pillarTitle.textContent = spec.title;
    pillarSub.textContent = spec.subtitle;

    pillarBody.innerHTML = "";

    if (spec.id === "advisory") {
      pillarBody.appendChild(
        createAdvisoryPortal({ safeModeGetter, orbController, personaController: persona })
      );
      return;
    }

    const loaded = await loadPillarMarkdown(spec.id);
    const mount = document.createElement("div");
    mount.className = "pillar-fade";
    pillarBody.appendChild(mount);

    mount.innerHTML = loaded.html;
  }

  const stewardAgent = createStewardAgent({
    safeModeGetter,
    setActivePillar,
    showSponsorModal: (open) => setSponsorModalOpen(Boolean(open)),
    appendAuditLine,
    appendStewardLine,
    appendAgentLine
  });

  if (stewardBtn && stewardModal) {
    stewardBtn.addEventListener("click", async () => {
      if (isDemoMode()) {
        // Demo users cannot access Steward AI
        const advisory = document.querySelector(".advisory-log");
        if (advisory) {
          const line = document.createElement("div");
          line.className = "line line-boardroom";
          line.innerHTML = '<span class="line-label">Bozafire</span><span class="line-msg">Steward AI is available to sponsors and subscribers. Become a sponsor to unlock full Boardroom access.</span>';
          advisory.appendChild(line);
          advisory.scrollTop = advisory.scrollHeight;
        }
        return;
      }
      setStewardModalOpen(true);
      appendAuditLine("AI_SESSION: open");
      if (stewardLog && stewardLog.childElementCount === 0) {
        await appendAgentLine(stewardAgent.helpText());
      }
    });

    stewardModal.addEventListener("click", (e) => {
      if (e.target === stewardModal) setStewardModalOpen(false);
    });

    if (stewardClose) {
      stewardClose.addEventListener("click", () => setStewardModalOpen(false));
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setStewardModalOpen(false);
    });

    if (stewardInput) {
      stewardInput.addEventListener("keydown", async (e) => {
        if (e.key !== "Enter") return;
        const text = stewardInput.value.trim();
        if (!text) return;
        stewardInput.value = "";
        await appendStewardLine(text);
        await stewardAgent.handleInput(text);
      });
    }
  }

  for (const spec of specs) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = spec.title;
    btn.dataset.pillar = spec.id;
    btn.addEventListener("click", () => setActivePillar(spec.id));
    pillarNav.appendChild(btn);
  }

  setActivePillar("governance");

  window.runWelcomeSequence = async function runWelcomeSequence() {
    const safeMode = safeModeGetter();
    const demoMode = isDemoMode();
    const greeting = demoMode ? getDemoGreeting() : getBozafireGreeting();
    const suffix = demoMode
      ? " Bozafire will guide you through the full experience. Sit back."
      : " The 13 Orbs are synchronized. Resonance is locked at 0.85x. The Boardroom is yours.";
    const fullMessage = greeting + suffix;

    greeter.textContent = "";
    greeter.style.opacity = "0";

    if (safeMode) {
      greeter.textContent = fullMessage;
      greeter.style.opacity = "1";
    } else {
      greeter.style.transition = "opacity 2s linear";
      greeter.textContent = fullMessage;
      await sleep(25);
      greeter.style.opacity = "1";
      persona.welcome(fullMessage);
      await sleep(2000);
    }

    if (gate) gate.style.display = "none";
    if (dashboard) {
      dashboard.style.display = "block";
      dashboard.setAttribute("aria-hidden", "false");
    }

    // Demo mode: auto-navigate to advisory portal for guided tour
    if (demoMode) {
      await sleep(1500);
      setActivePillar("advisory");
    }
  };
}

export function privacySelfCheck() {
  const banned = [
    "blenheim",
    "tilbury",
    "chatham-kent",
    "ontario"
  ];

  const text = document.documentElement.innerText.toLowerCase();
  for (const b of banned) {
    if (text.includes(b)) return { status: "fail", banned: b };
  }

  return { status: "ok" };
}
