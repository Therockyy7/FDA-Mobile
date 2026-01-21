// features/areas/types/flood-history.types.ts
// Types for FeatG39 (GetFloodHistory), FeatG40 (GetFloodTrends), FeatG41 (GetFloodStatistics)

// ==================== REQUEST TYPES ====================

export interface FloodHistoryParams {
  stationId?: string;
  stationIds?: string[];
  areaId?: string;
  startDate?: string;
  endDate?: string;
  granularity?: "raw" | "hourly" | "daily";
  limit?: number;
  cursor?: string;
}

export interface FloodTrendsParams {
  stationId: string;
  period?: "last7days" | "last30days" | "last90days" | "last365days" | "custom";
  startDate?: string;
  endDate?: string;
  granularity?: "daily" | "weekly" | "monthly";
  compareWithPrevious?: boolean;
}

export interface FloodStatisticsParams {
  stationId?: string;
  stationIds?: string[];
  areaId?: string;
  period?: "last7days" | "last30days" | "last90days" | "last365days";
  includeBreakdown?: boolean;
}

// ==================== RESPONSE TYPES ====================

export type FloodSeverity = "safe" | "caution" | "warning" | "critical";

export interface FloodDataPoint {
  timestamp: string;
  value: number;
  valueMeters?: number;
  qualityFlag?: "ok" | "suspect" | "bad";
  severity?: FloodSeverity;
}

export interface FloodHistoryMetadata {
  startDate: string;
  endDate: string;
  granularity: string;
  totalDataPoints: number;
  missingIntervals: number;
  lastUpdated?: string;
}

export interface FloodHistoryData {
  stationId: string;
  stationName: string;
  stationCode: string;
  dataPoints: FloodDataPoint[];
  metadata: FloodHistoryMetadata;
}

export interface FloodHistoryResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: FloodHistoryData;
  pagination?: {
    hasMore: boolean;
    nextCursor?: string;
    totalCount: number;
  };
}

// ==================== TRENDS TYPES ====================

export interface FloodTrendDataPoint {
  period: string;
  periodStart: string;
  periodEnd: string;
  maxLevel: number;
  minLevel: number;
  avgLevel: number;
  readingCount: number;
  floodHours: number;
  rainfallTotal?: number;
  peakSeverity: FloodSeverity;
}

export interface TrendComparison {
  previousPeriodStart: string;
  previousPeriodEnd: string;
  avgLevelChange: number;
  floodHoursChange: number;
  peakLevelChange: number;
}

export interface TrendSummary {
  totalFloodHours: number;
  avgWaterLevel: number;
  maxWaterLevel: number;
  daysWithFlooding: number;
  mostAffectedDay?: string;
}

export interface FloodTrendsData {
  stationId: string;
  stationName: string;
  period: string;
  granularity: string;
  dataPoints: FloodTrendDataPoint[];
  comparison?: TrendComparison;
  summary: TrendSummary;
}

export interface FloodTrendsResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: FloodTrendsData;
}

// ==================== STATISTICS TYPES ====================

export interface SeverityBreakdown {
  hoursSafe: number;
  hoursCaution: number;
  hoursWarning: number;
  hoursCritical: number;
}

export interface MissingInterval {
  start: string;
  end: string;
  durationMinutes: number;
}

export interface DataQuality {
  completeness: number;
  missingIntervals: MissingInterval[];
}

export interface StatisticsSummary {
  maxWaterLevel: number;
  minWaterLevel: number;
  avgWaterLevel: number;
  totalFloodHours: number;
  totalReadings: number;
  missingIntervals: number;
}

export interface StatisticsComparison {
  avgLevelChange?: number;
  floodHoursChange?: number;
}

export interface FloodStatisticsData {
  stationId: string;
  stationName: string;
  stationCode: string;
  periodStart: string;
  periodEnd: string;
  summary: StatisticsSummary;
  severityBreakdown?: SeverityBreakdown;
  comparison?: StatisticsComparison;
  dataQuality?: DataQuality;
}

export interface FloodStatisticsResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: FloodStatisticsData;
}

// ==================== UI HELPER TYPES ====================

export type ChartPeriod = "24h" | "7d" | "30d" | "90d" | "custom";

export interface ChartPeriodOption {
  value: ChartPeriod;
  label: string;
  granularity: "hourly" | "daily";
  days: number;
}

export const CHART_PERIODS: ChartPeriodOption[] = [
  { value: "24h", label: "24 giờ", granularity: "hourly", days: 1 },
  { value: "7d", label: "7 ngày", granularity: "daily", days: 7 },
  { value: "30d", label: "30 ngày", granularity: "daily", days: 30 },
  { value: "90d", label: "90 ngày", granularity: "daily", days: 90 },
];

export const SEVERITY_CHART_COLORS: Record<FloodSeverity, string> = {
  safe: "#10B981",
  caution: "#FBBF24",
  warning: "#F97316",
  critical: "#EF4444",
};
