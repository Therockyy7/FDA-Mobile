// features/map/components/areas/sheets/CreateAreaSheet.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { formatRadius } from "../../../lib/formatters";
import { AreaNameInput } from "./AreaNameInput";
import { AreaAddressInput } from "./AreaAddressInput";

interface CreateAreaSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; addressText: string }) => Promise<void>;
  radiusMeters: number;
  isLoading?: boolean;
  initialValues?: {
    name: string;
    addressText?: string;
  };
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

function CreateAreaSheetContent({
  onClose,
  onSubmit,
  radiusMeters,
  isLoading = false,
  initialValues,
}: Omit<CreateAreaSheetProps, "visible">) {
  const { isDarkColorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(initialValues?.name || "");
  const [address, setAddress] = useState(initialValues?.addressText || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colors = {
    background: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    border: isDarkColorScheme ? "#475569" : "#E2E8F0",
    accent: "#007AFF",
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
      if (!initialValues) {
        setName("");
        setAddress("");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [name, address, onSubmit, initialValues]);

  const canSubmit = name.trim().length > 0 && !isSubmitting && !isLoading;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={{
        width: "100%",
        backgroundColor: colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: SCREEN_HEIGHT * 0.75,
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
        colors={["#007AFF", "#2563EB"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          margin: 16,
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
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
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
              <Ionicons name="bookmark" size={24} color="white" />
            </View>
            <View>
              <Text style={{ fontSize: 18, fontWeight: "700", color: "white" }}>
                {initialValues ? "Cập nhật thông tin" : "Nhập thông tin vùng"}
              </Text>
              <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
                Bán kính: {formatRadius(radiusMeters)}
              </Text>
            </View>
          </View>

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
      <ScrollView
        style={{ flexGrow: 0 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: Math.max(insets.bottom + 20, 32),
        }}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name Input */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)}>
          <AreaNameInput
            value={name}
            onChangeText={setName}
            disabled={isSubmitting}
          />
        </Animated.View>

        {/* Address Input */}
        <Animated.View entering={FadeInDown.delay(200).duration(300)}>
          <AreaAddressInput
            value={address}
            onChangeText={setAddress}
            disabled={isSubmitting}
          />
        </Animated.View>

        {/* Submit Button */}
        <Animated.View entering={FadeInDown.delay(300).duration(300)}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.8}
            style={{
              backgroundColor: canSubmit ? colors.accent : colors.border,
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
                <Text style={{ fontSize: 16, fontWeight: "700", color: "white" }}>
                  {initialValues ? "Cập nhật" : "Tạo vùng theo dõi"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Info Note */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 8,
            marginTop: 16,
          }}
        >
          <Ionicons
            name="information-circle"
            size={16}
            color="#94A3B8"
          />
          <Text style={{ fontSize: 11, color: "#94A3B8", flex: 1 }}>
            Bạn có thể tạo tối đa 5 vùng theo dõi. Nâng cấp Premium để không giới hạn.
          </Text>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

export function CreateAreaSheet(props: CreateAreaSheetProps) {
  if (!props.visible) return null;

  return (
    <Modal
      visible={props.visible}
      transparent
      animationType="none"
      onRequestClose={props.onClose}
    >
      <Pressable
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
        onPress={props.onClose}
      />

      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1, justifyContent: "flex-end" }}
        pointerEvents="box-none"
      >
        <CreateAreaSheetContent {...props} />
      </KeyboardAvoidingView>
    </Modal>
  );
}
