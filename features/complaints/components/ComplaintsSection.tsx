// features/complaints/components/ComplaintsSection.tsx
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { complaintService } from "../services/complaint.service";

const ComplaintsSection: React.FC = () => {
  const { isDarkColorScheme } = useColorScheme();
  const router = useRouter();
  const isDark = isDarkColorScheme;

  const colors = {
    background: isDark ? "#0F172A" : "#F8FAFB",
    cardBg: isDark ? "#1E293B" : "#FFFFFF",
    text: isDark ? "#F1F5F9" : "#1F2937",
    subtext: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    divider: isDark ? "#334155" : "#F1F5F9",
    sectionTitle: isDark ? "#F59E0B" : "#D97706",
    iconHover: isDark ? "rgba(245, 158, 11, 0.15)" : "rgba(217, 119, 6, 0.1)",
    cardIconBg: isDark ? "rgba(245, 158, 11, 0.1)" : "rgba(217, 119, 6, 0.08)",
  };

  const { data } = useQuery({
    queryKey: ["complaints", "my"],
    queryFn: () => complaintService.getMyComplaints(),
    staleTime: 60_000,
  });

  const records = data?.data ?? [];
  const openCount = records.filter((r) => r.status === "open").length;

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
      {/* Section Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: colors.iconHover,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
          }}
        >
          <Ionicons name="chatbubbles-outline" size={16} color={colors.sectionTitle} />
        </View>
        <Text style={{ fontSize: 17, fontWeight: "800", color: colors.text }}>
          Hỗ trợ & Khiếu nại
        </Text>
      </View>

      {/* Card */}
      <View
        style={{
          backgroundColor: colors.cardBg,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
        }}
      >
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
          }}
          onPress={() => router.push("/complaints" as any)}
          activeOpacity={0.7}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              backgroundColor: colors.cardIconBg,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 14,
            }}
          >
            <Ionicons name="shield-checkmark-outline" size={22} color={colors.sectionTitle} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>
              Trung tâm khiếu nại
            </Text>
            {openCount > 0 ? (
              <Text style={{ fontSize: 13, color: colors.sectionTitle, marginTop: 2, fontWeight: "600" }}>
                Có {openCount} khiếu nại đang chờ xử lý
              </Text>
            ) : (
              <Text style={{ fontSize: 13, color: colors.subtext, marginTop: 2 }}>
                Gửi hỗ trợ về gói cước & thanh toán
              </Text>
            )}
          </View>

          <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ComplaintsSection;
