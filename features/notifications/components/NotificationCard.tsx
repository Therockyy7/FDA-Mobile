
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { getCategoryIcon, getPriorityConfig } from "../lib/notifications-utils";
import { Notification } from "../types/notifications-types";
import { NotificationMetadata } from "./NotificationMetadata";

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
  const config = getPriorityConfig(notification.priority);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: "white",
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 12,
      }}
    >
      {/* Priority Bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "stretch",
        }}
      >
        <View
          style={{
            width: 5,
            backgroundColor: config.color,
          }}
        />

        <View style={{ flex: 1, padding: 16 }}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 12,
              marginBottom: 12,
            }}
          >
            {/* Icon */}
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: config.bgColor,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name={getCategoryIcon(notification.category)}
                size={24}
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
                  marginBottom: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "800",
                    color: "#1F2937",
                    flex: 1,
                  }}
                >
                  {notification.title}
                </Text>
                {!notification.isRead && (
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "#3B82F6",
                      marginLeft: 8,
                    }}
                  />
                )}
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <Ionicons name="location" size={14} color="#6B7280" />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: "#6B7280",
                    marginLeft: 4,
                  }}
                >
                  {notification.location}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: "#9CA3AF",
                }}
              >
                {notification.timeAgo}
              </Text>
            </View>

            {/* Chevron */}
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>

          {/* Description */}
          {notification.description && (
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: "#6B7280",
                lineHeight: 20,
                marginBottom: 12,
              }}
            >
              {notification.description}
            </Text>
          )}

          {/* Metadata */}
          <NotificationMetadata
            waterLevel={notification.waterLevel}
            affectedArea={notification.affectedArea}
          />

          {/* Actions */}
          {notification.actions && (
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: "#F3F4F6",
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
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor: "#3B82F6",
                    gap: 6,
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="map" size={16} color="white" />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: "white",
                    }}
                  >
                    Bản đồ
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
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor: "#F3F4F6",
                    gap: 6,
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="navigate" size={16} color="#1F2937" />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: "#1F2937",
                    }}
                  >
                    Lộ trình
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
