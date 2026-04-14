// features/alerts/components/alert-thresholds/ThresholdDivider.tsx
// Thin wrapper kept for backward-compat; delegates to shared Divider.
import { Divider } from "~/components/ui/Divider";

interface ThresholdDividerProps {
  colors?: {
    borderSoft: string;
  };
  testID?: string;
}

export function ThresholdDivider({ testID }: ThresholdDividerProps) {
  return <Divider testID={testID} />;
}

export default ThresholdDivider;
