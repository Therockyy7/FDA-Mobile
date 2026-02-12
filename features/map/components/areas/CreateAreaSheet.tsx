// features/map/components/areas/CreateAreaSheet.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

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

// Format radius for display
function formatRadius(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters} m`;
}

// Quick select tags for area names
const AREA_TAGS = [
  { id: "home", label: "Nhà", icon: "home", color: "#10B981" },
  { id: "office", label: "Công ty", icon: "business", color: "#3B82F6" },
  { id: "school", label: "Trường học", icon: "school", color: "#F59E0B" },
  { id: "market", label: "Chợ", icon: "cart", color: "#EF4444" },
  { id: "hospital", label: "Bệnh viện", icon: "medkit", color: "#EC4899" },
  { id: "warehouse", label: "Kho hàng", icon: "cube", color: "#8B5CF6" },
] as const;

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
      // Only reset if creating new
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
          colors={["#3B82F6", "#2563EB"]}
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
            <View
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
                <Ionicons name="bookmark" size={24} color="white" />
              </View>
              <View>
                <Text
                  style={{ fontSize: 18, fontWeight: "700", color: "white" }}
                >
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
        >
          {/* Name Input */}
          <Animated.View entering={FadeInDown.delay(100).duration(300)}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.subtext,
                marginBottom: 8,
                letterSpacing: 0.5,
              }}
            >
              TÊN VÙNG *
            </Text>

            {/* Quick Select Tags */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 12,
              }}
            >
              {AREA_TAGS.map((tag) => {
                const isSelected = name === tag.label;
                return (
                  <TouchableOpacity
                    key={tag.id}
                    onPress={() => setName(isSelected ? "" : tag.label)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: isSelected
                        ? tag.color
                        : `${tag.color}15`,
                      borderWidth: 1.5,
                      borderColor: isSelected ? tag.color : `${tag.color}40`,
                    }}
                  >
                    <Ionicons
                      name={tag.icon as any}
                      size={16}
                      color={isSelected ? "white" : tag.color}
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: isSelected ? "white" : tag.color,
                      }}
                    >
                      {tag.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

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
                placeholder="Hoặc nhập tên tùy chỉnh..."
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
              {name.length > 0 && (
                <TouchableOpacity onPress={() => setName("")}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={colors.subtext}
                  />
                </TouchableOpacity>
              )}
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
                letterSpacing: 0.5,
              }}
            >
              ĐỊA CHỈ (Tùy chọn)
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
                placeholder="VD: 123 Nguyễn Huệ, Quận 1, TP.HCM"
                placeholderTextColor={colors.subtext}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  paddingHorizontal: 10,
                  fontSize: 15,
                  color: colors.text,
                  minHeight: 60,
                  textAlignVertical: "top",
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
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "white",
                    }}
                  >
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
              color={colors.subtext}
            />
            <Text style={{ fontSize: 11, color: colors.subtext, flex: 1 }}>
              Bạn có thể tạo tối đa 5 vùng theo dõi. Nâng cấp Premium để không
              giới hạn.
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </>
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <CreateAreaSheetContent {...props} />
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default CreateAreaSheet;
