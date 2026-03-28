// features/map/hooks/navigation/useNavigationVoice.ts
// Voice announcements and haptic feedback for turn-by-turn navigation.

import { useCallback, useRef } from "react";
import { SpeechHapticsService } from "../../services/speech-haptics.service";
import type { GeoJsonInstruction } from "../../types/safe-route.types";
import type { VoiceLevel } from "../../types/navigation.types";

export function useNavigationVoice() {
  const announcedRef = useRef<Map<number, Set<VoiceLevel>>>(new Map());

  const speak = useCallback((text: string) => {
    SpeechHapticsService.stop();
    SpeechHapticsService.speak(text, "vi");
  }, []);

  const announceForStep = useCallback(
    (stepIndex: number, level: VoiceLevel, instruction: GeoJsonInstruction) => {
      if (!announcedRef.current.has(stepIndex)) {
        announcedRef.current.set(stepIndex, new Set());
      }
      const levels = announcedRef.current.get(stepIndex)!;
      if (levels.has(level)) return;
      levels.add(level);

      switch (level) {
        case "early":
          speak(`Sau 500 mét, ${instruction.text}`);
          break;
        case "approach":
          speak(instruction.text);
          break;
        case "now":
          speak(`${instruction.text} ngay bây giờ`);
          break;
      }
    },
    [speak],
  );

  const resetAnnounced = useCallback(() => {
    announcedRef.current = new Map();
  }, []);

  return { speak, announceForStep, resetAnnounced };
}
