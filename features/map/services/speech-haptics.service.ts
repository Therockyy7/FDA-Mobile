// features/map/services/speech-haptics.service.ts
// Wraps expo-speech and expo-haptics — hooks should call this instead of Expo directly

import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";

export class SpeechHapticsService {
  /** Speak text in Vietnamese. Stops any ongoing speech first. */
  static speak(text: string, lang: string = "vi"): void {
    try {
      Speech.stop();
      Speech.speak(text, { language: lang, rate: 1.0 });
    } catch {
      // TTS failure should not crash the app
    }
  }

  /** Stop any ongoing speech. */
  static stop(): void {
    try {
      Speech.stop();
    } catch {
      // ignore
    }
  }

  /** Light impact haptic feedback (e.g., button press). */
  static impactLight(): void {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore on devices without haptics
    }
  }

  /** Heavy impact haptic feedback (e.g., critical alert). */
  static impactHeavy(): void {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {
      // ignore on devices without haptics
    }
  }
}
