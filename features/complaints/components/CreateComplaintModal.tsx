// features/complaints/components/CreateComplaintModal.tsx
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Text } from "~/components/ui/text";
import { paymentService } from "~/features/payment/services/payment.service";
import { useColorScheme } from "~/lib/useColorScheme";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (subject: string, description: string, paymentId: string) => void;
  loading: boolean;
};

const CreateComplaintModal: React.FC<Props> = ({
  visible,
  onClose,
  onSubmit,
  loading,
}) => {
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;
  
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  const colors = {
    overlay: "rgba(0, 0, 0, 0.6)",
    bg: isDark ? "#1E293B" : "#FFFFFF",
    headerBg: isDark ? "#0F172A" : "#F8FAFC",
    text: isDark ? "#F1F5F9" : "#1F2937",
    subtext: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#F1F5F9",
    inputBorder: isDark ? "#334155" : "#E2E8F0",
    accent: isDark ? "#60A5FA" : "#007AFF",
    danger: "#EF4444",
    dangerBg: isDark ? "rgba(239, 68, 68, 0.1)" : "#FEF2F2",
    iconBg: isDark ? "rgba(96, 165, 250, 0.1)" : "#EFF6FF",
    cardBg: isDark ? "#1E293B" : "#FFFFFF",
    selectedBg: isDark ? "rgba(96, 165, 250, 0.15)" : "rgba(0, 119, 255, 0.08)",
  };

  // Fetch Payment History (Top 20 logic is enough for dropdown)
  const { data: paymentData, isLoading: isLoadingPayments, isError } = useQuery({
    queryKey: ["payment", "history", 1],
    queryFn: () => paymentService.getPaymentHistory(1, 20),
    enabled: visible,
    staleTime: 60_000,
  });

  const records = paymentData?.data ?? [];
  const hasHistory = records.length > 0;

  // Auto-select the first payment if not selected
  React.useEffect(() => {
    if (visible && hasHistory && !selectedPaymentId) {
      setSelectedPaymentId(records[0].id);
    }
    if (!visible) {
      // Reset form on close
      setSubject("");
      setDescription("");
      setSelectedPaymentId(null);
    }
  }, [visible, hasHistory, records, selectedPaymentId]);

  const handleSubmit = () => {
    if (!subject.trim() || !description.trim() || !selectedPaymentId) return;
    onSubmit(subject.trim(), description.trim(), selectedPaymentId);
  };

  const isFormValid = subject.trim().length > 0 && description.trim().length > 0 && selectedPaymentId !== null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
      >
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={Keyboard.dismiss} />
        
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
                  <View style={[styles.iconContainer, { backgroundColor: colors.iconBg }]}>
                    <Ionicons name="chatbubbles-outline" size={24} color={colors.accent} />
                  </View>
                  <View style={styles.headerTextContainer}>
                    <Text style={[styles.title, { color: colors.text }]}>Tạo khiếu nại</Text>
                    <Text style={[styles.subtitle, { color: colors.subtext }]}>
                      Gửi phản hồi hoặc báo lỗi liên quan đến gói cước của bạn.
                    </Text>
                  </View>
                </View>

                {/* Body Content */}
                <View style={styles.body}>
                  {isLoadingPayments ? (
                    <View style={styles.centerState}>
                      <ActivityIndicator color={colors.accent} size="large" />
                      <Text style={[styles.stateText, { color: colors.subtext, marginTop: 12 }]}>
                        Đang lấy thông tin giao dịch...
                      </Text>
                    </View>
                  ) : isError ? (
                    <View style={styles.centerState}>
                      <View style={[styles.centerIcon, { backgroundColor: colors.dangerBg }]}>
                        <Ionicons name="alert-circle-outline" size={32} color={colors.danger} />
                      </View>
                      <Text style={[styles.stateTitle, { color: colors.text }]}>Đã có lỗi xảy ra</Text>
                      <Text style={[styles.stateText, { color: colors.subtext }]}>
                        Không thể lấy lịch sử giao dịch. Vui lòng thử lại sau.
                      </Text>
                    </View>
                  ) : !hasHistory ? (
                    <View style={styles.centerState}>
                      <View style={[styles.centerIcon, { backgroundColor: colors.iconBg }]}>
                        <Ionicons name="receipt-outline" size={36} color={colors.accent} />
                      </View>
                      <Text style={[styles.stateTitle, { color: colors.text }]}>Chưa có giao dịch</Text>
                      <Text style={[styles.stateText, { color: colors.subtext }]}>
                        Bạn cần có ít nhất 1 lần thanh toán gói cước thành công để có thể gửi khiếu nại.
                      </Text>
                    </View>
                  ) : (
                    <>
                      {/* Payment Selection */}
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>CHỌN GIAO DỊCH LIÊN QUAN</Text>
                      <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        contentContainerStyle={styles.paymentList}
                      >
                        {records.map((record) => {
                          const isSelected = selectedPaymentId === record.id;
                          const date = record.paidAt ?? record.createdAt;
                          const formattedDate = date ? new Date(date).toLocaleDateString("vi-VN") : "—";
                          
                          return (
                            <TouchableOpacity
                              key={record.id}
                              style={[
                                styles.paymentCard,
                                {
                                  backgroundColor: isSelected ? colors.selectedBg : colors.cardBg,
                                  borderColor: isSelected ? colors.accent : colors.border,
                                },
                              ]}
                              activeOpacity={0.7}
                              onPress={() => setSelectedPaymentId(record.id)}
                            >
                              <View style={[styles.radio, { borderColor: isSelected ? colors.accent : colors.subtext }]}>
                                {isSelected && <View style={[styles.radioInner, { backgroundColor: colors.accent }]} />}
                              </View>
                              <View>
                                <Text style={[styles.paymentPlan, { color: isSelected ? colors.accent : colors.text }]}>
                                  {record.planName}
                                </Text>
                                <Text style={[styles.paymentMeta, { color: colors.subtext }]}>
                                  #{record.orderCode} · {formattedDate}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>

                      {/* Subject Input */}
                      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}>TIÊU ĐỀ KHIẾU NẠI</Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: colors.inputBg,
                            borderColor: colors.inputBorder,
                            color: colors.text,
                          },
                        ]}
                        placeholder="Ví dụ: Thanh toán thành công nhưng chưa nâng gói"
                        placeholderTextColor={colors.subtext}
                        value={subject}
                        onChangeText={setSubject}
                        maxLength={200}
                      />

                      {/* Description Input */}
                      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}>MÔ TẢ CHI TIẾT LỖI</Text>
                      <TextInput
                        style={[
                          styles.textArea,
                          {
                            backgroundColor: colors.inputBg,
                            borderColor: colors.inputBorder,
                            color: colors.text,
                          },
                        ]}
                        placeholder="Mô tả sự cố bạn đang gặp phải..."
                        placeholderTextColor={colors.subtext}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        textAlignVertical="top"
                        maxLength={2000}
                      />
                    </>
                  )}
                </View>

                {/* Footer Buttons */}
                <View style={[styles.footer, { borderTopColor: colors.border }]}>
                  <TouchableOpacity
                    style={[styles.btn, { backgroundColor: isDark ? "#334155" : "#F1F5F9" }]}
                    onPress={onClose}
                    disabled={loading}
                  >
                    <Text style={[styles.btnText, { color: colors.text }]}>Đóng</Text>
                  </TouchableOpacity>

                  {hasHistory && !isError && (
                    <TouchableOpacity
                      style={[
                        styles.btn,
                        styles.btnPrimary,
                        { 
                          backgroundColor: colors.accent,
                          opacity: isFormValid && !loading ? 1 : 0.6 
                        },
                      ]}
                      onPress={handleSubmit}
                      disabled={!isFormValid || loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#FFF" size="small" />
                      ) : (
                        <Text style={[styles.btnText, { color: "#FFF" }]}>Gửi khiếu nại</Text>
                      )}
                    </TouchableOpacity>
                  )}
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    padding: 24,
    borderBottomWidth: 1,
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
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  body: {
    padding: 24,
  },
  centerState: {
    paddingVertical: 32,
    alignItems: "center",
  },
  centerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  stateText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  paymentList: {
    paddingBottom: 4,
    gap: 12,
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    marginRight: 12,
    minWidth: 240,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  paymentPlan: {
    fontSize: 14,
    fontWeight: "700",
  },
  paymentMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 15,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    height: 120,
    fontSize: 15,
  },
  footer: {
    flexDirection: "row",
    padding: 24,
    borderTopWidth: 1,
    gap: 12,
  },
  btn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  btnPrimary: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  btnText: {
    fontSize: 16,
    fontWeight: "700",
  },
});

export default CreateComplaintModal;
