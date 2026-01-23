import React from "react";
import { Text } from "react-native";

interface ThresholdSectionTitleProps {
  title: string;
  colors: {
    text: string;
  };
}

export function ThresholdSectionTitle({
  title,
  colors,
}: ThresholdSectionTitleProps) {
  return (
    <Text
      style={{
        marginTop: 6,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 6,
        fontSize: 16,
        fontWeight: "800",
        color: colors.text,
      }}
    >
      {title}
    </Text>
  );
}

export default ThresholdSectionTitle;
