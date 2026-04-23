// features/map/components/reports/CommunityReportSheet.tsx
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator, Text } from "react-native";
import { NearbyFloodReport, CommunityService } from "~/features/community/services/community.service";
import { PostCard } from "~/features/community/components/PostCard";
import { transformFloodReportToPost } from "~/features/community/types/post-types";
import { useTranslation } from "~/features/i18n";

interface CommunityReportSheetProps {
  report: NearbyFloodReport;
  onClose: () => void;
}

export function CommunityReportSheet({ report, onClose }: CommunityReportSheetProps) {
  const [fullReport, setFullReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setFullReport(null);

    (async () => {
      try {
        const data = await CommunityService.getFloodReportById(report.id);
        console.log("[CommunityReportSheet] Fetched report data:", JSON.stringify(data, null, 2));
        if (!cancelled) {
          if (data && data.id) {
            setFullReport(data);
          } else {
            console.warn("[CommunityReportSheet] Report missing id field:", data);
            setError(true);
          }
        }
      } catch (e) {
        console.error("[CommunityReportSheet] Error fetching report:", e);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [report.id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>{t("community.report.loading")}</Text>
      </View>
    );
  }

  if (error || !fullReport) {
    // Fallback: render minimal card from NearbyFloodReport (marker data)
    const fallbackPost = {
      id: report.id,
      authorId: "",
      authorName: t("community.report.author"),
      createdAt: report.createdAt,
      content: `${t("community.report.floodAt")} (${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)})`,
      waterLevelStatus: (
        report.severity === "high" ? "danger" :
        report.severity === "medium" ? "warning" : "safe"
      ) as "safe" | "warning" | "danger",
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      latitude: report.latitude,
      longitude: report.longitude,
      severity: report.severity,
    };

    return (
      <View style={styles.container}>
        <PostCard post={fallbackPost} />
      </View>
    );
  }

  // Build compatible object for transformFloodReportToPost
  const reportForTransform = {
    id: fullReport.id,
    reporterUserId: fullReport.reporterUserId ?? "",
    latitude: fullReport.latitude,
    longitude: fullReport.longitude,
    address: fullReport.address ?? "",
    description: fullReport.description ?? "",
    severity: fullReport.severity ?? "medium",
    trustScore: fullReport.trustScore ?? 0,
    score: fullReport.score ?? fullReport.trustScore ?? 0,
    status: fullReport.status ?? "",
    confidenceLevel: fullReport.confidenceLevel ?? "medium",
    createdAt: fullReport.createdAt ?? report.createdAt,
    media: fullReport.media ?? [],
  };

  const postData = transformFloodReportToPost(reportForTransform);

  return (
    <View style={styles.container}>
      <PostCard post={postData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#94A3B8",
  },
});
