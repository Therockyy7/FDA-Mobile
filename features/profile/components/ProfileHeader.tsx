import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Platform, StatusBar, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";

type Props = {
  displayName: string;
  email: string;
  avatarUrl?: string | null; // Cho phép null
  onLogout: () => void;
  createdAt?: string;
  role?: string[];
  status?: string;
  onPickAvatar: () => void; // ✅ Prop mới để chọn ảnh
};

const ProfileHeader: React.FC<Props> = ({ 
  displayName, 
  email, 
  avatarUrl, 
  onLogout,
  createdAt,
  role,
  status,
  onPickAvatar 
}) => {
  const router = useRouter();

  const formattedDate = createdAt 
    ? new Date(createdAt).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' })
    : "";

  return (
    <LinearGradient
      colors={["#3B82F6", "#2563EB"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 50,
        paddingBottom: 24,
        paddingHorizontal: 16,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>

        <Text style={{ fontSize: 20, fontWeight: "800", color: "white", flex: 1, textAlign: "center" }}>
          Hồ sơ cá nhân
        </Text>

        <TouchableOpacity 
          onPress={onLogout} 
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="log-out-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={{ alignItems: "center" }}>
        {/* Avatar Area */}
        <View style={{ position: "relative" }}>
          <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: "white", padding: 4 }}>
            <Image
              source={{ uri: avatarUrl || "https://i.pravatar.cc/300?img=12" }}
              style={{ width: "100%", height: "100%", borderRadius: 56 }}
            />
          </View>
          
          {/* ✅ Nút Camera Update Avatar */}
          <TouchableOpacity
            onPress={onPickAvatar}
            activeOpacity={0.8}
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: status === "ACTIVE" ? "#10B981" : "#9CA3AF",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 3,
              borderColor: "#3B82F6",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Ionicons name="camera" size={18} color="white" />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 8 }}>
          <Text style={{ fontSize: 24, fontWeight: "900", color: "white", textAlign: "center" }}>
            {displayName}
          </Text>
          {role?.includes("ADMIN") && (
             <View style={{ backgroundColor: '#F59E0B', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: 'white' }}>ADMIN</Text>
             </View>
          )}
        </View>
        
        <Text style={{ fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.9)", marginTop: 4 }}>
          {email || "Chưa cập nhật email"}
        </Text>

        {formattedDate ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
            <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.8)" />
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", marginLeft: 6 }}>
              Tham gia: {formattedDate}
            </Text>
          </View>
        ) : null}
      </View>
    </LinearGradient>
  );
};

export default ProfileHeader;