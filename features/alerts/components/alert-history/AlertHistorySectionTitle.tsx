// features/alerts/components/alert-history/AlertHistorySectionTitle.tsx
import React from "react";
import { Text } from "~/components/ui/text";

interface AlertHistorySectionTitleProps {
  title: string;
  color: string;
}

export function AlertHistorySectionTitle({
  title,
  color,
}: AlertHistorySectionTitleProps) {
  return (
    <Text
      style={{
        fontSize: 12,
        letterSpacing: 2,
        color,
        textTransform: "uppercase",
        paddingLeft: 4,
        fontWeight: "800",
      }}
    >
      {title}
    </Text>
  );
}

export default AlertHistorySectionTitle;
