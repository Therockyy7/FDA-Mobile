// features/alerts/components/alert-thresholds/ThresholdCard.tsx
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import React from "react";
import { Platform, TextInput, View } from "react-native";
import { Text } from "~/components/ui/text";

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
  testID?: string;
}

// Dark/light track color for the Slider — Slider API is JS-only, cannot use NativeWind.
const sliderTrackColor = (bg: string) =>
  bg === "#101922" ? "#374151" : "#E5E7EB";

export function ThresholdCard({
  title,
  color,
  value,
  unit,
  onChange,
  onTextChange,
  colors,
  error,
  testID,
}: ThresholdCardProps) {
  const hasError = !!error && error.length > 0;

  const displayValue = isFinite(value) ? value.toFixed(1) : "0.0";
  const clampedValue = Math.max(0, Math.min(value, 10));

  return (
    <View
      testID={testID}
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
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              backgroundColor: color,
            }}
          />
          <Text
            style={{ fontSize: 16, fontWeight: "800", color: colors.text }}
          >
            {title}
          </Text>
        </View>

        <View style={{ width: 96 }}>
          <View style={{ position: "relative" }}>
            <TextInput
              testID={testID ? `${testID}-input` : "threshold-input"}
              defaultValue={displayValue}
              onChangeText={onTextChange}
              keyboardType={
                Platform.select({
                  ios: "decimal-pad",
                  android: "numeric",
                }) as "decimal-pad" | "numeric"
              }
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
                color: hasError
                  ? "rgba(239,68,68,0.6)"
                  : "rgba(156,163,175,0.9)",
              }}
            >
              {unit}
            </Text>
          </View>
        </View>
      </View>

      <Slider
        testID={testID ? `${testID}-slider` : "threshold-slider"}
        value={clampedValue}
        minimumValue={0}
        maximumValue={10}
        step={0.1}
        onValueChange={onChange}
        minimumTrackTintColor={hasError ? colors.error : colors.primary}
        maximumTrackTintColor={sliderTrackColor(colors.bg)}
        thumbTintColor={hasError ? colors.error : colors.primary}
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 6,
        }}
      >
        <Text style={{ fontSize: 11, color: "rgba(156,163,175,0.9)" }}>
          0.0m
        </Text>
        <Text style={{ fontSize: 11, color: "rgba(156,163,175,0.9)" }}>
          10.0m
        </Text>
      </View>

      {hasError ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginTop: 10,
          }}
        >
          <Ionicons name="alert-circle" size={14} color={colors.error} />
          <Text
            style={{ color: colors.error, fontSize: 12, fontWeight: "600" }}
          >
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default ThresholdCard;
