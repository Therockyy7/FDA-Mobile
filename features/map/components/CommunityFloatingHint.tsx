import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { SHADOW } from "~/lib/design-tokens";

interface Props {
  visible: boolean;
}

export function CommunityFloatingHint({ visible }: Props) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;

  // Slide up elegantly when visible
  useEffect(() => {
    if (visible && !dismissed) {
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, dismissed, slideAnim]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  const handleCreateReport = useCallback(() => {
    router.push("/community/create-post" as any);
  }, [router]);

  const handleGoToCommunity = useCallback(() => {
    router.push("/community" as any);
  }, [router]);

  if (!visible && dismissed) return null;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [150, 0],
  });

  const opacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 24,
        zIndex: 50,
        transform: [{ translateY }],
        opacity,
      }}
      pointerEvents={dismissed ? "none" : "auto"}
    >
      <View
        style={{
          borderRadius: 20,
          overflow: "hidden",
          ...SHADOW.lg,
          borderWidth: 1,
        }}
        className="border-black/5 dark:border-white/10"
      >
        <LinearGradient
          colors={["rgba(255,255,255,0.95)", "rgba(248,250,252,0.95)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ padding: 16 }}
        >
          {/* Close Button */}
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 10,
              padding: 4,
            }}
            onPress={handleDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="close"
              size={18}
              className="text-muted-foreground"
              color="#64748B"
            />
          </TouchableOpacity>

          {/* Header row: Icon + Text */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingRight: 24 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#EEF2FF",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="megaphone" size={20} color="#6366F1" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                className="text-foreground font-extrabold"
                style={{ fontSize: 15, marginBottom: 2, letterSpacing: -0.2 }}
              >
                Cập nhật ngập lụt
              </Text>
              <Text
                className="text-muted-foreground"
                style={{ fontSize: 11, fontWeight: "500", lineHeight: 16 }}
              >
                Phát hiện điểm ngập? Hãy báo cáo để hỗ trợ cộng đồng di chuyển an toàn hơn.
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
            <TouchableOpacity
              onPress={handleCreateReport}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                backgroundColor: "#6366F1",
                paddingVertical: 10,
                borderRadius: 12,
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={14} color="#FFFFFF" />
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#FFFFFF" }}>
                Báo cáo ngay
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleGoToCommunity}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
              }}
              className="bg-muted dark:bg-white/5"
              activeOpacity={0.8}
            >
              <Text
                className="text-secondary-foreground font-bold"
                style={{ fontSize: 13 }}
              >
                Vào Cộng đồng
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Animated.View>
  );
}
