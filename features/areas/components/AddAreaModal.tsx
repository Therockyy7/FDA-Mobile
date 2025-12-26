import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Modal,
  Platform,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { Text } from "~/components/ui/text";

import type { Area } from "~/features/areas/types/areas-types";
import { ALL_AREAS } from "../constants/all-areas-data";

interface AddAreaModalProps {
  visible: boolean;
  onClose: () => void;

  onSelectSystemArea?: (areaId: Area["id"]) => void;

  onPickOnMap?: () => void;
  onAdd: (name: string, address: string) => void;
}

export function AddAreaModal({
  visible,
  onClose,
  onSelectSystemArea,
  onPickOnMap,
  onAdd,
}: AddAreaModalProps) {
  const systemAreas = useMemo(
    () =>
      ALL_AREAS.filter((a) => !["area-1", "area-2", "area-4"].includes(a.id)),
    []
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.55)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: "#F9FAFB",
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingTop: 12,
            paddingHorizontal: 20,
            paddingBottom: Platform.OS === "ios" ? 40 : 20,
          }}
        >
          {/* Handle Bar */}
          <View
            style={{
              width: 42,
              height: 5,
              backgroundColor: "#E5E7EB",
              borderRadius: 999,
              alignSelf: "center",
              marginBottom: 14,
            }}
          />

          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: "#111827",
                  letterSpacing: -0.3,
                  marginBottom: 4,
                }}
              >
                Chọn khu vực theo dõi
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "#6B7280",
                  fontWeight: "500",
                }}
              >
                Chọn từ các khu vực hệ thống hoặc chọn trực tiếp trên bản đồ.
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 18,
                backgroundColor: "#E5E7EB",
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="#4B5563" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ maxHeight: 480 }}
            contentContainerStyle={{ paddingBottom: 12 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Section: Khu vực hệ thống */}
            <View style={{ marginBottom: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 10,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: "#374151",
                    letterSpacing: 0.3,
                  }}
                >
                  KHU VỰC HỆ THỐNG
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={16}
                    color="#9CA3AF"
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#9CA3AF",
                      fontWeight: "500",
                    }}
                  >
                    Dữ liệu theo cảm biến & khu vực
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginHorizontal: -6,
                }}
              >
                {systemAreas.map((area) => {
                  const isDanger = area.status === "danger";
                  const isWarning = area.status === "warning";
                  const badgeColor = isDanger
                    ? "#F97316"
                    : isWarning
                      ? "#F59E0B"
                      : "#10B981";
                  const bg = isDanger
                    ? "#FEF2F2"
                    : isWarning
                      ? "#FFFBEB"
                      : "#ECFDF5";

                  return (
                    <TouchableOpacity
                      key={area.id}
                      onPress={() => onSelectSystemArea?.(area.id)}
                      activeOpacity={0.85}
                      style={{
                        width: "50%",
                        paddingHorizontal: 6,
                        marginBottom: 12,
                      }}
                    >
                      <View
                        style={{
                          borderRadius: 18,
                          padding: 12,
                          backgroundColor: bg,
                          borderWidth: 1,
                          borderColor: "rgba(0,0,0,0.03)",
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 6,
                            gap: 6,
                          }}
                        >
                          <View
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 12,
                              backgroundColor: "rgba(15,23,42,0.06)",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Ionicons
                              name="location-sharp"
                              size={15}
                              color="#111827"
                            />
                          </View>
                          <Text
                            numberOfLines={2}
                            style={{
                              flex: 1,
                              fontSize: 13,
                              fontWeight: "700",
                              color: "#111827",
                            }}
                          >
                            {area.name}
                          </Text>
                        </View>

                        <Text
                          numberOfLines={2}
                          style={{
                            fontSize: 11,
                            color: "#6B7280",
                            marginBottom: 8,
                          }}
                        >
                          {area.location}
                        </Text>

                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <View
                            style={{
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                              borderRadius: 999,
                              backgroundColor: badgeColor + "20",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 11,
                                fontWeight: "700",
                                color: badgeColor,
                              }}
                            >
                              {area.statusText}
                            </Text>
                          </View>
                          <Text
                            style={{
                              fontSize: 11,
                              color: "#4B5563",
                              fontWeight: "600",
                            }}
                          >
                            {area.sensorCount} sensor
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Nút chọn trên bản đồ */}
              <TouchableOpacity
                onPress={onPickOnMap}
                activeOpacity={0.85}
                style={{
                  marginTop: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 12,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "#DBEAFE",
                  backgroundColor: "#EFF6FF",
                  gap: 8,
                }}
              >
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: "#DBEAFE",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="map-outline" size={16} color="#1D4ED8" />
                </View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: "#1D4ED8",
                  }}
                >
                  Chọn khu vực bằng bản đồ
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Button đóng */}
          <View style={{ marginTop: 4 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                height: 50,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 14,
                backgroundColor: "#F3F4F6",
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: "#6B7280",
                }}
              >
                Đóng
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
