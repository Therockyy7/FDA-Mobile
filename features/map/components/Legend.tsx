import React from "react";
import { Text, View } from "react-native";

const Legend = () => {
  return (
    <View
      style={{
        position: "absolute",
        top: 150,
        right: 16,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: 16,
        padding: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        minWidth: 120,
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontWeight: "800",
          color: "#6B7280",
          marginBottom: 8,
        }}
      >
        MỰC NƯỚC
      </Text>
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 20,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#10B981",
              marginRight: 8,
            }}
          />
          <Text
            style={{
              fontSize: 11,
              color: "#374151",
              fontWeight: "600",
            }}
          >
            {"< 35cm"}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 20,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#F59E0B",
              marginRight: 8,
            }}
          />
          <Text
            style={{
              fontSize: 11,
              color: "#374151",
              fontWeight: "600",
            }}
          >
            35-50cm
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 20,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#EF4444",
              marginRight: 8,
            }}
          />
          <Text
            style={{
              fontSize: 11,
              color: "#374151",
              fontWeight: "600",
            }}
          >
            {"> 50cm"}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Legend;
