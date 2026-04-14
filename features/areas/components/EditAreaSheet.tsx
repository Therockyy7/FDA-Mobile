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
import { SHADOW, RADIUS } from "~/lib/design-tokens";

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
  const [name, setName] = useState(area?.name || "");
  const [address, setAddress] = useState(area?.addressText || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (area) {
      setName(area.name);
      setAddress(area.addressText || "");
    }
  }, [area]);

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
        className="flex-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onPress={onClose}
        testID="areas-modal-edit-overlay"
      />

      <Animated.View
        entering={FadeIn.duration(200)}
        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-800"
        style={{
          borderTopLeftRadius: RADIUS.sheet,
          borderTopRightRadius: RADIUS.sheet,
          maxHeight: SCREEN_HEIGHT * 0.55,
          ...SHADOW.lg,
        }}
        testID="areas-modal-edit-sheet"
      >
        {/* Handle Bar */}
        <View className="items-center pt-3">
          <View className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-600" />
        </View>

        {/* Header */}
        <LinearGradient
          colors={["#F97316", "#EA580C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            margin: 16,
            marginTop: 16,
            borderRadius: RADIUS.card,
            padding: 16,
          }}
        >
          <View className="flex-row items-center justify-between">
            <TouchableOpacity className="flex-row items-center gap-3">
              <View
                className="w-11 h-11 items-center justify-center"
                style={{
                  borderRadius: RADIUS.iconBox,
                  backgroundColor: "rgba(255,255,255,0.2)",
                }}
              >
                <Ionicons name="pencil" size={24} color="white" />
              </View>
              <View>
                <Text className="text-lg font-bold text-white">
                  Chỉnh sửa vùng
                </Text>
                <Text className="text-xs text-white/80">
                  Cập nhật thông tin
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              testID="areas-modal-edit-close"
            >
              <Ionicons name="close" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Content */}
        <View className="px-4 pb-8">
          {/* Name Input */}
          <Animated.View entering={FadeInDown.delay(100).duration(300)}>
            <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
              TÊN VÙNG *
            </Text>
            <View className="flex-row items-center bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-600 px-3.5 mb-4">
              <Ionicons name="bookmark" size={18} color="#64748B" />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Tên vùng theo dõi"
                placeholderTextColor="#94A3B8"
                className="flex-1 py-3.5 px-2.5 text-base text-slate-900 dark:text-slate-100"
                maxLength={255}
                editable={!isSubmitting}
                testID="areas-modal-edit-name-input"
              />
            </View>
          </Animated.View>

          {/* Address Input */}
          <Animated.View entering={FadeInDown.delay(200).duration(300)}>
            <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
              ĐỊA CHỈ
            </Text>
            <View className="flex-row items-start bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-600 px-3.5 py-1 mb-5">
              <Ionicons
                name="location"
                size={18}
                color="#64748B"
                style={{ marginTop: 14 }}
              />
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Địa chỉ (tùy chọn)"
                placeholderTextColor="#94A3B8"
                className="flex-1 py-3.5 px-2.5 text-base text-slate-900 dark:text-slate-100"
                maxLength={500}
                multiline
                numberOfLines={2}
                editable={!isSubmitting}
                testID="areas-modal-edit-address-input"
              />
            </View>
          </Animated.View>

          {/* Submit Button */}
          <Animated.View entering={FadeInDown.delay(300).duration(300)}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!canSubmit}
              activeOpacity={0.8}
              testID="areas-modal-edit-submit"
            >
              <LinearGradient
                colors={
                  canSubmit ? ["#F97316", "#EA580C"] : ["#94A3B8", "#64748B"]
                }
                style={{
                  borderRadius: RADIUS.button,
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
                    <Text className="text-base font-bold text-white">
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
