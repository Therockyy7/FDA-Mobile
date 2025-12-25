// app/(tabs)/areas.tsx
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  UIManager,
  View,
} from "react-native";
import { AddAreaModal } from "~/features/areas/components/AddAreaModal";
import { AreaCard } from "~/features/areas/components/AreaCard";
import { AreaMenuModal } from "~/features/areas/components/AreaMenuModal";
import { AreasHeader } from "~/features/areas/components/AreasHeader";
import { EmptyAreasState } from "~/features/areas/components/EmptyAreasState";
import { MOCK_AREAS } from "~/features/areas/constants/areas-data";
import { Area } from "~/features/areas/types/areas-types";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AreasScreen() {
  const router = useRouter();
  const [areas, setAreas] = useState<Area[]>(MOCK_AREAS);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  const handleAddArea = useCallback((name: string, address: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newArea: Area = {
      id: `area-${Date.now()}`,
      name,
      location: address,
      waterLevel: 0,
      maxLevel: 50,
      status: "safe",
      statusText: "An toàn",
      lastUpdate: "Vừa xong",
      forecast: "Đang cập nhật...",
      isFavorite: false,
      type: "personal",
    };
    setAreas((prev) => [newArea, ...prev]);
  }, []);

  const handleDeleteArea = useCallback((areaId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAreas((prev) => prev.filter((a) => a.id !== areaId));
    setShowMenuModal(false);
    setSelectedArea(null);
  }, []);

  const handleFavoriteToggle = useCallback((areaId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAreas((prev) =>
      prev.map((a) => (a.id === areaId ? { ...a, isFavorite: !a.isFavorite } : a))
    );
  }, []);

  const handleEditArea = useCallback(() => {
    // TODO: Implement edit functionality
    console.log("Edit area:", selectedArea);
  }, [selectedArea]);

  const sortedAreas = useMemo(() => {
    return [...areas].sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return 0;
    });
  }, [areas]);

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <AreasHeader areas={areas} onAddPress={() => setShowAddModal(true)} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
          />
        }
      >
        {sortedAreas.length === 0 ? (
          <EmptyAreasState onAddPress={() => setShowAddModal(true)} />
        ) : (
          sortedAreas.map((area) => (
            <AreaCard
              key={area.id}
              area={area}
              onPress={() => {
                // TODO: Navigate to detail
                console.log("id: ", area.id);
                
                router.push(`/area-detail/${area.id}` as any)
              }}
              onMenuPress={() => {
                setSelectedArea(area);
                setShowMenuModal(true);
              }}
              onFavoriteToggle={() => handleFavoriteToggle(area.id)}
            />
          ))
        )}
      </ScrollView>

      <AddAreaModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddArea}
      />

      <AreaMenuModal
        visible={showMenuModal}
        onClose={() => setShowMenuModal(false)}
        onEdit={handleEditArea}
        onDelete={() => selectedArea && handleDeleteArea(selectedArea.id)}
      />
    </View>
  );
}
