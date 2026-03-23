// Persona Avatar — Animated SVG face for the Bozaboard Governance Engine
// Lives inside the orb ring. Reacts to governance states.
// States: idle, listening, speaking, alert, thinking, celebrating

const SVGNS = "http://www.w3.org/2000/svg";

const EXPRESSIONS = {
  idle:        { eyeScale: 1, mouthCurve: 0,   glowColor: "rgba(212,175,55,0.35)",  glowRadius: 8,  pupilDrift: true  },
  listening:   { eyeScale: 1.15, mouthCurve: 0,   glowColor: "rgba(80,200,120,0.45)",  glowRadius: 12, pupilDrift: false },
  speaking:    { eyeScale: 1, mouthCurve: 0.3, glowColor: "rgba(80,200,120,0.55)",  glowRadius: 16, pupilDrift: false },
  alert:       { eyeScale: 1.3, mouthCurve:-0.2, glowColor: "rgba(255,100,80,0.50)",  glowRadius: 18, pupilDrift: false },
  thinking:    { eyeScale: 0.85, mouthCurve: 0,   glowColor: "rgba(212,175,55,0.50)",  glowRadius: 10, pupilDrift: true  },
  celebrating: { eyeScale: 1.1, mouthCurve: 0.5, glowColor: "rgba(80,200,120,0.65)",  glowRadius: 20, pupilDrift: false }
};

function el(tag, attrs = {}) {
  const node = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    node.setAttribute(k, String(v));
  }
  return node;
}

export function createPersonaAvatar({ size = 140 } = {}) {
  const cx = size / 2;
  const cy = size / 2;
  const faceR = size * 0.38;

  const svg = el("svg", {
    width: size,
    height: size,
    viewBox: `0 0 ${size} ${size}`,
    "aria-label": "Governance Persona Avatar",
    role: "img",
    style: "display:block;margin:auto;"
  });

  // ── Defs: glow filter ──
  const defs = el("defs");

  const filter = el("filter", { id: "persona-glow", x: "-50%", y: "-50%", width: "200%", height: "200%" });
  const feGauss = el("feGaussianBlur", { in: "SourceGraphic", stdDeviation: "4", result: "blur" });
  const feMerge = el("feMerge");
  const fmNode1 = el("feMergeNode", { in: "blur" });
  const fmNode2 = el("feMergeNode", { in: "SourceGraphic" });
  feMerge.appendChild(fmNode1);
  feMerge.appendChild(fmNode2);
  filter.appendChild(feGauss);
  filter.appendChild(feMerge);
  defs.appendChild(filter);
  svg.appendChild(defs);

  // ── Face circle (outer glow ring) ──
  const glowRing = el("circle", {
    cx, cy, r: faceR + 6,
    fill: "none",
    stroke: "rgba(212,175,55,0.35)",
    "stroke-width": 2,
    filter: "url(#persona-glow)"
  });
  svg.appendChild(glowRing);

  // ── Face base ──
  const face = el("circle", {
    cx, cy, r: faceR,
    fill: "rgba(18,18,18,0.85)",
    stroke: "rgba(212,175,55,0.55)",
    "stroke-width": 1.5
  });
  svg.appendChild(face);

  // ── Eyes ──
  const eyeOffsetX = faceR * 0.35;
  const eyeY = cy - faceR * 0.12;
  const eyeR = faceR * 0.14;
  const pupilR = eyeR * 0.5;

  // Left eye
  const leftEyeG = el("g");
  const leftEye = el("circle", { cx: cx - eyeOffsetX, cy: eyeY, r: eyeR, fill: "rgba(212,175,55,0.9)" });
  const leftPupil = el("circle", { cx: cx - eyeOffsetX, cy: eyeY, r: pupilR, fill: "#121212" });
  leftEyeG.appendChild(leftEye);
  leftEyeG.appendChild(leftPupil);
  svg.appendChild(leftEyeG);

  // Right eye
  const rightEyeG = el("g");
  const rightEye = el("circle", { cx: cx + eyeOffsetX, cy: eyeY, r: eyeR, fill: "rgba(212,175,55,0.9)" });
  const rightPupil = el("circle", { cx: cx + eyeOffsetX, cy: eyeY, r: pupilR, fill: "#121212" });
  rightEyeG.appendChild(rightEye);
  rightEyeG.appendChild(rightPupil);
  svg.appendChild(rightEyeG);

  // ── Mouth (quadratic bezier path) ──
  const mouthY = cy + faceR * 0.32;
  const mouthWidth = faceR * 0.45;
  const mouth = el("path", {
    d: `M ${cx - mouthWidth} ${mouthY} Q ${cx} ${mouthY} ${cx + mouthWidth} ${mouthY}`,
    fill: "none",
    stroke: "rgba(80,200,120,0.85)",
    "stroke-width": 2,
    "stroke-linecap": "round"
  });
  svg.appendChild(mouth);

  // ── State ──
  let currentState = "idle";
  let animFrame = null;
  let speakCycle = 0;
  let driftAngle = 0;

  function setMouthCurve(curve) {
    const curveOffset = curve * faceR * 0.28;
    mouth.setAttribute("d",
      `M ${cx - mouthWidth} ${mouthY} Q ${cx} ${mouthY + curveOffset} ${cx + mouthWidth} ${mouthY}`
    );
  }

  function setEyeScale(scale) {
    const r = eyeR * scale;
    leftEye.setAttribute("r", r);
    rightEye.setAttribute("r", r);
    leftPupil.setAttribute("r", pupilR * scale);
    rightPupil.setAttribute("r", pupilR * scale);
  }

  function setGlow(color, radius) {
    glowRing.setAttribute("stroke", color);
    feGauss.setAttribute("stdDeviation", String(radius / 2));
  }

  function setPupilOffset(dx, dy) {
    const maxDrift = eyeR * 0.25;
    leftPupil.setAttribute("cx", cx - eyeOffsetX + dx * maxDrift);
    leftPupil.setAttribute("cy", eyeY + dy * maxDrift);
    rightPupil.setAttribute("cx", cx + eyeOffsetX + dx * maxDrift);
    rightPupil.setAttribute("cy", eyeY + dy * maxDrift);
  }

  function animate() {
    const expr = EXPRESSIONS[currentState] || EXPRESSIONS.idle;

    // Pupil drift (idle/thinking)
    if (expr.pupilDrift) {
      driftAngle += 0.015;
      const dx = Math.sin(driftAngle) * 0.6;
      const dy = Math.cos(driftAngle * 0.7) * 0.3;
      setPupilOffset(dx, dy);
    } else {
      setPupilOffset(0, 0);
    }

    // Speaking mouth animation
    if (currentState === "speaking") {
      speakCycle += 0.18;
      const dynamicCurve = expr.mouthCurve + Math.sin(speakCycle) * 0.25;
      setMouthCurve(dynamicCurve);
    }

    animFrame = requestAnimationFrame(animate);
  }

  function setState(state) {
    if (!EXPRESSIONS[state]) state = "idle";
    if (state === currentState) return;

    currentState = state;
    const expr = EXPRESSIONS[state];

    setEyeScale(expr.eyeScale);
    setGlow(expr.glowColor, expr.glowRadius);

    if (state !== "speaking") {
      setMouthCurve(expr.mouthCurve);
      speakCycle = 0;
    }
  }

  function mapGovernanceState({ momentumTier, type, checkpoint }) {
    if (checkpoint) return "thinking";
    if (type === "risk" || type === "escalation") return "alert";
    if (momentumTier === "strong-positive") return "celebrating";
    if (momentumTier === "strong-negative") return "alert";
    if (type === "pause" || type === "uncertainty") return "thinking";
    if (type === "proceed" || type === "evaluation" || type === "priority") return "speaking";
    return "idle";
  }

  function start() {
    if (!animFrame) animate();
  }

  function stop() {
    if (animFrame) {
      cancelAnimationFrame(animFrame);
      animFrame = null;
    }
  }

  // Auto-start
  start();

  return {
    el: svg,
    setState,
    mapGovernanceState,
    start,
    stop,
    getState: () => currentState
  };
}
