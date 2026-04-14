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
import { SHADOW, RADIUS } from "~/lib/design-tokens";

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
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        testID="areas-modal-add-overlay"
      >
        <View
          className="bg-slate-50 dark:bg-slate-900 px-5"
          style={{
            borderTopLeftRadius: RADIUS.sheet,
            borderTopRightRadius: RADIUS.sheet,
            paddingTop: 12,
            paddingBottom: Platform.OS === "ios" ? 40 : 20,
            ...SHADOW.lg,
          }}
          testID="areas-modal-add-sheet"
        >
          {/* Handle Bar */}
          <View className="w-10 h-1 bg-slate-200 dark:bg-slate-600 rounded-full self-center mb-3.5" />

          {/* Header */}
          <View className="flex-row justify-between items-center mb-4" testID="areas-modal-add-header">
            <View className="flex-1 pr-2">
              <Text className="text-xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight mb-1">
                Chọn khu vực theo dõi
              </Text>
              <Text className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Chọn từ các khu vực hệ thống hoặc chọn trực tiếp trên bản đồ.
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-9 h-9 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700"
              activeOpacity={0.7}
              testID="areas-modal-add-close-button"
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
            <View className="mb-5">
              <View className="flex-row justify-between mb-2.5 items-center">
                <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 tracking-wide">
                  KHU VỰC HỆ THỐNG
                </Text>
                <View className="flex-row items-center gap-1.5">
                  <Ionicons
                    name="information-circle-outline"
                    size={16}
                    color="#9CA3AF"
                  />
                  <Text className="text-xs text-slate-400 font-medium">
                    Dữ liệu theo cảm biến &amp; khu vực
                  </Text>
                </View>
              </View>

              <View className="flex-row flex-wrap -mx-1.5">
                {systemAreas.map((area) => {
                  const isDanger = area.status === "danger";
                  const isWarning = area.status === "warning";

                  return (
                    <TouchableOpacity
                      key={area.id}
                      onPress={() => onSelectSystemArea?.(area.id)}
                      activeOpacity={0.85}
                      className="w-1/2 px-1.5 mb-3"
                      testID={`areas-modal-add-area-${area.id}`}
                    >
                      <View
                        className={[
                          "rounded-2xl p-3 border border-black/5",
                          isDanger
                            ? "bg-red-50 dark:bg-red-950/30"
                            : isWarning
                              ? "bg-amber-50 dark:bg-amber-950/30"
                              : "bg-emerald-50 dark:bg-emerald-950/30",
                        ].join(" ")}
                      >
                        <View className="flex-row items-center mb-1.5 gap-1.5">
                          <View className="w-6 h-6 rounded-full bg-black/5 items-center justify-center">
                            <Ionicons
                              name="location-sharp"
                              size={15}
                              color="#111827"
                            />
                          </View>
                          <Text
                            numberOfLines={2}
                            className="flex-1 text-sm font-bold text-slate-900 dark:text-slate-50"
                          >
                            {area.name}
                          </Text>
                        </View>

                        <Text
                          numberOfLines={2}
                          className="text-xs text-slate-500 dark:text-slate-400 mb-2"
                        >
                          {area.location}
                        </Text>

                        <View className="flex-row justify-between items-center">
                          <View
                            className={[
                              "px-2 py-0.5 rounded-full",
                              isDanger
                                ? "bg-red-500/20"
                                : isWarning
                                  ? "bg-amber-500/20"
                                  : "bg-emerald-500/20",
                            ].join(" ")}
                          >
                            <Text
                              className={[
                                "text-xs font-bold",
                                isDanger
                                  ? "text-red-500"
                                  : isWarning
                                    ? "text-amber-500"
                                    : "text-emerald-600",
                              ].join(" ")}
                            >
                              {area.statusText}
                            </Text>
                          </View>
                          <Text className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
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
                className="mt-2 flex-row items-center justify-center py-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 gap-2"
                testID="areas-modal-add-pick-on-map"
              >
                <View className="w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-800 items-center justify-center">
                  <Ionicons name="map-outline" size={16} color="#1D4ED8" />
                </View>
                <Text className="text-sm font-bold text-blue-700 dark:text-blue-400">
                  Chọn khu vực bằng bản đồ
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Button đóng */}
          <View className="mt-1">
            <TouchableOpacity
              onPress={onClose}
              className="h-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              activeOpacity={0.7}
              testID="areas-modal-add-close-footer"
            >
              <Text className="text-base font-bold text-slate-500 dark:text-slate-400">
                Đóng
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
