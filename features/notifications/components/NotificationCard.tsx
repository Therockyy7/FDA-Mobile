
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { getCategoryIcon, getPriorityConfig } from "../lib/notifications-utils";
import { Notification } from "../types/notifications-types";

interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
  onMapPress?: () => void;
  onDirectionsPress?: () => void;
}

export function NotificationCard({
  notification,
  onPress,
  onMapPress,
  onDirectionsPress,
}: NotificationCardProps) {
  const { isDarkColorScheme } = useColorScheme();
  const config = getPriorityConfig(notification.priority);

  // Theme colors
  const colors = {
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#6B7280",
    muted: isDarkColorScheme ? "#64748B" : "#9CA3AF",
    border: isDarkColorScheme ? "#334155" : "#F3F4F6",
    buttonSecondary: isDarkColorScheme ? "#334155" : "#F3F4F6",
    buttonSecondaryText: isDarkColorScheme ? "#E2E8F0" : "#1F2937",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: colors.cardBg,
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: isDarkColorScheme ? config.color : "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkColorScheme ? 0.2 : 0.08,
        shadowRadius: 12,
        elevation: 6,
        marginBottom: 16,
        borderWidth: isDarkColorScheme ? 1 : 0,
        borderColor: colors.border,
      }}
    >
      {/* Priority Gradient Bar */}
      <View
        style={{
          height: 4,
          backgroundColor: config.color,
        }}
      />

      <View style={{ padding: 16 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 12,
          }}
        >
          {/* Icon Badge */}
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              backgroundColor: config.bgColor,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: config.color + "40",
            }}
          >
            <Ionicons
              name={getCategoryIcon(notification.category)}
              size={26}
              color={config.color}
            />
          </View>

          {/* Content */}
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "800",
                    color: colors.text,
                    flex: 1,
                  }}
                  numberOfLines={2}
                >
                  {notification.title}
                </Text>
                {!notification.isRead && (
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: "#3B82F6",
                      marginLeft: 8,
                    }}
                  />
                )}
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginBottom: 4,
              }}
            >
              <Ionicons name="location" size={14} color={colors.subtext} />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: colors.subtext,
                }}
              >
                {notification.location}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Ionicons name="time-outline" size={12} color={colors.muted} />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "500",
                    color: colors.muted,
                  }}
                >
                  {notification.timeAgo}
                </Text>
              </View>
              
              {/* Priority Badge */}
              <View
                style={{
                  backgroundColor: config.color + "20",
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "700",
                    color: config.color,
                    textTransform: "uppercase",
                  }}
                >
                  {config.label}
                </Text>
              </View>
            </View>
          </View>

          {/* Chevron */}
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: colors.border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="chevron-forward" size={16} color={colors.subtext} />
          </View>
        </View>

        {/* Description */}
        {notification.description && (
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: colors.subtext,
              lineHeight: 20,
              marginBottom: 12,
            }}
            numberOfLines={2}
          >
            {notification.description}
          </Text>
        )}

        {/* Stats Row */}
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            marginBottom: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          {notification.waterLevel !== undefined && (
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                backgroundColor: isDarkColorScheme ? "#0F172A" : "#F8FAFC",
                padding: 10,
                borderRadius: 12,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: "#3B82F620",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="water" size={16} color="#3B82F6" />
              </View>
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "800",
                    color: colors.text,
                  }}
                >
                  {notification.waterLevel}cm
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: colors.muted,
                  }}
                >
                  Mực nước
                </Text>
              </View>
            </View>
          )}
          
          {notification.affectedArea && (
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                backgroundColor: isDarkColorScheme ? "#0F172A" : "#F8FAFC",
                padding: 10,
                borderRadius: 12,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: "#10B98120",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="resize-outline" size={16} color="#10B981" />
              </View>
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "800",
                    color: colors.text,
                  }}
                >
                  {notification.affectedArea}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: colors.muted,
                  }}
                >
                  Diện tích
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Actions */}
        {notification.actions && (
          <View
            style={{
              flexDirection: "row",
              gap: 10,
            }}
          >
            {notification.actions.viewMap && (
              <TouchableOpacity
                onPress={onMapPress}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: "#3B82F6",
                  gap: 6,
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="map" size={16} color="white" />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: "white",
                  }}
                >
                  Xem bản đồ
                </Text>
              </TouchableOpacity>
            )}
            {notification.actions.getDirections && (
              <TouchableOpacity
                onPress={onDirectionsPress}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: colors.buttonSecondary,
                  gap: 6,
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="navigate" size={16} color={colors.buttonSecondaryText} />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: colors.buttonSecondaryText,
                  }}
                >
                  Lộ trình
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
