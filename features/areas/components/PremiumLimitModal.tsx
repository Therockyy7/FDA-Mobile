// features/areas/components/PremiumLimitModal.tsx
// Simple premium upgrade modal - simplified for reliability
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

interface PremiumLimitModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
  currentCount?: number;
  maxCount?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function PremiumLimitModal({
  visible,
  onClose,
  onUpgrade,
  currentCount = 5,
  maxCount = 5,
}: PremiumLimitModalProps) {
  const { isDarkColorScheme } = useColorScheme();

  const colors = {
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#6B7280",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    overlay: "rgba(0, 0, 0, 0.6)",
    gold: "#F59E0B",
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
        {/* Overlay Background */}
        <TouchableOpacity
          style={[styles.overlay, { backgroundColor: colors.overlay }]}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Modal Content */}
        <View style={[styles.modalContent, { backgroundColor: colors.cardBg }]}>
          {/* Close Button */}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.border }]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color={colors.subtext} />
          </TouchableOpacity>

          {/* Crown Icon */}
          <LinearGradient
            colors={["#FBBF24", "#F59E0B", "#D97706"]}
            style={styles.crownContainer}
          >
            <MaterialCommunityIcons name="crown" size={44} color="white" />
          </LinearGradient>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            Đã đạt giới hạn!
          </Text>

          {/* Description */}
          <Text style={[styles.description, { color: colors.subtext }]}>
            Bạn đã tạo{" "}
            <Text style={{ color: colors.gold, fontWeight: "800" }}>
              {currentCount}/{maxCount}
            </Text>{" "}
            vùng theo dõi miễn phí.{"\n"}
            Nâng cấp Premium để tạo không giới hạn!
          </Text>

          {/* Progress Bar */}
          <View
            style={[
              styles.progressContainer,
              { backgroundColor: isDarkColorScheme ? "#0F172A" : "#F3F4F6" },
            ]}
          >
            <LinearGradient
              colors={["#F59E0B", "#EF4444"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.progressBar,
                { width: `${(currentCount / maxCount) * 100}%` },
              ]}
            />
          </View>

          {/* Benefits List */}
          <View style={styles.benefitsList}>
            {[
              { icon: "infinite", text: "Không giới hạn vùng theo dõi" },
              { icon: "notifications", text: "Thông báo ưu tiên" },
              { icon: "analytics", text: "Phân tích chi tiết" },
            ].map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <View
                  style={[
                    styles.benefitIcon,
                    { backgroundColor: `${colors.gold}20` },
                  ]}
                >
                  <Ionicons
                    name={benefit.icon as any}
                    size={18}
                    color={colors.gold}
                  />
                </View>
                <Text style={[styles.benefitText, { color: colors.text }]}>
                  {benefit.text}
                </Text>
              </View>
            ))}
          </View>

          {/* Upgrade Button */}
          <TouchableOpacity
            onPress={onUpgrade || onClose}
            activeOpacity={0.9}
            style={styles.upgradeButtonWrapper}
          >
            <LinearGradient
              colors={["#FBBF24", "#F59E0B", "#D97706"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.upgradeButton}
            >
              <MaterialCommunityIcons name="crown" size={22} color="white" />
              <Text style={styles.upgradeText}>Nâng cấp Premium</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Maybe Later */}
          <TouchableOpacity onPress={onClose} style={styles.laterButton}>
            <Text style={[styles.laterText, { color: colors.subtext }]}>
              Để sau
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
  crownContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
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
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  progressContainer: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    marginBottom: 20,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  benefitsList: {
    width: "100%",
    marginBottom: 20,
    gap: 10,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  benefitIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  upgradeButtonWrapper: {
    width: "100%",
    marginBottom: 10,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
  },
  upgradeText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.3,
  },
  laterButton: {
    paddingVertical: 8,
  },
  laterText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default PremiumLimitModal;
