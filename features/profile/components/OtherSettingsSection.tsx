// features/profile/components/OtherSettingsSection.tsx
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "~/components/ui/text";

const OtherSettingsSection: React.FC = () => {
  return (
    <View style={{ padding: 16 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "800",
          color: "#1F2937",
          marginBottom: 16,
        }}
      >
        Khác
      </Text>

      <View style={{ gap: 12 }}>
        {/* Help Center */}
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "white",
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#E5E7EB",
          }}
          activeOpacity={0.7}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flex: 1,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#EFF6FF",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="help-circle" size={22} color="#3B82F6" />
            </View>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: "#1F2937",
                marginLeft: 12,
              }}
            >
              Trung tâm trợ giúp
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Privacy Policy */}
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "white",
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#E5E7EB",
          }}
          activeOpacity={0.7}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flex: 1,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#F0FDF4",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="shield-checkmark" size={22} color="#10B981" />
            </View>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: "#1F2937",
                marginLeft: 12,
              }}
            >
              Chính sách bảo mật
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* About */}
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "white",
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#E5E7EB",
          }}
          activeOpacity={0.7}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flex: 1,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#FEF3C7",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="information-circle"
                size={22}
                color="#F59E0B"
              />
            </View>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: "#1F2937",
                marginLeft: 12,
              }}
            >
              Về ứng dụng
            </Text>
          </View>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#9CA3AF",
              marginRight: 8,
            }}
          >
            v2.5.0
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OtherSettingsSection;
