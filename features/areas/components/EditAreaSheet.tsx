// features/areas/components/EditAreaSheet.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Text } from "~/components/ui/text";
import type { Area } from "~/features/map/types/map-layers.types";
import { useColorScheme } from "~/lib/useColorScheme";

interface EditAreaSheetProps {
  visible: boolean;
  area: Area | null;
  onClose: () => void;
  onSubmit: (data: { name: string; addressText: string }) => Promise<void>;
  isLoading?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

function EditAreaSheetContent({
  area,
  onClose,
  onSubmit,
  isLoading = false,
}: Omit<EditAreaSheetProps, "visible">) {
  const { isDarkColorScheme } = useColorScheme();
  const [name, setName] = useState(area?.name || "");
  const [address, setAddress] = useState(area?.addressText || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (area) {
      setName(area.name);
      setAddress(area.addressText || "");
    }
  }, [area]);

  const colors = {
    background: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    cardBg: isDarkColorScheme ? "#334155" : "#F8FAFC",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#475569" : "#E2E8F0",
    inputBg: isDarkColorScheme ? "#0F172A" : "#F1F5F9",
    accent: "#3B82F6",
    overlay: "rgba(0, 0, 0, 0.5)",
  };

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) return;

    Keyboard.dismiss();
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        addressText: address.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [name, address, onSubmit]);

  const canSubmit = name.trim().length > 0 && !isSubmitting && !isLoading;

  return (
    <>
      <Pressable
        style={{ flex: 1, backgroundColor: colors.overlay }}
        onPress={onClose}
      />

      <Animated.View
        entering={FadeIn.duration(200)}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.background,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: SCREEN_HEIGHT * 0.55,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 20,
        }}
      >
        {/* Handle Bar */}
        <View style={{ alignItems: "center", paddingTop: 12 }}>
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: colors.border,
            }}
          />
        </View>

        {/* Header */}
        <LinearGradient
          colors={["#F97316", "#EA580C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            margin: 16,
            marginTop: 16,
            borderRadius: 16,
            padding: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="pencil" size={24} color="white" />
              </View>
              <View>
                <Text
                  style={{ fontSize: 18, fontWeight: "700", color: "white" }}
                >
                  Chỉnh sửa vùng
                </Text>
                <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
                  Cập nhật thông tin
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Content */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 32 }}>
          {/* Name Input */}
          <Animated.View entering={FadeInDown.delay(100).duration(300)}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.subtext,
                marginBottom: 8,
              }}
            >
              TÊN VÙNG *
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.inputBg,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 14,
                marginBottom: 16,
              }}
            >
              <Ionicons name="bookmark" size={18} color={colors.subtext} />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Tên vùng theo dõi"
                placeholderTextColor={colors.subtext}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  paddingHorizontal: 10,
                  fontSize: 15,
                  color: colors.text,
                }}
                maxLength={255}
                editable={!isSubmitting}
              />
            </View>
          </Animated.View>

          {/* Address Input */}
          <Animated.View entering={FadeInDown.delay(200).duration(300)}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.subtext,
                marginBottom: 8,
              }}
            >
              ĐỊA CHỈ
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                backgroundColor: colors.inputBg,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 14,
                paddingVertical: 4,
                marginBottom: 20,
              }}
            >
              <Ionicons
                name="location"
                size={18}
                color={colors.subtext}
                style={{ marginTop: 14 }}
              />
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Địa chỉ (tùy chọn)"
                placeholderTextColor={colors.subtext}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  paddingHorizontal: 10,
                  fontSize: 15,
                  color: colors.text,
                }}
                maxLength={500}
                multiline
                numberOfLines={2}
                editable={!isSubmitting}
              />
            </View>
          </Animated.View>

          {/* Submit Button */}
          <Animated.View entering={FadeInDown.delay(300).duration(300)}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!canSubmit}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  canSubmit ? ["#F97316", "#EA580C"] : ["#94A3B8", "#64748B"]
                }
                style={{
                  borderRadius: 14,
                  paddingVertical: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: "white",
                      }}
                    >
                      Lưu thay đổi
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
    </>
  );
}

export function EditAreaSheet(props: EditAreaSheetProps) {
  if (!props.visible || !props.area) return null;

  return (
    <Modal
      visible={props.visible}
      transparent
      animationType="none"
      onRequestClose={props.onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <EditAreaSheetContent {...props} />
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default EditAreaSheet;
