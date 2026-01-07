// app/(tabs)/notifications/[id].tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    Alert,
    ScrollView,
    TouchableOpacity,
    View,
} from "react-native";
import { Text } from "~/components/ui/text";
import { MOCK_NOTIFICATIONS } from "~/features/notifications/constants/notifications-data";
import { getCategoryIcon, getPriorityConfig } from "~/features/notifications/lib/notifications-utils";
import { Notification } from "~/features/notifications/types/notifications-types";
import { useColorScheme } from "~/lib/useColorScheme";

export default function NotificationDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();
  const notification = MOCK_NOTIFICATIONS.find((n) => n.id === id) as Notification;
  const config = getPriorityConfig(notification?.priority || "medium");

  // Theme colors
  const colors = {
    background: isDarkColorScheme ? "#0F172A" : "#F8FAFC",
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#111827",
    subtext: isDarkColorScheme ? "#94A3B8" : "#6B7280",
    muted: isDarkColorScheme ? "#64748B" : "#9CA3AF",
    border: isDarkColorScheme ? "#334155" : "#E5E7EB",
    headerBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    buttonBg: isDarkColorScheme ? "#1E293B" : "#F3F4F6",
  };

  if (!notification) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 40, backgroundColor: colors.background }}>
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: "#FEF3C7",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <Ionicons name="alert-circle-outline" size={50} color="#F59E0B" />
        </View>
        <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text, marginBottom: 8, textAlign: "center" }}>
          Không tìm thấy
        </Text>
        <Text style={{ fontSize: 14, color: colors.subtext, textAlign: "center", marginBottom: 24 }}>
          Thông báo này không tồn tại hoặc đã bị xóa
        </Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{
            paddingHorizontal: 32,
            paddingVertical: 14,
            backgroundColor: "#3B82F6",
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "white", fontSize: 15, fontWeight: "700" }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getRiskColor = (level: number) => {
    if (level >= 80) return "#DC2626";
    if (level >= 50) return "#F59E0B";
    if (level >= 30) return "#D97706";
    return "#10B981";
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            backgroundColor: colors.headerBg,
            paddingTop: 60,
            paddingBottom: 24,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={{ 
              width: 44, 
              height: 44, 
              borderRadius: 14, 
              backgroundColor: colors.buttonBg, 
              justifyContent: "center", 
              alignItems: "center", 
              marginBottom: 20,
            }}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>

          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 16 }}>
            {/* Icon */}
            <View style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: config.bgColor,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: config.color + "40",
            }}>
              <Ionicons 
                name={getCategoryIcon(notification.category)} 
                size={30} 
                color={config.color} 
              />
            </View>
            
            <View style={{ flex: 1 }}>
              {/* Priority Badge */}
              <View
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: config.color + "20",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "800",
                    color: config.color,
                    textTransform: "uppercase",
                  }}
                >
                  {config.label}
                </Text>
              </View>
              
              <Text style={{ 
                fontSize: 22, 
                fontWeight: "800", 
                color: colors.text, 
                lineHeight: 28,
                marginBottom: 6,
              }}>
                {notification.title}
              </Text>
              
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <Ionicons name="location" size={14} color={colors.subtext} />
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.subtext }}>
                  {notification.location}
                </Text>
              </View>
              
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="time-outline" size={14} color={colors.muted} />
                <Text style={{ fontSize: 13, fontWeight: "500", color: colors.muted }}>
                  {notification.timeAgo}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Water Level Card */}
        <View style={{
          margin: 20,
          backgroundColor: colors.cardBg,
          borderRadius: 24,
          padding: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDarkColorScheme ? 0.3 : 0.08,
          shadowRadius: 16,
          elevation: 6,
          borderWidth: isDarkColorScheme ? 1 : 0,
          borderColor: colors.border,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: "#3B82F620",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="water" size={18} color="#3B82F6" />
            </View>
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>
              Mực nước hiện tại
            </Text>
          </View>
          
          {/* Water Visualization */}
          <View style={{ 
            height: 140, 
            backgroundColor: isDarkColorScheme ? "#0F172A" : "#F1F5F9", 
            borderRadius: 16, 
            overflow: "hidden",
            marginBottom: 16,
          }}>
            {/* Water level fill */}
            <View style={{
              position: "absolute",
              bottom: 0,
              left: 0, 
              right: 0,
              height: `${Math.min((notification.waterLevel || 0) / 1.2, 90)}%`,
              backgroundColor: getRiskColor(notification.waterLevel || 0),
              opacity: 0.3,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            }} />
            
            {/* Water level indicator */}
            <View style={{
              position: "absolute",
              top: "40%",
              left: 0,
              right: 0,
              alignItems: "center",
            }}>
              <View style={{
                backgroundColor: colors.cardBg,
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 6,
                alignItems: "center",
              }}>
                <Text style={{ 
                  fontSize: 36, 
                  fontWeight: "900", 
                  color: getRiskColor(notification.waterLevel || 0),
                }}>
                  {notification.waterLevel}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.subtext }}>
                  cm
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Row */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{
              flex: 1,
              backgroundColor: isDarkColorScheme ? "#0F172A" : "#F8FAFC",
              padding: 14,
              borderRadius: 14,
              alignItems: "center",
            }}>
              <Text style={{ fontSize: 20, fontWeight: "800", color: getRiskColor(notification.waterLevel || 0) }}>
                {notification.waterLevel}cm
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>Hiện tại</Text>
            </View>
            <View style={{
              flex: 1,
              backgroundColor: isDarkColorScheme ? "#0F172A" : "#F8FAFC",
              padding: 14,
              borderRadius: 14,
              alignItems: "center",
            }}>
              <Text style={{ fontSize: 20, fontWeight: "800", color: "#10B981" }}>
                {notification.affectedArea}
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>Diện tích</Text>
            </View>
          </View>
        </View>

        {/* Map Preview */}
        <TouchableOpacity
          onPress={() => router.push("/map" as any)}
          style={{
            marginHorizontal: 20,
            height: 160,
            backgroundColor: colors.cardBg,
            borderRadius: 24,
            overflow: "hidden",
            marginBottom: 20,
            borderWidth: isDarkColorScheme ? 1 : 0,
            borderColor: colors.border,
          }}
        >
          <View style={{ 
            flex: 1, 
            backgroundColor: isDarkColorScheme ? "#1E3A8A20" : "#EFF6FF",
            justifyContent: "center", 
            alignItems: "center",
          }}>
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 20,
                backgroundColor: "#3B82F620",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <Ionicons name="map" size={28} color="#3B82F6" />
            </View>
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>
              Xem trên bản đồ
            </Text>
            <Text style={{ fontSize: 13, color: colors.subtext, marginTop: 4 }}>
              {notification.location}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Timeline */}
        <View style={{
          marginHorizontal: 20,
          backgroundColor: colors.cardBg,
          borderRadius: 24,
          padding: 20,
          marginBottom: 20,
          borderWidth: isDarkColorScheme ? 1 : 0,
          borderColor: colors.border,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: "#8B5CF620",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="git-branch-outline" size={18} color="#8B5CF6" />
            </View>
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>
              Diễn biến
            </Text>
          </View>
          
          <View style={{ gap: 16 }}>
            {[
              { icon: "time-outline", color: config.color, title: "Phát hiện ban đầu", desc: `${notification.timeAgo} - ${notification.waterLevel}cm` },
              { icon: "shield-checkmark-outline", color: "#10B981", title: "Hệ thống cảnh báo", desc: `Cấp độ ${config.label}` },
              { icon: "megaphone-outline", color: "#F59E0B", title: "Thông báo cộng đồng", desc: `${notification.affectedArea} khu vực` },
            ].map((item, index) => (
              <View key={index} style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                <View style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: item.color + "20",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Ionicons name={item.icon as any} size={18} color={item.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>
                    {item.title}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.subtext, marginTop: 2 }}>
                    {item.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Description */}
        {notification.description && (
          <View style={{
            marginHorizontal: 20,
            backgroundColor: colors.cardBg,
            borderRadius: 24,
            padding: 20,
            marginBottom: 20,
            borderWidth: isDarkColorScheme ? 1 : 0,
            borderColor: colors.border,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: "#06B6D420",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="document-text-outline" size={18} color="#06B6D4" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>
                Chi tiết
              </Text>
            </View>
            <Text style={{ fontSize: 15, color: colors.subtext, lineHeight: 24 }}>
              {notification.description}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={{ marginHorizontal: 20, gap: 12 }}>
          {notification.actions?.viewMap && (
            <TouchableOpacity
              onPress={() => router.push("/map" as any)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                paddingVertical: 16,
                borderRadius: 16,
                backgroundColor: "#3B82F6",
              }}
            >
              <Ionicons name="map" size={20} color="white" />
              <Text style={{ fontSize: 16, fontWeight: "700", color: "white" }}>
                Xem bản đồ
              </Text>
            </TouchableOpacity>
          )}
          {notification.actions?.getDirections && (
            <TouchableOpacity
              onPress={() => Alert.alert("Lộ trình", "Mở Google Maps Directions")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                paddingVertical: 16,
                borderRadius: 16,
                backgroundColor: colors.buttonBg,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Ionicons name="navigate" size={20} color="#3B82F6" />
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#3B82F6" }}>
                Lộ trình tránh ngập
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
