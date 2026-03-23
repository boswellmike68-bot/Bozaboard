// Persona Avatar — Realistic humanlike Bozafire face for the Bozaboard Governance Engine
// Lives inside the orb ring. Reacts to governance states.
// States: idle, listening, speaking, alert, thinking, celebrating
// Design: Mature male, goatee, aviator sunglasses w/ amber glow, circuit patterns, tech suit collar

const SVGNS = "http://www.w3.org/2000/svg";

const EXPRESSIONS = {
  idle:        { lensGlow: 0.6, mouthCurve: 0.12, glowColor: "rgba(212,175,55,0.35)", glowRadius: 8,  circuitAlpha: 0.2, collarGlow: 0.4 },
  listening:   { lensGlow: 0.85, mouthCurve: 0.05, glowColor: "rgba(80,200,120,0.45)", glowRadius: 12, circuitAlpha: 0.4, collarGlow: 0.6 },
  speaking:    { lensGlow: 0.75, mouthCurve: 0.18, glowColor: "rgba(80,200,120,0.55)", glowRadius: 16, circuitAlpha: 0.35, collarGlow: 0.7 },
  alert:       { lensGlow: 1.0,  mouthCurve:-0.1,  glowColor: "rgba(255,100,80,0.50)", glowRadius: 18, circuitAlpha: 0.6, collarGlow: 0.9 },
  thinking:    { lensGlow: 0.45, mouthCurve: 0.02, glowColor: "rgba(212,175,55,0.50)", glowRadius: 10, circuitAlpha: 0.5, collarGlow: 0.5 },
  celebrating: { lensGlow: 1.0,  mouthCurve: 0.3,  glowColor: "rgba(80,200,120,0.65)", glowRadius: 20, circuitAlpha: 0.45, collarGlow: 1.0 }
};

function el(tag, attrs = {}) {
  const node = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    node.setAttribute(k, String(v));
  }
  return node;
}

export function createPersonaAvatar({ size = 140 } = {}) {
  // Work in a 200x200 viewBox for detail, scale via size
  const VB = 200;
  const cx = 100, cy = 92;

  const svg = el("svg", {
    width: size,
    height: size,
    viewBox: `0 0 ${VB} ${VB}`,
    "aria-label": "Bozafire — Governance Persona",
    role: "img",
    style: "display:block;margin:auto;"
  });

  // ── Defs ──
  const defs = el("defs");

  // Glow filter
  const fGlow = el("filter", { id: "p-glow", x: "-50%", y: "-50%", width: "200%", height: "200%" });
  const feGauss = el("feGaussianBlur", { in: "SourceGraphic", stdDeviation: "4", result: "blur" });
  const feM = el("feMerge");
  feM.appendChild(el("feMergeNode", { in: "blur" }));
  feM.appendChild(el("feMergeNode", { in: "SourceGraphic" }));
  fGlow.appendChild(feGauss);
  fGlow.appendChild(feM);
  defs.appendChild(fGlow);

  // Lens glow filter
  const fLens = el("filter", { id: "p-lens-glow", x: "-30%", y: "-30%", width: "160%", height: "160%" });
  fLens.appendChild(el("feGaussianBlur", { in: "SourceGraphic", stdDeviation: "3" }));
  defs.appendChild(fLens);

  // Skin gradient
  const skinGrad = el("linearGradient", { id: "skin-grad", x1: "0", y1: "0", x2: "0", y2: "1" });
  const s1 = el("stop", { offset: "0%", "stop-color": "#c4956a" });
  const s2 = el("stop", { offset: "100%", "stop-color": "#a07050" });
  skinGrad.appendChild(s1);
  skinGrad.appendChild(s2);
  defs.appendChild(skinGrad);

  // Lens gradient (amber)
  const lensGrad = el("radialGradient", { id: "lens-grad", cx: "0.4", cy: "0.35", r: "0.65" });
  lensGrad.appendChild(el("stop", { offset: "0%", "stop-color": "#ffcc44" }));
  lensGrad.appendChild(el("stop", { offset: "60%", "stop-color": "#d4a020" }));
  lensGrad.appendChild(el("stop", { offset: "100%", "stop-color": "#8b6914" }));
  defs.appendChild(lensGrad);

  // Hair gradient
  const hairGrad = el("linearGradient", { id: "hair-grad", x1: "0", y1: "0", x2: "0", y2: "1" });
  hairGrad.appendChild(el("stop", { offset: "0%", "stop-color": "#3a2a1a" }));
  hairGrad.appendChild(el("stop", { offset: "100%", "stop-color": "#2a1c10" }));
  defs.appendChild(hairGrad);

  // Collar gradient
  const collarGrad = el("linearGradient", { id: "collar-grad", x1: "0", y1: "0", x2: "0", y2: "1" });
  collarGrad.appendChild(el("stop", { offset: "0%", "stop-color": "#1a2a3a" }));
  collarGrad.appendChild(el("stop", { offset: "100%", "stop-color": "#0d1520" }));
  defs.appendChild(collarGrad);

  // Clip for face
  const faceClip = el("clipPath", { id: "face-clip" });
  faceClip.appendChild(el("ellipse", { cx: 100, cy: 92, rx: 52, ry: 62 }));
  defs.appendChild(faceClip);

  svg.appendChild(defs);

  // ── Outer glow ring ──
  const glowRing = el("ellipse", {
    cx: 100, cy: 100, rx: 90, ry: 92,
    fill: "none",
    stroke: "rgba(212,175,55,0.35)",
    "stroke-width": 1.5,
    filter: "url(#p-glow)"
  });
  svg.appendChild(glowRing);

  // ── Tech suit collar / shoulders ──
  const collar = el("path", {
    d: "M 30,160 Q 40,135 60,130 L 80,128 Q 100,126 120,128 L 140,130 Q 160,135 170,160 L 170,200 L 30,200 Z",
    fill: "url(#collar-grad)",
    stroke: "rgba(80,200,120,0.3)",
    "stroke-width": 1
  });
  svg.appendChild(collar);

  // Collar glow lines
  const collarLine1 = el("path", {
    d: "M 55,140 Q 100,132 145,140",
    fill: "none",
    stroke: "rgba(80,200,120,0.4)",
    "stroke-width": 1.5,
    "stroke-linecap": "round"
  });
  const collarLine2 = el("path", {
    d: "M 45,155 Q 100,145 155,155",
    fill: "none",
    stroke: "rgba(0,180,220,0.3)",
    "stroke-width": 1,
    "stroke-linecap": "round"
  });
  svg.appendChild(collarLine1);
  svg.appendChild(collarLine2);

  // Collar center orb (Bozitivez Z)
  const orbG = el("g");
  orbG.appendChild(el("circle", { cx: 100, cy: 148, r: 8, fill: "rgba(0,0,0,0.7)", stroke: "rgba(80,200,120,0.6)", "stroke-width": 1 }));
  orbG.appendChild(el("circle", { cx: 100, cy: 148, r: 4, fill: "rgba(0,180,220,0.7)" }));
  svg.appendChild(orbG);

  // ── Neck ──
  svg.appendChild(el("rect", { x: 85, y: 122, width: 30, height: 18, rx: 4, fill: "url(#skin-grad)", opacity: 0.9 }));

  // ── Face shape (oval jaw) ──
  const faceShape = el("ellipse", {
    cx: 100, cy: 92, rx: 52, ry: 62,
    fill: "url(#skin-grad)"
  });
  svg.appendChild(faceShape);

  // ── Jaw shadow ──
  svg.appendChild(el("ellipse", { cx: 100, cy: 118, rx: 40, ry: 12, fill: "rgba(0,0,0,0.12)" }));

  // ── Hair ──
  const hair = el("path", {
    d: "M 48,72 Q 48,32 100,28 Q 152,32 152,72 L 152,60 Q 150,38 100,34 Q 50,38 48,60 Z",
    fill: "url(#hair-grad)"
  });
  svg.appendChild(hair);

  // Hair sides
  svg.appendChild(el("path", {
    d: "M 48,60 Q 46,72 48,85 Q 49,75 52,68 Z",
    fill: "url(#hair-grad)"
  }));
  svg.appendChild(el("path", {
    d: "M 152,60 Q 154,72 152,85 Q 151,75 148,68 Z",
    fill: "url(#hair-grad)"
  }));

  // ── Eyebrows ──
  const leftBrow = el("path", {
    d: "M 64,72 Q 76,67 88,71",
    fill: "none", stroke: "#2a1c10", "stroke-width": 2.5, "stroke-linecap": "round"
  });
  const rightBrow = el("path", {
    d: "M 112,71 Q 124,67 136,72",
    fill: "none", stroke: "#2a1c10", "stroke-width": 2.5, "stroke-linecap": "round"
  });
  svg.appendChild(leftBrow);
  svg.appendChild(rightBrow);

  // ── Nose ──
  svg.appendChild(el("path", {
    d: "M 100,80 L 97,100 Q 93,104 96,105 L 100,106 L 104,105 Q 107,104 103,100 Z",
    fill: "rgba(160,112,80,0.6)", stroke: "none"
  }));

  // ── Aviator Sunglasses ──
  const glassesG = el("g");

  // Bridge
  glassesG.appendChild(el("path", {
    d: "M 88,82 Q 100,78 112,82",
    fill: "none", stroke: "#444", "stroke-width": 2, "stroke-linecap": "round"
  }));

  // Left lens shape
  const leftLensPath = "M 60,78 Q 60,70 72,70 L 86,70 Q 90,70 90,78 L 90,90 Q 90,98 82,98 L 68,98 Q 60,98 60,90 Z";
  // Right lens shape
  const rightLensPath = "M 110,78 Q 110,70 118,70 L 132,70 Q 140,70 140,78 L 140,90 Q 140,98 132,98 L 118,98 Q 110,98 110,90 Z";

  // Lens backgrounds (dark)
  glassesG.appendChild(el("path", { d: leftLensPath, fill: "rgba(30,20,10,0.85)" }));
  glassesG.appendChild(el("path", { d: rightLensPath, fill: "rgba(30,20,10,0.85)" }));

  // Lens amber glow overlays
  const leftLensGlow = el("path", {
    d: leftLensPath,
    fill: "url(#lens-grad)",
    opacity: 0.6,
    filter: "url(#p-lens-glow)"
  });
  const rightLensGlow = el("path", {
    d: rightLensPath,
    fill: "url(#lens-grad)",
    opacity: 0.6,
    filter: "url(#p-lens-glow)"
  });
  glassesG.appendChild(leftLensGlow);
  glassesG.appendChild(rightLensGlow);

  // Lens reflection highlights
  glassesG.appendChild(el("ellipse", { cx: 72, cy: 78, rx: 8, ry: 4, fill: "rgba(255,255,200,0.15)" }));
  glassesG.appendChild(el("ellipse", { cx: 122, cy: 78, rx: 8, ry: 4, fill: "rgba(255,255,200,0.15)" }));

  // Frame
  glassesG.appendChild(el("path", { d: leftLensPath, fill: "none", stroke: "#555", "stroke-width": 2 }));
  glassesG.appendChild(el("path", { d: rightLensPath, fill: "none", stroke: "#555", "stroke-width": 2 }));

  // Temples (arms going to ears)
  glassesG.appendChild(el("path", {
    d: "M 60,78 Q 52,78 48,82",
    fill: "none", stroke: "#555", "stroke-width": 2, "stroke-linecap": "round"
  }));
  glassesG.appendChild(el("path", {
    d: "M 140,78 Q 148,78 152,82",
    fill: "none", stroke: "#555", "stroke-width": 2, "stroke-linecap": "round"
  }));

  svg.appendChild(glassesG);

  // ── Mouth / smile ──
  const mouthY = 115;
  const mouthW = 16;
  const mouth = el("path", {
    d: `M ${cx - mouthW} ${mouthY} Q ${cx} ${mouthY + 4} ${cx + mouthW} ${mouthY}`,
    fill: "none",
    stroke: "rgba(140,70,50,0.8)",
    "stroke-width": 2,
    "stroke-linecap": "round"
  });
  svg.appendChild(mouth);

  // Upper lip hint
  svg.appendChild(el("path", {
    d: `M ${cx - 10} ${mouthY - 1} Q ${cx} ${mouthY - 3} ${cx + 10} ${mouthY - 1}`,
    fill: "none",
    stroke: "rgba(160,90,70,0.4)",
    "stroke-width": 1
  }));

  // ── Goatee ──
  svg.appendChild(el("path", {
    d: "M 90,118 Q 92,126 100,130 Q 108,126 110,118 Q 106,122 100,124 Q 94,122 90,118 Z",
    fill: "#2a1c10",
    opacity: 0.7
  }));

  // Chin stubble area
  svg.appendChild(el("ellipse", { cx: 100, cy: 122, rx: 14, ry: 6, fill: "rgba(42,28,16,0.25)" }));

  // ── Circuit patterns (tech overlay on right side of face) ──
  const circuitG = el("g", { opacity: 0.2 });
  const circColor = "rgba(80,200,120,0.8)";
  const circW = 0.8;

  // Right cheek circuits
  circuitG.appendChild(el("line", { x1: 130, y1: 88, x2: 145, y2: 95, stroke: circColor, "stroke-width": circW }));
  circuitG.appendChild(el("line", { x1: 145, y1: 95, x2: 145, y2: 108, stroke: circColor, "stroke-width": circW }));
  circuitG.appendChild(el("line", { x1: 145, y1: 108, x2: 138, y2: 115, stroke: circColor, "stroke-width": circW }));
  circuitG.appendChild(el("circle", { cx: 145, cy: 95, r: 1.5, fill: circColor }));
  circuitG.appendChild(el("circle", { cx: 145, cy: 108, r: 1.5, fill: circColor }));

  // Forehead circuits
  circuitG.appendChild(el("line", { x1: 115, y1: 58, x2: 130, y2: 55, stroke: circColor, "stroke-width": circW }));
  circuitG.appendChild(el("line", { x1: 130, y1: 55, x2: 140, y2: 62, stroke: circColor, "stroke-width": circW }));
  circuitG.appendChild(el("circle", { cx: 130, cy: 55, r: 1.5, fill: circColor }));

  // Left cheek circuits (subtle)
  circuitG.appendChild(el("line", { x1: 55, y1: 92, x2: 55, y2: 105, stroke: circColor, "stroke-width": circW }));
  circuitG.appendChild(el("line", { x1: 55, y1: 105, x2: 62, y2: 112, stroke: circColor, "stroke-width": circW }));
  circuitG.appendChild(el("circle", { cx: 55, cy: 105, r: 1.5, fill: circColor }));

  svg.appendChild(circuitG);

  // ── State ──
  let currentState = "idle";
  let animFrame = null;
  let speakCycle = 0;
  let blinkTimer = 0;
  let pulseAngle = 0;

  function setMouthCurve(curve) {
    const offset = curve * 28;
    mouth.setAttribute("d",
      `M ${cx - mouthW} ${mouthY} Q ${cx} ${mouthY + offset} ${cx + mouthW} ${mouthY}`
    );
  }

  function setLensGlow(alpha) {
    leftLensGlow.setAttribute("opacity", String(alpha));
    rightLensGlow.setAttribute("opacity", String(alpha));
  }

  function setCircuitAlpha(alpha) {
    circuitG.setAttribute("opacity", String(alpha));
  }

  function setCollarGlow(intensity) {
    collarLine1.setAttribute("stroke", `rgba(80,200,120,${intensity})`);
    collarLine2.setAttribute("stroke", `rgba(0,180,220,${intensity * 0.7})`);
  }

  function setGlow(color, radius) {
    glowRing.setAttribute("stroke", color);
    feGauss.setAttribute("stdDeviation", String(radius / 2));
  }

  function setBlink(closed) {
    if (closed) {
      leftLensGlow.setAttribute("opacity", "0.15");
      rightLensGlow.setAttribute("opacity", "0.15");
    }
  }

  function animate() {
    const expr = EXPRESSIONS[currentState] || EXPRESSIONS.idle;
    pulseAngle += 0.02;

    // Subtle lens pulse
    const baseLens = expr.lensGlow;
    const lensPulse = baseLens + Math.sin(pulseAngle) * 0.08;
    setLensGlow(lensPulse);

    // Circuit shimmer
    const circuitPulse = expr.circuitAlpha + Math.sin(pulseAngle * 1.3) * 0.05;
    setCircuitAlpha(circuitPulse);

    // Collar pulse
    const collarPulse = expr.collarGlow + Math.sin(pulseAngle * 0.8) * 0.05;
    setCollarGlow(collarPulse);

    // Blink every ~4 seconds
    blinkTimer++;
    if (blinkTimer > 240) {
      setBlink(true);
      if (blinkTimer > 248) {
        blinkTimer = 0;
      }
    }

    // Speaking mouth animation
    if (currentState === "speaking") {
      speakCycle += 0.18;
      const dynamicCurve = expr.mouthCurve + Math.sin(speakCycle) * 0.15 + Math.sin(speakCycle * 2.3) * 0.05;
      setMouthCurve(dynamicCurve);
    }

    animFrame = requestAnimationFrame(animate);
  }

  function setState(state) {
    if (!EXPRESSIONS[state]) state = "idle";
    if (state === currentState) return;

    currentState = state;
    const expr = EXPRESSIONS[state];

    setLensGlow(expr.lensGlow);
    setGlow(expr.glowColor, expr.glowRadius);
    setCircuitAlpha(expr.circuitAlpha);
    setCollarGlow(expr.collarGlow);

    if (state !== "speaking") {
      setMouthCurve(expr.mouthCurve);
      speakCycle = 0;
    }

    // Eyebrow adjustments
    if (state === "alert") {
      leftBrow.setAttribute("d", "M 64,69 Q 76,64 88,70");
      rightBrow.setAttribute("d", "M 112,70 Q 124,64 136,69");
    } else if (state === "thinking") {
      leftBrow.setAttribute("d", "M 64,74 Q 76,70 88,72");
      rightBrow.setAttribute("d", "M 112,72 Q 124,70 136,74");
    } else if (state === "celebrating") {
      leftBrow.setAttribute("d", "M 64,70 Q 76,65 88,69");
      rightBrow.setAttribute("d", "M 112,69 Q 124,65 136,70");
    } else {
      leftBrow.setAttribute("d", "M 64,72 Q 76,67 88,71");
      rightBrow.setAttribute("d", "M 112,71 Q 124,67 136,72");
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
