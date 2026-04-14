// features/map/components/reports/CommunityReportSheet.tsx
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Text } from "~/components/ui/text";
import { NearbyFloodReport, CommunityService } from "~/features/community/services/community.service";
import { PostCard } from "~/features/community/components/PostCard";
import { transformFloodReportToPost } from "~/features/community/types/post-types";

interface CommunityReportSheetProps {
  report: NearbyFloodReport;
  onClose: () => void;
}

export function CommunityReportSheet({ report, onClose }: CommunityReportSheetProps) {
  const [fullReport, setFullReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setFullReport(null);

    (async () => {
      try {
        const data = await CommunityService.getFloodReportById(report.id);
        if (!cancelled) {
          if (data && data.id) {
            setFullReport(data);
          } else {
            setError(true);
          }
        }
      } catch (e) {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [report.id]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center p-10" testID="map-report-sheet">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="mt-3 text-sm text-slate-400">Đang tải báo cáo...</Text>
      </View>
    );
  }

  if (error || !fullReport) {
    const fallbackPost = {
      id: report.id,
      authorId: "",
      authorName: "Người dùng FDA",
      createdAt: report.createdAt,
      content: `Báo cáo ngập lụt tại toạ độ (${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)})`,
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
      <View className="flex-1" testID="map-report-sheet">
        <PostCard post={fallbackPost} />
      </View>
    );
  }

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
    <View className="flex-1" testID="map-report-sheet">
      <PostCard post={postData} />
    </View>
  );
}
