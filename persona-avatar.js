// Persona Avatar — Bozafire's face, honoring the architect's mother
// Lives inside the orb ring. Reacts to governance states.
// States: idle, listening, speaking, alert, thinking, celebrating
// Design: Warm feminine face, light grey hair, thin glasses, kind eyes,
//         gentle smile — with soft governance glow woven in.

const SVGNS = "http://www.w3.org/2000/svg";

const EXPRESSIONS = {
  idle:        { eyeBright: 0.9, mouthCurve: 0.15, glowColor: "rgba(212,175,55,0.30)", glowRadius: 8,  pupilDrift: true,  circuitAlpha: 0.12 },
  listening:   { eyeBright: 1.0, mouthCurve: 0.08, glowColor: "rgba(80,200,120,0.40)", glowRadius: 12, pupilDrift: false, circuitAlpha: 0.25 },
  speaking:    { eyeBright: 0.95, mouthCurve: 0.22, glowColor: "rgba(80,200,120,0.50)", glowRadius: 16, pupilDrift: false, circuitAlpha: 0.2 },
  alert:       { eyeBright: 1.0, mouthCurve:-0.08, glowColor: "rgba(255,100,80,0.45)", glowRadius: 18, pupilDrift: false, circuitAlpha: 0.35 },
  thinking:    { eyeBright: 0.75, mouthCurve: 0.04, glowColor: "rgba(212,175,55,0.45)", glowRadius: 10, pupilDrift: true,  circuitAlpha: 0.3 },
  celebrating: { eyeBright: 1.0, mouthCurve: 0.35, glowColor: "rgba(80,200,120,0.60)", glowRadius: 20, pupilDrift: false, circuitAlpha: 0.2 }
};

function el(tag, attrs = {}) {
  const node = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    node.setAttribute(k, String(v));
  }
  return node;
}

export function createPersonaAvatar({ size = 140 } = {}) {
  const VB = 200;
  const cx = 100, cy = 95;

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

  // Soft inner glow for warmth
  const fWarm = el("filter", { id: "p-warm", x: "-20%", y: "-20%", width: "140%", height: "140%" });
  fWarm.appendChild(el("feGaussianBlur", { in: "SourceGraphic", stdDeviation: "2" }));
  defs.appendChild(fWarm);

  // Skin gradient — warm, fair complexion
  const skinGrad = el("linearGradient", { id: "skin-grad", x1: "0", y1: "0", x2: "0", y2: "1" });
  skinGrad.appendChild(el("stop", { offset: "0%", "stop-color": "#f0d0b8" }));
  skinGrad.appendChild(el("stop", { offset: "100%", "stop-color": "#d9b89a" }));
  defs.appendChild(skinGrad);

  // Hair gradient — light grey/silver
  const hairGrad = el("linearGradient", { id: "hair-grad", x1: "0", y1: "0", x2: "1", y2: "1" });
  hairGrad.appendChild(el("stop", { offset: "0%", "stop-color": "#c8c0b8" }));
  hairGrad.appendChild(el("stop", { offset: "50%", "stop-color": "#b0a898" }));
  hairGrad.appendChild(el("stop", { offset: "100%", "stop-color": "#a09888" }));
  defs.appendChild(hairGrad);

  // Eye color — warm blue-grey, kind
  const eyeGrad = el("radialGradient", { id: "eye-grad", cx: "0.45", cy: "0.4", r: "0.55" });
  eyeGrad.appendChild(el("stop", { offset: "0%", "stop-color": "#88a8c0" }));
  eyeGrad.appendChild(el("stop", { offset: "100%", "stop-color": "#607888" }));
  defs.appendChild(eyeGrad);

  // Neckline gradient
  const neckGrad = el("linearGradient", { id: "neck-grad", x1: "0", y1: "0", x2: "0", y2: "1" });
  neckGrad.appendChild(el("stop", { offset: "0%", "stop-color": "#d9b89a" }));
  neckGrad.appendChild(el("stop", { offset: "100%", "stop-color": "#c0a080" }));
  defs.appendChild(neckGrad);

  // Blouse/top gradient — soft floral dark
  const topGrad = el("linearGradient", { id: "top-grad", x1: "0", y1: "0", x2: "0", y2: "1" });
  topGrad.appendChild(el("stop", { offset: "0%", "stop-color": "#3a2832" }));
  topGrad.appendChild(el("stop", { offset: "100%", "stop-color": "#2a1822" }));
  defs.appendChild(topGrad);

  svg.appendChild(defs);

  // ── Outer glow ring (soft gold, warm) ──
  const glowRing = el("ellipse", {
    cx: 100, cy: 100, rx: 92, ry: 94,
    fill: "none",
    stroke: "rgba(212,175,55,0.30)",
    "stroke-width": 1.5,
    filter: "url(#p-glow)"
  });
  svg.appendChild(glowRing);

  // ── Top / shoulders ──
  svg.appendChild(el("path", {
    d: "M 32,168 Q 45,145 65,138 L 82,134 Q 100,132 118,134 L 135,138 Q 155,145 168,168 L 168,200 L 32,200 Z",
    fill: "url(#top-grad)"
  }));

  // Subtle floral pattern on top (tiny dots)
  const floralG = el("g", { opacity: 0.15 });
  const floralPositions = [[55,160],[70,155],[85,150],[115,150],[130,155],[145,160],[65,170],[100,148],[135,170],[75,178],[125,178]];
  for (const [fx, fy] of floralPositions) {
    floralG.appendChild(el("circle", { cx: fx, cy: fy, r: 1.5, fill: "#c8a0a0" }));
  }
  svg.appendChild(floralG);

  // ── Neck ──
  svg.appendChild(el("path", {
    d: "M 86,128 Q 86,140 88,145 Q 100,148 112,145 Q 114,140 114,128 Z",
    fill: "url(#neck-grad)"
  }));

  // ── Face shape (soft oval, slightly narrower chin) ──
  svg.appendChild(el("ellipse", {
    cx: 100, cy: 92, rx: 48, ry: 56,
    fill: "url(#skin-grad)"
  }));

  // Soft cheek warmth
  svg.appendChild(el("ellipse", { cx: 75, cy: 100, rx: 10, ry: 7, fill: "rgba(220,160,140,0.2)" }));
  svg.appendChild(el("ellipse", { cx: 125, cy: 100, rx: 10, ry: 7, fill: "rgba(220,160,140,0.2)" }));

  // ── Hair ──
  // Top volume
  svg.appendChild(el("path", {
    d: "M 50,75 Q 48,38 100,32 Q 152,38 150,75 L 148,62 Q 145,42 100,38 Q 55,42 52,62 Z",
    fill: "url(#hair-grad)"
  }));

  // Left side hair (falling naturally, slightly wispy)
  svg.appendChild(el("path", {
    d: "M 50,62 Q 44,75 42,95 Q 40,110 44,125 Q 46,115 48,100 Q 48,80 52,68 Z",
    fill: "url(#hair-grad)"
  }));

  // Right side hair
  svg.appendChild(el("path", {
    d: "M 150,62 Q 156,75 158,95 Q 160,110 156,125 Q 154,115 152,100 Q 152,80 148,68 Z",
    fill: "url(#hair-grad)"
  }));

  // Wispy strands across forehead
  svg.appendChild(el("path", {
    d: "M 60,58 Q 65,52 80,50 Q 75,55 65,58 Z",
    fill: "url(#hair-grad)", opacity: 0.6
  }));
  svg.appendChild(el("path", {
    d: "M 120,50 Q 135,52 140,58 Q 135,58 125,55 Z",
    fill: "url(#hair-grad)", opacity: 0.6
  }));

  // ── Eyebrows (soft, natural arch) ──
  const leftBrow = el("path", {
    d: "M 68,76 Q 78,72 88,75",
    fill: "none", stroke: "rgba(140,120,100,0.5)", "stroke-width": 1.5, "stroke-linecap": "round"
  });
  const rightBrow = el("path", {
    d: "M 112,75 Q 122,72 132,76",
    fill: "none", stroke: "rgba(140,120,100,0.5)", "stroke-width": 1.5, "stroke-linecap": "round"
  });
  svg.appendChild(leftBrow);
  svg.appendChild(rightBrow);

  // ── Eyes (kind, warm) ──
  const eyeY = 84;
  const eyeOffsetX = 22;
  const eyeRx = 9;
  const eyeRy = 6;
  const pupilR = 3.5;
  const irisR = 5;

  // Eye whites
  const leftEyeWhite = el("ellipse", { cx: cx - eyeOffsetX, cy: eyeY, rx: eyeRx, ry: eyeRy, fill: "#f5f0eb" });
  const rightEyeWhite = el("ellipse", { cx: cx + eyeOffsetX, cy: eyeY, rx: eyeRx, ry: eyeRy, fill: "#f5f0eb" });
  svg.appendChild(leftEyeWhite);
  svg.appendChild(rightEyeWhite);

  // Irises
  const leftIris = el("circle", { cx: cx - eyeOffsetX, cy: eyeY, r: irisR, fill: "url(#eye-grad)" });
  const rightIris = el("circle", { cx: cx + eyeOffsetX, cy: eyeY, r: irisR, fill: "url(#eye-grad)" });
  svg.appendChild(leftIris);
  svg.appendChild(rightIris);

  // Pupils
  const leftPupil = el("circle", { cx: cx - eyeOffsetX, cy: eyeY, r: pupilR, fill: "#1a1a1a" });
  const rightPupil = el("circle", { cx: cx + eyeOffsetX, cy: eyeY, r: pupilR, fill: "#1a1a1a" });
  svg.appendChild(leftPupil);
  svg.appendChild(rightPupil);

  // Eye light reflections (the kindness in the eyes)
  svg.appendChild(el("circle", { cx: cx - eyeOffsetX + 1.5, cy: eyeY - 1.5, r: 1.2, fill: "rgba(255,255,255,0.7)" }));
  svg.appendChild(el("circle", { cx: cx + eyeOffsetX + 1.5, cy: eyeY - 1.5, r: 1.2, fill: "rgba(255,255,255,0.7)" }));

  // Upper eyelid lines (soft)
  svg.appendChild(el("path", {
    d: `M ${cx - eyeOffsetX - eyeRx} ${eyeY} Q ${cx - eyeOffsetX} ${eyeY - eyeRy - 1} ${cx - eyeOffsetX + eyeRx} ${eyeY}`,
    fill: "none", stroke: "rgba(120,90,70,0.4)", "stroke-width": 1
  }));
  svg.appendChild(el("path", {
    d: `M ${cx + eyeOffsetX - eyeRx} ${eyeY} Q ${cx + eyeOffsetX} ${eyeY - eyeRy - 1} ${cx + eyeOffsetX + eyeRx} ${eyeY}`,
    fill: "none", stroke: "rgba(120,90,70,0.4)", "stroke-width": 1
  }));

  // Crow's feet (gentle laugh lines — she smiled a lot)
  svg.appendChild(el("path", {
    d: "M 66,83 Q 62,81 60,78", fill: "none", stroke: "rgba(160,130,110,0.25)", "stroke-width": 0.7
  }));
  svg.appendChild(el("path", {
    d: "M 66,85 Q 61,85 58,83", fill: "none", stroke: "rgba(160,130,110,0.2)", "stroke-width": 0.7
  }));
  svg.appendChild(el("path", {
    d: "M 134,83 Q 138,81 140,78", fill: "none", stroke: "rgba(160,130,110,0.25)", "stroke-width": 0.7
  }));
  svg.appendChild(el("path", {
    d: "M 134,85 Q 139,85 142,83", fill: "none", stroke: "rgba(160,130,110,0.2)", "stroke-width": 0.7
  }));

  // ── Glasses (thin rectangular frames) ──
  const glassesG = el("g");

  // Bridge
  glassesG.appendChild(el("path", {
    d: "M 88,83 Q 100,80 112,83",
    fill: "none", stroke: "rgba(100,90,80,0.7)", "stroke-width": 1.2, "stroke-linecap": "round"
  }));

  // Left frame
  glassesG.appendChild(el("rect", {
    x: 65, y: 77, width: 26, height: 16, rx: 3, ry: 3,
    fill: "none", stroke: "rgba(100,90,80,0.65)", "stroke-width": 1.2
  }));

  // Right frame
  glassesG.appendChild(el("rect", {
    x: 109, y: 77, width: 26, height: 16, rx: 3, ry: 3,
    fill: "none", stroke: "rgba(100,90,80,0.65)", "stroke-width": 1.2
  }));

  // Temples to ears
  glassesG.appendChild(el("path", {
    d: "M 65,82 Q 56,82 48,85",
    fill: "none", stroke: "rgba(100,90,80,0.5)", "stroke-width": 1.2, "stroke-linecap": "round"
  }));
  glassesG.appendChild(el("path", {
    d: "M 135,82 Q 144,82 152,85",
    fill: "none", stroke: "rgba(100,90,80,0.5)", "stroke-width": 1.2, "stroke-linecap": "round"
  }));

  // Subtle lens tint
  glassesG.appendChild(el("rect", {
    x: 65, y: 77, width: 26, height: 16, rx: 3, ry: 3,
    fill: "rgba(200,210,220,0.08)"
  }));
  glassesG.appendChild(el("rect", {
    x: 109, y: 77, width: 26, height: 16, rx: 3, ry: 3,
    fill: "rgba(200,210,220,0.08)"
  }));

  svg.appendChild(glassesG);

  // ── Nose (gentle, soft) ──
  svg.appendChild(el("path", {
    d: "M 100,86 L 98,100 Q 95,104 98,105 L 100,106 L 102,105 Q 105,104 102,100 Z",
    fill: "rgba(200,170,150,0.35)", stroke: "none"
  }));

  // ── Mouth (gentle, warm smile) ──
  const mouthY = 113;
  const mouthW = 14;
  const mouth = el("path", {
    d: `M ${cx - mouthW} ${mouthY} Q ${cx} ${mouthY + 4} ${cx + mouthW} ${mouthY}`,
    fill: "none",
    stroke: "rgba(180,110,100,0.65)",
    "stroke-width": 1.8,
    "stroke-linecap": "round"
  });
  svg.appendChild(mouth);

  // Smile lines (nasolabial — gentle, earned)
  svg.appendChild(el("path", {
    d: "M 82,98 Q 80,105 82,112",
    fill: "none", stroke: "rgba(170,140,120,0.2)", "stroke-width": 0.8
  }));
  svg.appendChild(el("path", {
    d: "M 118,98 Q 120,105 118,112",
    fill: "none", stroke: "rgba(170,140,120,0.2)", "stroke-width": 0.8
  }));

  // ── Circuit traces (very subtle, woven into the glow — governance lives here gently) ──
  const circuitG = el("g", { opacity: 0.12 });
  const cColor = "rgba(212,175,55,0.6)";

  // Around the glow ring — like warmth radiating
  circuitG.appendChild(el("path", {
    d: "M 20,100 Q 15,80 25,60", fill: "none", stroke: cColor, "stroke-width": 0.6
  }));
  circuitG.appendChild(el("circle", { cx: 25, cy: 60, r: 1.2, fill: cColor }));
  circuitG.appendChild(el("path", {
    d: "M 180,100 Q 185,80 175,60", fill: "none", stroke: cColor, "stroke-width": 0.6
  }));
  circuitG.appendChild(el("circle", { cx: 175, cy: 60, r: 1.2, fill: cColor }));
  circuitG.appendChild(el("path", {
    d: "M 40,170 Q 30,160 25,145", fill: "none", stroke: cColor, "stroke-width": 0.6
  }));
  circuitG.appendChild(el("circle", { cx: 25, cy: 145, r: 1.2, fill: cColor }));
  circuitG.appendChild(el("path", {
    d: "M 160,170 Q 170,160 175,145", fill: "none", stroke: cColor, "stroke-width": 0.6
  }));
  circuitG.appendChild(el("circle", { cx: 175, cy: 145, r: 1.2, fill: cColor }));

  svg.appendChild(circuitG);

  // ── State ──
  let currentState = "idle";
  let animFrame = null;
  let speakCycle = 0;
  let driftAngle = 0;
  let blinkTimer = 0;
  let pulseAngle = 0;

  function setMouthCurve(curve) {
    const offset = curve * 26;
    mouth.setAttribute("d",
      `M ${cx - mouthW} ${mouthY} Q ${cx} ${mouthY + offset} ${cx + mouthW} ${mouthY}`
    );
  }

  function setEyeBrightness(bright) {
    const alpha = 0.6 + bright * 0.4;
    leftIris.setAttribute("opacity", String(alpha));
    rightIris.setAttribute("opacity", String(alpha));
  }

  function setGlow(color, radius) {
    glowRing.setAttribute("stroke", color);
    feGauss.setAttribute("stdDeviation", String(radius / 2));
  }

  function setCircuitAlpha(alpha) {
    circuitG.setAttribute("opacity", String(alpha));
  }

  function setPupilOffset(dx, dy) {
    const maxDrift = 2;
    leftPupil.setAttribute("cx", cx - eyeOffsetX + dx * maxDrift);
    leftPupil.setAttribute("cy", eyeY + dy * maxDrift);
    rightPupil.setAttribute("cx", cx + eyeOffsetX + dx * maxDrift);
    rightPupil.setAttribute("cy", eyeY + dy * maxDrift);
    leftIris.setAttribute("cx", cx - eyeOffsetX + dx * maxDrift * 0.7);
    leftIris.setAttribute("cy", eyeY + dy * maxDrift * 0.7);
    rightIris.setAttribute("cx", cx + eyeOffsetX + dx * maxDrift * 0.7);
    rightIris.setAttribute("cy", eyeY + dy * maxDrift * 0.7);
  }

  function doBlink(closed) {
    if (closed) {
      leftEyeWhite.setAttribute("ry", "1");
      rightEyeWhite.setAttribute("ry", "1");
      leftIris.setAttribute("opacity", "0");
      rightIris.setAttribute("opacity", "0");
      leftPupil.setAttribute("opacity", "0");
      rightPupil.setAttribute("opacity", "0");
    } else {
      leftEyeWhite.setAttribute("ry", String(eyeRy));
      rightEyeWhite.setAttribute("ry", String(eyeRy));
      leftIris.setAttribute("opacity", "1");
      rightIris.setAttribute("opacity", "1");
      leftPupil.setAttribute("opacity", "1");
      rightPupil.setAttribute("opacity", "1");
    }
  }

  function animate() {
    const expr = EXPRESSIONS[currentState] || EXPRESSIONS.idle;
    pulseAngle += 0.02;

    // Gentle pupil drift (idle/thinking — looking around warmly)
    if (expr.pupilDrift) {
      driftAngle += 0.012;
      const dx = Math.sin(driftAngle) * 0.5;
      const dy = Math.cos(driftAngle * 0.7) * 0.25;
      setPupilOffset(dx, dy);
    } else {
      setPupilOffset(0, 0);
    }

    // Soft glow pulse
    const circPulse = expr.circuitAlpha + Math.sin(pulseAngle) * 0.03;
    setCircuitAlpha(circPulse);

    // Blink every ~5 seconds (gentle)
    blinkTimer++;
    if (blinkTimer === 300) {
      doBlink(true);
    } else if (blinkTimer === 308) {
      doBlink(false);
      blinkTimer = 0;
    }

    // Speaking mouth animation (gentle movement)
    if (currentState === "speaking") {
      speakCycle += 0.14;
      const dynamicCurve = expr.mouthCurve + Math.sin(speakCycle) * 0.12 + Math.sin(speakCycle * 2.1) * 0.04;
      setMouthCurve(dynamicCurve);
    }

    animFrame = requestAnimationFrame(animate);
  }

  function setState(state) {
    if (!EXPRESSIONS[state]) state = "idle";
    if (state === currentState) return;

    currentState = state;
    const expr = EXPRESSIONS[state];

    setEyeBrightness(expr.eyeBright);
    setGlow(expr.glowColor, expr.glowRadius);
    setCircuitAlpha(expr.circuitAlpha);

    if (state !== "speaking") {
      setMouthCurve(expr.mouthCurve);
      speakCycle = 0;
    }

    // Gentle eyebrow shifts
    if (state === "alert") {
      leftBrow.setAttribute("d", "M 68,74 Q 78,70 88,74");
      rightBrow.setAttribute("d", "M 112,74 Q 122,70 132,74");
    } else if (state === "thinking") {
      leftBrow.setAttribute("d", "M 68,77 Q 78,74 88,76");
      rightBrow.setAttribute("d", "M 112,76 Q 122,74 132,77");
    } else if (state === "celebrating") {
      leftBrow.setAttribute("d", "M 68,74 Q 78,71 88,74");
      rightBrow.setAttribute("d", "M 112,74 Q 122,71 132,74");
    } else {
      leftBrow.setAttribute("d", "M 68,76 Q 78,72 88,75");
      rightBrow.setAttribute("d", "M 112,75 Q 122,72 132,76");
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
