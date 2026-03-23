// Persona Controller — Ties avatar expressions + voice to governance events
// Central orchestrator for the Bozaboard persona system

import { createPersonaAvatar } from "./persona-avatar.js";
import { createPersonaVoice } from "./persona-voice.js";

export function createPersonaController({ avatarSize = 140, safeMode = false } = {}) {
  const avatar = createPersonaAvatar({ size: avatarSize });
  const voice = createPersonaVoice();

  // Wire voice events to avatar expression
  voice.onStart(() => {
    if (avatar.getState() !== "alert") {
      avatar.setState("speaking");
    }
  });

  voice.onEnd(() => {
    if (avatar.getState() === "speaking") {
      avatar.setState("idle");
    }
  });

  // Process a governance advisory and animate + speak it
  async function onAdvisory({ persona, type, message, session, checkpoint }) {
    const avatarState = avatar.mapGovernanceState({
      momentumTier: session?.momentumTier || "neutral",
      type,
      checkpoint
    });

    avatar.setState(avatarState);

    if (!safeMode && voice.getEnabled()) {
      await voice.speak(message, persona);
    }

    // Return to idle after a beat if not already
    if (avatar.getState() !== "idle") {
      setTimeout(() => {
        if (avatar.getState() !== "speaking") {
          avatar.setState("idle");
        }
      }, 2500);
    }
  }

  // Greeter welcome speech
  async function welcome(text) {
    avatar.setState("speaking");
    if (voice.getEnabled()) {
      await voice.speak(text, "Alignment Chair");
    }
    avatar.setState("idle");
  }

  // Set listening state when user is typing
  function setListening(isListening) {
    if (isListening) {
      avatar.setState("listening");
    } else if (avatar.getState() === "listening") {
      avatar.setState("idle");
    }
  }

  function setThinking() {
    avatar.setState("thinking");
  }

  function toggleVoice() {
    const now = voice.toggle();
    return now;
  }

  function getVoiceEnabled() {
    return voice.getEnabled();
  }

  function setSafeMode(val) {
    safeMode = val;
    if (val) voice.stop();
  }

  return {
    avatar,        // .el is the SVG DOM element
    voice,
    onAdvisory,
    welcome,
    setListening,
    setThinking,
    toggleVoice,
    getVoiceEnabled,
    setSafeMode
  };
}
