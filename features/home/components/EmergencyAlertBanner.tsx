
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Animated, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { Alert } from "../types/home-types";

interface EmergencyAlertBannerProps {
  alert: Alert;
}

export function EmergencyAlertBanner({ alert }: EmergencyAlertBannerProps) {
  const router = useRouter();
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <View className="p-4">
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push("/notifications" as any)}
          style={{
            shadowColor: "#EF4444",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <LinearGradient
            colors={["#DC2626", "#991B1B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-xl overflow-hidden"
          >
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-1 gap-2">
                <View className="flex-row items-center gap-2">
                  <View className="w-6 h-6 bg-white/30 rounded-full items-center justify-center">
                    <Ionicons name="warning" size={16} color="white" />
                  </View>
                  <Text className="text-white text-sm font-bold">
                    Mức độ Nguy hiểm
                  </Text>
                </View>
                <Text className="text-white text-lg font-bold leading-tight">
                  {alert.title}
                </Text>
                <Text className="text-red-100 text-xs">{alert.subtitle}</Text>
                <Text className="text-red-100 text-xs">
                  Phát hành lúc {alert.time} - {alert.date}
                </Text>
              </View>
              <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center">
                <MaterialIcons name="flood" size={36} color="white" />
              </View>
            </View>

            {/* Progress bar */}
            <View className="h-1 bg-white/20">
              <View className="h-full w-3/4 bg-white/50" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
