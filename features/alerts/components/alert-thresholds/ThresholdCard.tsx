import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import React from "react";
import { Platform, Text, TextInput, View } from "react-native";

type SeverityKey = "info" | "caution" | "warning" | "critical";

interface ThresholdCardProps {
  title: string;
  color: string;
  value: number;
  unit: string;
  onChange: (value: number) => void;
  onTextChange: (text: string) => void;
  colors: {
    surface: string;
    surfaceSoft: string;
    text: string;
    subtext: string;
    borderSoft: string;
    primary: string;
    error: string;
    errorSoft: string;
    bg: string;
  };
  error?: string;
}

const isDarkTrack = (colors: ThresholdCardProps["colors"]) =>
  colors.bg === "#101922" ? "#374151" : "#E5E7EB";

export function ThresholdCard({
  title,
  color,
  value,
  unit,
  onChange,
  onTextChange,
  colors,
  error,
}: ThresholdCardProps) {
  const hasError = !!error;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: hasError ? 2 : 1,
        borderColor: hasError ? colors.error : colors.borderSoft,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ width: 12, height: 12, borderRadius: 999, backgroundColor: color }} />
          <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>{title}</Text>
        </View>

        <View style={{ width: 96 }}>
          <View style={{ position: "relative" }}>
            <TextInput
              defaultValue={value.toFixed(1)}
              onChangeText={onTextChange}
              keyboardType={Platform.select({ ios: "decimal-pad", android: "numeric" }) as any}
              style={{
                backgroundColor: hasError ? colors.errorSoft : colors.surfaceSoft,
                borderWidth: hasError ? 1 : 0,
                borderColor: hasError ? "rgba(239,68,68,0.35)" : "transparent",
                borderRadius: 10,
                paddingVertical: 8,
                paddingRight: 26,
                paddingLeft: 10,
                textAlign: "right",
                fontSize: 14,
                fontWeight: "700",
                color: hasError ? colors.error : colors.text,
              }}
            />
            <Text
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: [{ translateY: -7 }],
                fontSize: 12,
                color: hasError ? "rgba(239,68,68,0.6)" : "rgba(156,163,175,0.9)",
              }}
            >
              {unit}
            </Text>
          </View>
        </View>
      </View>

      <Slider
        value={value}
        minimumValue={0}
        maximumValue={10}
        step={0.1}
        onValueChange={onChange}
        minimumTrackTintColor={hasError ? colors.error : colors.primary}
        maximumTrackTintColor={isDarkTrack(colors)}
        thumbTintColor={hasError ? colors.error : colors.primary}
      />

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
        <Text style={{ fontSize: 10, color: "rgba(156,163,175,0.9)" }}>0.0m</Text>
        <Text style={{ fontSize: 10, color: "rgba(156,163,175,0.9)" }}>10.0m</Text>
      </View>

      {hasError ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 }}>
          <Ionicons name="alert-circle" size={14} color={colors.error} />
          <Text style={{ color: colors.error, fontSize: 12, fontWeight: "600" }}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default ThresholdCard;
