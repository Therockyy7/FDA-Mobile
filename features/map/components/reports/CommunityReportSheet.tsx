import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Text, ActivityIndicator } from 'react-native';
import { NearbyFloodReport, CommunityService } from '~/features/community/services/community.service';
import { PostCard } from '~/features/community/components/PostCard';

interface Props {
  report: NearbyFloodReport;
  onClose: () => void;
}

export function CommunityReportSheet({ report, onClose }: Props) {
  const [fullReport, setFullReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await CommunityService.getFloodReportById(report.id);
        if (!cancelled) setFullReport(data);
      } catch (err) {
        console.error('Failed to load report details:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [report.id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Đang tải báo cáo...</Text>
      </View>
    );
  }

  if (!fullReport) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Không thể tải báo cáo</Text>
      </View>
    );
  }

  const postMock = {
    ...fullReport,
    author: {
      id: fullReport.reporterUserId,
      name: "Người dùng FDA",
      avatar: "https://minervastrategies.com/wp-content/uploads/2016/03/default-avatar.jpg",
      isVerified: false,
    },
    images: fullReport.media?.filter((m: any) => m.mediaType === 'photo').map((m: any) => m.mediaUrl) || [],
    videos: fullReport.media?.filter((m: any) => m.mediaType === 'video').map((m: any) => m.mediaUrl) || [],
    likes: fullReport.score || 0,
    comments: 0,
    shares: 0,
    isLiked: false,
    content: fullReport.description,
    location: fullReport.address,
  } as any;

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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#94A3B8',
  },
});
