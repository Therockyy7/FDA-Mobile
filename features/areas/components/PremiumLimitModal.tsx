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
import { SHADOW, RADIUS } from "~/lib/design-tokens";

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
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container} testID="areas-modal-premium-container">
        <TouchableOpacity
          style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.6)" }]}
          activeOpacity={1}
          onPress={onClose}
          testID="areas-modal-premium-overlay"
        />

        <View
          style={styles.modalContent}
          className="bg-white dark:bg-slate-800"
          testID="areas-modal-premium-content"
        >
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            className="bg-slate-100 dark:bg-slate-700"
            onPress={onClose}
            activeOpacity={0.7}
            testID="areas-modal-premium-close"
          >
            <Ionicons name="close" size={20} color="#94A3B8" />
          </TouchableOpacity>

          {/* Crown Icon */}
          <LinearGradient
            colors={["#FBBF24", "#F59E0B", "#D97706"]}
            style={styles.crownContainer}
          >
            <MaterialCommunityIcons name="crown" size={44} color="white" />
          </LinearGradient>

          {/* Title */}
          <Text className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight mb-2.5 text-center">
            Đã đạt giới hạn!
          </Text>

          {/* Description */}
          <Text className="text-sm leading-6 text-center text-slate-500 dark:text-slate-400 mb-4 px-2">
            Bạn đã tạo{" "}
            <Text className="text-amber-500 font-extrabold">
              {currentCount}/{maxCount}
            </Text>{" "}
            vùng theo dõi miễn phí.{"\n"}
            Nâng cấp Premium để tạo không giới hạn!
          </Text>

          {/* Progress Bar */}
          <View
            style={styles.progressContainer}
            className="bg-slate-100 dark:bg-slate-900"
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
          <View style={styles.benefitsList} testID="areas-modal-premium-benefits">
            {[
              { icon: "infinite", text: "Không giới hạn vùng theo dõi" },
              { icon: "notifications", text: "Thông báo ưu tiên" },
              { icon: "analytics", text: "Phân tích chi tiết" },
            ].map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <View
                  style={styles.benefitIcon}
                  className="bg-amber-500/20"
                >
                  <Ionicons
                    name={benefit.icon as any}
                    size={18}
                    color="#F59E0B"
                  />
                </View>
                <Text className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex-1">
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
            testID="areas-modal-premium-upgrade"
          >
            <LinearGradient
              colors={["#FBBF24", "#F59E0B", "#D97706"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.upgradeButton}
            >
              <MaterialCommunityIcons name="crown" size={22} color="white" />
              <Text className="text-base font-bold text-white tracking-wide">
                Nâng cấp Premium
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Maybe Later */}
          <TouchableOpacity
            onPress={onClose}
            style={styles.laterButton}
            testID="areas-modal-premium-later"
          >
            <Text className="text-sm font-semibold text-slate-400 dark:text-slate-500">
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
    borderRadius: RADIUS.sheet,
    padding: 24,
    alignItems: "center",
    ...SHADOW.lg,
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
    borderRadius: RADIUS.button,
  },
  laterButton: {
    paddingVertical: 8,
  },
});

export default PremiumLimitModal;
