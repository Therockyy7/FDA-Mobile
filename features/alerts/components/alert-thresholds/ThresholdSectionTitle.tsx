// features/alerts/components/alert-thresholds/ThresholdSectionTitle.tsx
// Thin wrapper over shared SectionHeader for threshold section titles.
import React from "react";
import { SectionHeader } from "~/components/ui/SectionHeader";

interface ThresholdSectionTitleProps {
  title: string;
  colors?: {
    text: string;
  };
  testID?: string;
}

export function ThresholdSectionTitle({
  title,
  testID,
}: ThresholdSectionTitleProps) {
  return (
    <SectionHeader
      title={title}
      testID={testID}
      className="mt-1.5 px-4 pt-2.5 pb-1.5"
    />
  );
}

export default ThresholdSectionTitle;
