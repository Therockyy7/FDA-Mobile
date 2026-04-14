// features/map/components/areas/sheets/CreateAreaSheet.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { formatRadius } from "~/features/map/lib/formatters";
import { AreaNameInput } from "~/features/map/components/areas/sheets/AreaNameInput";
import { AreaAddressInput } from "~/features/map/components/areas/sheets/AreaAddressInput";
import { RADIUS, SHADOW } from "~/lib/design-tokens";

interface CreateAreaSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; addressText: string }) => Promise<void>;
  radiusMeters: number;
  isLoading?: boolean;
  initialValues?: { name: string; addressText?: string };
}

function CreateAreaSheetContent({ onClose, onSubmit, radiusMeters, isLoading = false, initialValues }: Omit<CreateAreaSheetProps, "visible">) {
  const { isDarkColorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(initialValues?.name || "");
  const [address, setAddress] = useState(initialValues?.addressText || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const c = {
    bg: isDarkColorScheme ? "#0F172A" : "#FFFFFF",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    muted: isDarkColorScheme ? "#64748B" : "#9CA3AF",
    accent: "#3B82F6",
  };
  const canSubmit = name.trim().length > 0 && !isSubmitting && !isLoading;

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) return;
    Keyboard.dismiss();
    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), addressText: address.trim() });
      if (!initialValues) { setName(""); setAddress(""); }
    } finally {
      setIsSubmitting(false);
    }
  }, [name, address, onSubmit, initialValues]);

  return (
    <View style={[styles.sheet, { backgroundColor: c.bg, borderColor: c.border }]}>
      {/* Handle */}
      <View style={styles.handleRow}>
        <View style={[styles.handleBar, { backgroundColor: c.border }]} />
      </View>

      {/* Header */}
      <View style={styles.headerRow}>
        <View style={[styles.headerIcon, { backgroundColor: `${c.accent}18` }]}>
          <Ionicons name="bookmark" size={18} color={c.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: c.text }]}>
            {initialValues ? "Cập nhật thông tin" : "Tạo vùng theo dõi"}
          </Text>
          <Text style={[styles.headerSub, { color: c.muted }]}>Bán kính {formatRadius(radiusMeters)}</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={18} color={c.muted} />
        </TouchableOpacity>
      </View>

      {/* Body */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: Math.max(insets.bottom + 20, 20) }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AreaNameInput value={name} onChangeText={setName} disabled={isSubmitting} />
        <AreaAddressInput value={address} onChangeText={setAddress} disabled={isSubmitting} />

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit}
          activeOpacity={0.8}
          style={[styles.submitBtn, { backgroundColor: canSubmit ? c.accent : c.border }]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={17} color="white" />
              <Text style={styles.submitBtnText}>{initialValues ? "Cập nhật" : "Tạo vùng"}</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Hint */}
        <View style={styles.hint}>
          <Ionicons name="information-circle" size={12} color={c.muted} />
          <Text style={[styles.hintText, { color: c.muted }]}>
            Tối đa 5 vùng miễn phí. Nâng cấp Premium để không giới hạn.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

export function CreateAreaSheet(props: CreateAreaSheetProps) {
  const { isDarkColorScheme } = useColorScheme();
  if (!props.visible) return null;

  return (
    <Modal visible={props.visible} transparent animationType="fade" onRequestClose={props.onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: isDarkColorScheme ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.45)" }}
        onPress={props.onClose}
      />
      <KeyboardAvoidingView behavior="padding" style={{ justifyContent: "flex-end" }} pointerEvents="box-none">
        <CreateAreaSheetContent {...props} />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: RADIUS.sheet,
    borderTopRightRadius: RADIUS.sheet,
    ...SHADOW.lg,
    borderTopWidth: 1,
    paddingHorizontal: 16,
  },
  handleRow: { alignItems: "center", paddingTop: 12, paddingBottom: 4 },
  handleBar: { width: 42, height: 5, borderRadius: 3 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 10,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "800", marginBottom: 2 },
  headerSub: { fontSize: 11 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  submitBtn: {
    borderRadius: RADIUS.button,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 4,
  },
  submitBtnText: { fontSize: 15, fontWeight: "700", color: "white" },
  hint: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 14, paddingBottom: 8 },
  hintText: { fontSize: 11, flex: 1, lineHeight: 16 },
});