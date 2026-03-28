// features/map/components/reports/CommunityReportSheet.tsx
import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView, View, ActivityIndicator, Text } from "react-native";
import { NearbyFloodReport, CommunityService } from "~/features/community/services/community.service";
import { PostCard } from "~/features/community/components/PostCard";
import { getPostMock } from "../../lib/post-adapter";

interface CommunityReportSheetProps {
  report: NearbyFloodReport;
  onClose: () => void;
}

export function CommunityReportSheet({ report, onClose }: CommunityReportSheetProps) {
  const [fullReport, setFullReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await CommunityService.getFloodReportById(report.id);
        if (!cancelled) setFullReport(data);
      } catch {
        // non-critical
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
        <Text style={styles.loadingText}>Đang tải báo cáo...</Text>
      </View>
    );
  }

  if (!fullReport) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Không thể tải báo cáo</Text>
      </View>
    );
  }

  const postMock = getPostMock(fullReport) as any;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <PostCard post={postMock} />
    </ScrollView>
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
