import React from "react";
import { View } from "react-native";

interface ThresholdDividerProps {
  colors: {
    borderSoft: string;
  };
}

export function ThresholdDivider({ colors }: ThresholdDividerProps) {
  return <View style={{ height: 1, backgroundColor: colors.borderSoft }} />;
}

export default ThresholdDivider;
