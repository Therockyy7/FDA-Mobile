// features/plans/components/CancelSubscriptionDialog.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  View,
} from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { UserSubscription } from "../types/plans-types";

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading: boolean;
  subscription: UserSubscription | null;
};

const CancelSubscriptionDialog: React.FC<Props> = ({
  visible,
  onClose,
  onConfirm,
  loading,
  subscription,
}) => {
  const { isDarkColorScheme } = useColorScheme();
  const [reason, setReason] = useState("");

  const isDark = isDarkColorScheme;
  const colors = {
    overlay: "rgba(0, 0, 0, 0.6)",
    bg: isDark ? "#1E293B" : "#FFFFFF",
    headerBg: isDark ? "#0F172A" : "#F8FAFC",
    text: isDark ? "#F1F5F9" : "#1F2937",
    subtext: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    danger: "#EF4444",
    dangerBg: isDark ? "rgba(239, 68, 68, 0.1)" : "#FEF2F2",
    inputBg: isDark ? "#0F172A" : "#F1F5F9",
    featureIcon: isDark ? "#64748B" : "#94A3B8",
  };

  if (!subscription) return null;

  const planName = subscription.planName || "đang dùng";
  const tierCode = (subscription.tierCode || subscription.tier || "").toUpperCase();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={Keyboard.dismiss}
        />
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: Platform.OS === "ios" ? 40 : 20 }}
          >
            <TouchableWithoutFeedback>
              <View>
                {/* Header */}
                <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.dangerBg }]}>
                    <Ionicons name="warning" size={24} color={colors.danger} />
                  </View>
                  <View style={styles.headerTextContainer}>
                    <Text style={[styles.title, { color: colors.text }]}>
                      Hủy gói đăng ký?
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.subtext }]}>
                      Bạn có chắc chắn muốn hủy gói {planName}? Thao tác này sẽ có hiệu lực ngay lập tức.
                    </Text>
                  </View>
                </View>

                {/* Body */}
                <View style={styles.body}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Bạn sẽ mất các quyền lợi sau:
                  </Text>
                  
                  <View style={styles.featuresList}>
                    {tierCode === "PREMIUM" || tierCode === "MONITOR" ? (
                      <View style={styles.featureItem}>
                        <Ionicons name="chatbubble-ellipses" size={18} color={colors.featureIcon} />
                        <Text style={[styles.featureText, { color: colors.subtext }]}>Cảnh báo qua đầu số ưu tiên SMS</Text>
                      </View>
                    ) : null}

                    {tierCode === "MONITOR" ? (
                      <View style={styles.featureItem}>
                        <Ionicons name="map" size={18} color={colors.featureIcon} />
                        <Text style={[styles.featureText, { color: colors.subtext }]}>Theo dõi không giới hạn khu vực</Text>
                      </View>
                    ) : null}

                    <View style={styles.featureItem}>
                      <Ionicons name="flash" size={18} color={colors.featureIcon} />
                      <Text style={[styles.featureText, { color: colors.subtext }]}>Gửi cảnh báo ưu tiên cao (độ trễ 0s)</Text>
                    </View>

                    <View style={styles.featureItem}>
                      <Ionicons name="repeat" size={18} color={colors.featureIcon} />
                      <Text style={[styles.featureText, { color: colors.subtext }]}>Gửi lại tối đa 3 lần ➔ bị giảm xuống 1 lần</Text>
                    </View>
                  </View>

                  {/* Reason Input */}
                  <View style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, { color: colors.subtext }]}>
                      Lý do hủy (tùy chọn)
                    </Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                      placeholder="Cho chúng tôi biết lý do bạn hủy..."
                      placeholderTextColor={colors.subtext}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      value={reason}
                      onChangeText={setReason}
                      maxLength={200}
                    />
                  </View>
                </View>

                {/* Footer */}
                <View style={[styles.footer, { borderTopColor: colors.border }]}>
                  <TouchableOpacity
                    style={[styles.secondaryBtn, { borderColor: colors.border }]}
                    onPress={onClose}
                    disabled={loading}
                  >
                    <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Giữ lại gói</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.primaryBtn, { backgroundColor: colors.danger, opacity: loading ? 0.7 : 1 }]}
                    onPress={() => onConfirm(reason)}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.primaryBtnText}>Xác nhận hủy</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  container: {
    width: "100%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    padding: 20,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  body: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
  },
  featuresList: {
    gap: 10,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  inputContainer: {
    marginTop: 4,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});

export default CancelSubscriptionDialog;
