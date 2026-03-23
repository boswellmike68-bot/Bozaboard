// Persona Voice — Web Speech API TTS for Bozaboard Governance Engine
// Speaks governance advisories aloud. Respects safe mode and user toggle.

const PERSONA_VOICE_PROFILES = {
  "Stability Chair":  { rate: 0.65, pitch: 0.85, volume: 0.9 },
  "Momentum Chair":   { rate: 0.65, pitch: 1.05, volume: 0.9 },
  "Risk Chair":       { rate: 0.65, pitch: 0.75, volume: 1.0 },
  "Alignment Chair":  { rate: 0.65, pitch: 0.95, volume: 0.9 },
  "default":          { rate: 0.65, pitch: 0.90, volume: 0.9 }
};

export function createPersonaVoice() {
  const synth = window.speechSynthesis || null;
  let enabled = true;
  let currentUtterance = null;
  let voiceCache = null;
  let onSpeakStart = null;
  let onSpeakEnd = null;

  function isSupported() {
    return !!(synth && typeof SpeechSynthesisUtterance !== "undefined");
  }

  function getVoice() {
    if (voiceCache) return voiceCache;
    if (!synth) return null;

    const voices = synth.getVoices();
    // Prefer a clear English voice
    const preferred = [
      "Microsoft Zira",
      "Google UK English Female",
      "Samantha",
      "Google US English",
      "Microsoft David",
      "Alex"
    ];

    for (const name of preferred) {
      const match = voices.find((v) => v.name.includes(name));
      if (match) {
        voiceCache = match;
        return match;
      }
    }

    // Fallback: first English voice
    const english = voices.find((v) => v.lang.startsWith("en"));
    if (english) {
      voiceCache = english;
      return english;
    }

    return voices[0] || null;
  }

  // Preload voices (Chrome fires voiceschanged asynchronously)
  if (synth && synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = () => {
      voiceCache = null;
      getVoice();
    };
  }

  function speak(text, persona) {
    if (!enabled || !isSupported() || !text) return Promise.resolve();

    // Cancel any ongoing speech
    stop();

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      const profile = PERSONA_VOICE_PROFILES[persona] || PERSONA_VOICE_PROFILES.default;
      const voice = getVoice();

      if (voice) utterance.voice = voice;
      utterance.rate = profile.rate;
      utterance.pitch = profile.pitch;
      utterance.volume = profile.volume;

      currentUtterance = utterance;

      utterance.onstart = () => {
        if (onSpeakStart) onSpeakStart();
      };

      utterance.onend = () => {
        currentUtterance = null;
        if (onSpeakEnd) onSpeakEnd();
        resolve();
      };

      utterance.onerror = () => {
        currentUtterance = null;
        if (onSpeakEnd) onSpeakEnd();
        resolve();
      };

      synth.speak(utterance);
    });
  }

  function stop() {
    if (synth && synth.speaking) {
      synth.cancel();
    }
    currentUtterance = null;
  }

  function setEnabled(val) {
    enabled = Boolean(val);
    if (!enabled) stop();
    localStorage.setItem("bozaboard.voiceEnabled", enabled ? "1" : "0");
  }

  function getEnabled() {
    const stored = localStorage.getItem("bozaboard.voiceEnabled");
    if (stored !== null) {
      enabled = stored === "1";
    }
    return enabled;
  }

  function toggle() {
    setEnabled(!getEnabled());
    return enabled;
  }

  function onStart(fn) { onSpeakStart = fn; }
  function onEnd(fn) { onSpeakEnd = fn; }

  // Init from stored preference
  getEnabled();

  return {
    speak,
    stop,
    setEnabled,
    getEnabled,
    toggle,
    isSupported,
    onStart,
    onEnd
  };
}
