// features/alerts/components/alert-history/AlertHistorySectionTitle.tsx
import React from "react";
import { SectionHeader } from "~/components/ui/SectionHeader";

interface AlertHistorySectionTitleProps {
  title: string;
  color?: string;
}

export function AlertHistorySectionTitle({
  title,
  color,
}: AlertHistorySectionTitleProps) {
  return (
    <SectionHeader
      testID="alerts-history-section-title"
      title={title}
      className={color ? `text-[${color}]` : ""}
    />
  );
}

export default AlertHistorySectionTitle;
