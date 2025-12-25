
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { calculateWaterPercentage, getStatusConfig, getStatusIcon } from "../lib/areas-utils";
import { Area } from "../types/areas-types";

interface AreaCardProps {
  area: Area;
  onPress: () => void;
  onMenuPress: () => void;
  onFavoriteToggle: () => void;
}

export function AreaCard({
  area,
  onPress,
  onMenuPress,
  onFavoriteToggle,
}: AreaCardProps) {
  const colors = getStatusConfig(area.status);
  const waterPercentage = calculateWaterPercentage(area.waterLevel, area.maxLevel);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 2,
        
        borderTopColor: colors.main,
        borderColor: area.isFavorite ? colors.main : "#F3F4F6",
        shadowColor: colors.main,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: area.isFavorite ? 0.15 : 0.05,
        shadowRadius: 12,
        elevation: area.isFavorite ? 8 : 3,
      }}
    >


      {/* Header Section */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
          marginTop: 4,
        }}
      >
        <View style={{ flex: 1, marginRight: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "800",
                color: "#111827",
                letterSpacing: -0.5,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {area.name}
            </Text>
            <TouchableOpacity onPress={onFavoriteToggle} activeOpacity={0.7}>
              <Ionicons
                name={area.isFavorite ? "star" : "star-outline"}
                size={20}
                color={area.isFavorite ? "#F59E0B" : "#D1D5DB"}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Ionicons name="location" size={14} color="#9CA3AF" />
            <Text
              style={{
                fontSize: 13,
                color: "#6B7280",
                flex: 1,
                fontWeight: "500",
              }}
              numberOfLines={1}
            >
              {area.location}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              backgroundColor: colors.bg,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              borderWidth: 1,
              borderColor: `${colors.main}30`,
            }}
          >
            <Ionicons
              name={getStatusIcon(area.status)}
              size={14}
              color={colors.main}
            />
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: colors.text,
                letterSpacing: 0.3,
              }}
            >
              {area.statusText.toUpperCase()}
            </Text>
          </View>

          <TouchableOpacity
            onPress={onMenuPress}
            style={{
              width: 36,
              height: 36,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 18,
              backgroundColor: "#F9FAFB",
              borderWidth: 1,
              borderColor: "#F3F4F6",
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Water Level Display */}
      <View
        style={{
          backgroundColor: colors.bg,
          padding: 16,
          borderRadius: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: `${colors.main}20`,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              gap: 6,
            }}
          >
            <Text
              style={{
                fontSize: 36,
                fontWeight: "900",
                color: colors.main,
                letterSpacing: -1.5,
                lineHeight: 36,
              }}
            >
              {area.waterLevel}
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: colors.text,
              }}
            >
              cm
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text
              style={{
                fontSize: 11,
                color: colors.text,
                fontWeight: "600",
              }}
            >
              Giới hạn
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: colors.text,
              }}
            >
              {area.maxLevel}cm
            </Text>
          </View>
        </View>

        {/* Enhanced Progress Bar */}
        <View
          style={{
            height: 10,
            backgroundColor: "rgba(255,255,255,0.6)",
            borderRadius: 5,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "rgba(0,0,0,0.05)",
          }}
        >
          <LinearGradient
            colors={colors.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              width: `${waterPercentage}%`,
              height: "100%",
              borderRadius: 5,
            }}
          />
        </View>
      </View>

      {/* Weather Info Grid */}
      {(area.temperature || area.humidity || area.rainChance !== undefined) && (
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
          {area.temperature && (
            <View
              style={{
                flex: 1,
                backgroundColor: "#FEF3C7",
                padding: 12,
                borderRadius: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#FDE68A",
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#FEF3C7",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 6,
                  borderWidth: 2,
                  borderColor: "#FCD34D",
                }}
              >
                <Ionicons name="thermometer" size={16} color="#D97706" />
              </View>
              <Text
                style={{
                  fontSize: 10,
                  color: "#92400E",
                  marginBottom: 4,
                  fontWeight: "600",
                }}
              >
                Nhiệt độ
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: "#B45309",
                }}
              >
                {area.temperature}°
              </Text>
            </View>
          )}

          {area.humidity && (
            <View
              style={{
                flex: 1,
                backgroundColor: "#DBEAFE",
                padding: 12,
                borderRadius: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#BFDBFE",
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#DBEAFE",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 6,
                  borderWidth: 2,
                  borderColor: "#93C5FD",
                }}
              >
                <Ionicons name="water" size={16} color="#1D4ED8" />
              </View>
              <Text
                style={{
                  fontSize: 10,
                  color: "#1E40AF",
                  marginBottom: 4,
                  fontWeight: "600",
                }}
              >
                Độ ẩm
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: "#1D4ED8",
                }}
              >
                {area.humidity}%
              </Text>
            </View>
          )}

          {area.rainChance !== undefined && (
            <View
              style={{
                flex: 1,
                backgroundColor: "#E0E7FF",
                padding: 12,
                borderRadius: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#C7D2FE",
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#E0E7FF",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 6,
                  borderWidth: 2,
                  borderColor: "#A5B4FC",
                }}
              >
                <Ionicons name="rainy" size={16} color="#4338CA" />
              </View>
              <Text
                style={{
                  fontSize: 10,
                  color: "#3730A3",
                  marginBottom: 4,
                  fontWeight: "600",
                }}
              >
                Khả năng mưa
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: "#4338CA",
                }}
              >
                {area.rainChance}%
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Forecast Section */}
      <View
        style={{
          backgroundColor: "#F9FAFB",
          padding: 14,
          borderRadius: 12,
          marginBottom: 14,
          borderWidth: 1,
          borderColor: "#F3F4F6",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "white",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="partly-sunny" size={20} color="#6B7280" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 11,
                color: "#9CA3AF",
                marginBottom: 2,
                fontWeight: "600",
              }}
            >
              DỰ BÁO
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#374151",
                fontWeight: "600",
              }}
            >
              {area.forecast}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 14,
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: colors.main,
            }}
          />
          <Text
            style={{
              fontSize: 12,
              color: "#9CA3AF",
              fontWeight: "500",
            }}
          >
            Cập nhật {area.lastUpdate}
          </Text>
        </View>

        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 10,
            backgroundColor: colors.bg,
            borderWidth: 1,
            borderColor: `${colors.main}30`,
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="eye" size={16} color={colors.main} />
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: colors.text,
            }}
          >
            Chi tiết
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
