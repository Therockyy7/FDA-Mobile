// app/(tabs)/notifications/[id].tsx
import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { MOCK_NOTIFICATIONS } from "~/features/notifications/constants/notifications-data";
import { getCategoryIcon, getPriorityConfig } from "~/features/notifications/lib/notifications-utils";
import { Notification } from "~/features/notifications/types/notifications-types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function NotificationDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const notification = MOCK_NOTIFICATIONS.find((n) => n.id === id) as Notification;
  const config = getPriorityConfig(notification?.priority || "medium");

  if (!notification) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 40, backgroundColor: "#F3F4F6" }}>
        <Ionicons name="alert-circle-outline" size={80} color="#F59E0B" />
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#6B7280", marginTop: 16, textAlign: "center" }}>
          Thông báo không tồn tại
        </Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{
            marginTop: 24,
            paddingHorizontal: 32,
            paddingVertical: 16,
            backgroundColor: "#3B82F6",
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getRiskColor = (level: number) => {
    if (level >= 80) return "#DC2626";
    if (level >= 50) return "#F59E0B";
    if (level >= 30) return "#D97706";
    return "#059669";
  };

  const getRiskLabel = (level: number) => {
    if (level >= 80) return "CỰC KHUẨN";
    if (level >= 60) return "KHẨN CẤP";
    if (level >= 40) return "NGUY HIỂM";
    if (level >= 20) return "CẢNH BÁO";
    return "THẤP";
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: "#F9FAFB" }} 
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20 }}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={{ 
            width: 40, height: 40, borderRadius: 20, 
            backgroundColor: "rgba(255,255,255,0.8)", 
            justifyContent: "center", alignItems: "center", 
            marginBottom: 16 
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>

        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 16 }}>
          {/* Priority dot */}
          <View style={{
            width: 12, height: 12, borderRadius: 6,
            backgroundColor: config.color, marginTop: 4
          }} />
          
          <View style={{ flex: 1 }}>
            <Text style={{ 
              fontSize: 15, fontWeight: "600", 
              color: "#6B7280", marginBottom: 8 
            }}>
              {notification.timeAgo}
            </Text>
            <Text style={{ 
              fontSize: 28, fontWeight: "800", 
              color: "#111827", lineHeight: 34, marginBottom: 4 
            }}>
              {notification.title}
            </Text>
            <Text style={{ 
              fontSize: 16, fontWeight: "600", 
              color: "#374151" 
            }}>
              {notification.location}
            </Text>
          </View>
          
          <View style={{
            width: 72, height: 72, borderRadius: 36,
            backgroundColor: config.color + "20",
            alignItems: "center", justifyContent: "center"
          }}>
            <Ionicons 
              name={getCategoryIcon(notification.category)} 
              size={32} 
              color={config.color} 
            />
          </View>
        </View>
      </View>

      {/* Water Level Card */}
      <View style={{
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
      }}>
        <Text style={{ 
          fontSize: 16, fontWeight: "700", 
          color: "#111827", marginBottom: 16 
        }}>
          Mực nước hiện tại
        </Text>
        
        <View style={{ height: 120, backgroundColor: "#F3F4F6", borderRadius: 12, overflow: "hidden" }}>
          {/* Water background */}
          <View style={{
            flex: 1,
            backgroundColor: getRiskColor(notification.waterLevel || 0),
            opacity: 0.2,
          }} />
          
          {/* Water level */}
          <View style={{
            position: "absolute",
            bottom: 0,
            left: 0, right: 0,
            height: `${Math.min((notification.waterLevel || 0) / 1.2, 90)}%`,
            backgroundColor: getRiskColor(notification.waterLevel || 0),
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }} />
          
          {/* Level marker */}
          <View style={{
            position: "absolute",
            bottom: `${Math.max(10, 100 - ((notification.waterLevel || 0) / 1.2))}%`,
            left: "50%",
            marginLeft: -30,
          }}>
            <View style={{
              width: 60, height: 28, borderRadius: 14,
              backgroundColor: "white",
              alignItems: "center", justifyContent: "center",
              shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1, shadowRadius: 4, elevation: 4,
            }}>
              <Text style={{ 
                fontSize: 14, fontWeight: "800", 
                color: getRiskColor(notification.waterLevel || 0) 
              }}>
                {notification.waterLevel}cm
              </Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
          <View style={{ alignItems: "center", flex: 1 }}>
            <Text style={{ 
              fontSize: 28, fontWeight: "900", 
              color: getRiskColor(notification.waterLevel || 0) 
            }}>
              {notification.waterLevel}cm
            </Text>
            <Text style={{ fontSize: 13, color: "#6B7280" }}>Hiện tại</Text>
          </View>
          <View style={{ alignItems: "center", flex: 1 }}>
            <Text style={{ 
              fontSize: 24, fontWeight: "800", 
              color: "#059669" 
            }}>
              {notification.affectedArea}
            </Text>
            <Text style={{ fontSize: 13, color: "#6B7280" }}>Diện tích</Text>
          </View>
        </View>
      </View>

      {/* Map Preview */}
      <TouchableOpacity
        onPress={() => Alert.alert("Bản đồ", "Mở Google Maps")}
        style={{
          marginHorizontal: 20,
          height: 200,
          backgroundColor: "#F3F4F6",
          borderRadius: 20,
          overflow: "hidden",
          marginBottom: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Ionicons name="map" size={56} color="#3B82F6" />
          <Text style={{ 
            fontSize: 18, fontWeight: "700", 
            color: "#374151", marginTop: 12 
          }}>
            Xem trên bản đồ
          </Text>
          <Text style={{ 
            fontSize: 14, color: "#6B7280", 
            marginTop: 4 
          }}>
            {notification.location}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Timeline */}
      <View style={{
        marginHorizontal: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
        marginBottom: 20,
      }}>
        <Text style={{ 
          fontSize: 18, fontWeight: "700", 
          color: "#111827", marginBottom: 20 
        }}>
          Diễn biến
        </Text>
        
        <View style={{ gap: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <View style={{
              width: 32, height: 32, borderRadius: 16,
              backgroundColor: config.color,
              alignItems: "center", justifyContent: "center"
            }}>
              <Ionicons name="time-outline" size={18} color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}>
                Phát hiện ban đầu
              </Text>
              <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 2 }}>
                {notification.timeAgo} - {notification.waterLevel}cm
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <View style={{
              width: 32, height: 32, borderRadius: 16,
              backgroundColor: "#10B981",
              alignItems: "center", justifyContent: "center"
            }}>
              <Ionicons name="shield-checkmark-outline" size={18} color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}>
                Hệ thống cảnh báo
              </Text>
              <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 2 }}>
                Cấp độ {config.level}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <View style={{
              width: 32, height: 32, borderRadius: 16,
              backgroundColor: "#F59E0B",
              alignItems: "center", justifyContent: "center"
            }}>
              <Ionicons name="megaphone-outline" size={18} color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}>
                Thông báo cộng đồng
              </Text>
              <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 2 }}>
                {notification.affectedArea} cư dân
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Description */}
      <View style={{
        marginHorizontal: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
        marginBottom: 20,
      }}>
        <Text style={{ 
          fontSize: 18, fontWeight: "700", 
          color: "#111827", marginBottom: 12 
        }}>
          Chi tiết
        </Text>
        <Text style={{ 
          fontSize: 16, color: "#374151", 
          lineHeight: 24 
        }}>
          {notification.description}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={{ marginHorizontal: 20, gap: 12 }}>
        {notification.actions?.viewMap && (
          <Button
            onPress={() => Alert.alert("Bản đồ", "Mở Google Maps")}
            style={{ paddingVertical: 16, borderRadius: 12 }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600" }}>Xem bản đồ</Text>
          </Button>
        )}
        {notification.actions?.getDirections && (
          <Button
            variant="outline"
            onPress={() => Alert.alert("Lộ trình", "Mở Google Maps Directions")}
            style={{ paddingVertical: 16, borderRadius: 12 }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#3B82F6" }}>
              Lộ trình tránh ngập
            </Text>
          </Button>
        )}
      </View>
    </ScrollView>
  );
}
