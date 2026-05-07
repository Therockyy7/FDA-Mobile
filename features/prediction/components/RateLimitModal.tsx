import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "~/components/ui/text";
import { useTranslation } from "~/features/i18n/hooks/useTranslation";
import { useColorScheme } from "~/lib/useColorScheme";

interface RateLimitModalProps {
  visible: boolean;
  retryAfterSeconds?: number;
  onClose: () => void;
  onRetry: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function RateLimitModal({
  visible,
  retryAfterSeconds = 60,
  onClose,
  onRetry,
}: RateLimitModalProps) {
  const { isDarkColorScheme } = useColorScheme();
  const { t } = useTranslation();

  const [secondsLeft, setSecondsLeft] = useState(retryAfterSeconds);

  useEffect(() => {
    if (!visible) return;
    setSecondsLeft(retryAfterSeconds);
  }, [visible, retryAfterSeconds]);

  useEffect(() => {
    if (!visible || secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [visible, secondsLeft]);

  const colors = {
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#6B7280",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    overlay: "rgba(0, 0, 0, 0.6)",
    amber: "#F59E0B",
  };

  const canRetry = secondsLeft <= 0;

  const handleRetry = () => {
    if (!canRetry) return;
    onRetry();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.overlay, { backgroundColor: colors.overlay }]}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={[styles.modalContent, { backgroundColor: colors.cardBg }]}>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.border }]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color={colors.subtext} />
          </TouchableOpacity>

          <LinearGradient
            colors={["#FBBF24", "#F59E0B", "#D97706"]}
            style={styles.iconContainer}
          >
            <Ionicons name="hourglass-outline" size={40} color="white" />
          </LinearGradient>

          <Text style={[styles.title, { color: colors.text }]}>
            {t("prediction.rateLimit.title")}
          </Text>

          <Text style={[styles.description, { color: colors.subtext }]}>
            {t("prediction.rateLimit.message")}
          </Text>

          <View
            style={[
              styles.countdownContainer,
              {
                backgroundColor: isDarkColorScheme ? "#0B1A33" : "#FFF7ED",
                borderColor: `${colors.amber}40`,
              },
            ]}
          >
            <Text style={[styles.countdownNumber, { color: colors.amber }]}>
              {secondsLeft}
            </Text>
            <Text style={[styles.countdownUnit, { color: colors.subtext }]}>
              s
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleRetry}
            disabled={!canRetry}
            activeOpacity={0.85}
            style={[
              styles.retryButtonWrapper,
              { opacity: canRetry ? 1 : 0.5 },
            ]}
          >
            <LinearGradient
              colors={
                canRetry
                  ? ["#FBBF24", "#F59E0B", "#D97706"]
                  : ["#94A3B8", "#64748B", "#475569"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.retryButton}
            >
              <Ionicons
                name={canRetry ? "refresh" : "time-outline"}
                size={18}
                color="white"
              />
              <Text style={styles.retryText}>
                {canRetry
                  ? t("prediction.rateLimit.retryNow")
                  : t("prediction.rateLimit.retryIn", { seconds: secondsLeft })}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.closeBottom}>
            <Text style={[styles.closeBottomText, { color: colors.subtext }]}>
              {t("prediction.rateLimit.close")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: SCREEN_WIDTH - 48,
    maxWidth: 360,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  iconContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    marginTop: 8,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  countdownContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 22,
    minWidth: 140,
  },
  countdownNumber: {
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: -1,
  },
  countdownUnit: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 4,
  },
  retryButtonWrapper: {
    width: "100%",
    marginBottom: 8,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  retryText: {
    fontSize: 15,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.3,
  },
  closeBottom: {
    paddingVertical: 8,
  },
  closeBottomText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default RateLimitModal;
