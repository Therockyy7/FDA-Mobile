// app/(tabs)/profile.tsx
import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
  Switch,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Text } from "~/components/ui/text";

export default function ProfileScreen() {
  const router = useRouter();

  // User Info State
  const [fullName, setFullName] = useState("Nguyễn Văn A");
  const [email, setEmail] = useState("nguyenvana@email.com");
  const [phone, setPhone] = useState("0901234567");
  const [address, setAddress] = useState("123 Đường Lê Duẩn, Quận Hải Châu");

  // Notification Settings
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [weatherUpdates, setWeatherUpdates] = useState(true);
  const [trafficAlerts, setTrafficAlerts] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(false);

  // App Settings
  const [darkMode, setDarkMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleSaveChanges = () => {
    Alert.alert(
      "Lưu thành công",
      "Thông tin của bạn đã được cập nhật!",
      [{ text: "OK" }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng xuất", style: "destructive", onPress: () => {} },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" translucent />

      {/* Header with Gradient */}
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: "white",
              flex: 1,
              textAlign: "center",
            }}
          >
            Hồ sơ cá nhân
          </Text>

          <TouchableOpacity
            onPress={handleLogout}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Profile Avatar */}
        <View style={{ alignItems: "center" }}>
          <View style={{ position: "relative" }}>
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: "white",
                padding: 4,
              }}
            >
              <Image
                source={{ uri: "https://i.pravatar.cc/300?img=12" }}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 56,
                }}
              />
            </View>

            {/* Edit Button */}
            <TouchableOpacity
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#10B981",
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
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={18} color="white" />
            </TouchableOpacity>
          </View>

          <Text
            style={{
              fontSize: 24,
              fontWeight: "900",
              color: "white",
              marginTop: 16,
              textAlign: "center",
            }}
          >
            {fullName}
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "rgba(255,255,255,0.9)",
              marginTop: 4,
            }}
          >
            {email}
          </Text>

          {/* Stats */}
          <View
            style={{
              flexDirection: "row",
              gap: 20,
              marginTop: 20,
            }}
          >
            <View
              style={{
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.2)",
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "900",
                  color: "white",
                }}
              >
                12
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: "rgba(255,255,255,0.9)",
                  marginTop: 2,
                }}
              >
                Cảnh báo
              </Text>
            </View>

            <View
              style={{
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.2)",
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "900",
                  color: "white",
                }}
              >
                3
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: "rgba(255,255,255,0.9)",
                  marginTop: 2,
                }}
              >
                Khu vực
              </Text>
            </View>

            <View
              style={{
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.2)",
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "900",
                  color: "white",
                }}
              >
                45
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: "rgba(255,255,255,0.9)",
                  marginTop: 2,
                }}
              >
                Ngày dùng
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Personal Information */}
        <View style={{ padding: 16 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "800",
              color: "#1F2937",
              marginBottom: 16,
            }}
          >
            Thông tin cá nhân
          </Text>

          <View style={{ gap: 16 }}>
            {/* Full Name */}
            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#6B7280",
                  marginBottom: 8,
                }}
              >
                Họ và tên
              </Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                style={{
                  backgroundColor: "white",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 15,
                  fontWeight: "600",
                  color: "#1F2937",
                }}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Email (Read-only) */}
            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#6B7280",
                  marginBottom: 8,
                }}
              >
                Email
              </Text>
              <TextInput
                value={email}
                editable={false}
                style={{
                  backgroundColor: "#F3F4F6",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 15,
                  fontWeight: "600",
                  color: "#9CA3AF",
                }}
              />
            </View>

            {/* Phone */}
            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#6B7280",
                  marginBottom: 8,
                }}
              >
                Số điện thoại
              </Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                style={{
                  backgroundColor: "white",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 15,
                  fontWeight: "600",
                  color: "#1F2937",
                }}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Address */}
            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#6B7280",
                  marginBottom: 8,
                }}
              >
                Địa chỉ
              </Text>
              <TextInput
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={2}
                style={{
                  backgroundColor: "white",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 15,
                  fontWeight: "600",
                  color: "#1F2937",
                  minHeight: 80,
                  textAlignVertical: "top",
                }}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        </View>

        {/* Notification Settings */}
        <View style={{ padding: 16 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "800",
              color: "#1F2937",
              marginBottom: 16,
            }}
          >
            Tùy chọn thông báo
          </Text>

          <View
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              overflow: "hidden",
            }}
          >
            {/* Emergency Alerts */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
              }}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                  <Ionicons name="alert-circle" size={20} color="#DC2626" />
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: "#1F2937",
                      marginLeft: 8,
                    }}
                  >
                    Cảnh báo khẩn cấp
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: "#6B7280",
                  }}
                >
                  Nhận thông báo nguy hiểm ngay lập tức
                </Text>
              </View>
              <Switch
                value={emergencyAlerts}
                onValueChange={setEmergencyAlerts}
                trackColor={{ false: "#D1D5DB", true: "#86EFAC" }}
                thumbColor={emergencyAlerts ? "#10B981" : "#F3F4F6"}
              />
            </View>

            <View style={{ height: 1, backgroundColor: "#F3F4F6" }} />

            {/* Weather Updates */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
              }}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                  <Ionicons name="rainy" size={20} color="#3B82F6" />
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: "#1F2937",
                      marginLeft: 8,
                    }}
                  >
                    Cập nhật thời tiết
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: "#6B7280",
                  }}
                >
                  Dự báo mưa và thời tiết hàng ngày
                </Text>
              </View>
              <Switch
                value={weatherUpdates}
                onValueChange={setWeatherUpdates}
                trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                thumbColor={weatherUpdates ? "#3B82F6" : "#F3F4F6"}
              />
            </View>

            <View style={{ height: 1, backgroundColor: "#F3F4F6" }} />

            {/* Traffic Alerts */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
              }}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                  <Ionicons name="car" size={20} color="#F59E0B" />
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: "#1F2937",
                      marginLeft: 8,
                    }}
                  >
                    Cảnh báo giao thông
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: "#6B7280",
                  }}
                >
                  Tình trạng ngập đường và tắc đường
                </Text>
              </View>
              <Switch
                value={trafficAlerts}
                onValueChange={setTrafficAlerts}
                trackColor={{ false: "#D1D5DB", true: "#FDE68A" }}
                thumbColor={trafficAlerts ? "#F59E0B" : "#F3F4F6"}
              />
            </View>

            <View style={{ height: 1, backgroundColor: "#F3F4F6" }} />

            {/* Weekly Report */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
              }}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                  <Ionicons name="mail" size={20} color="#8B5CF6" />
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: "#1F2937",
                      marginLeft: 8,
                    }}
                  >
                    Báo cáo tuần
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: "#6B7280",
                  }}
                >
                  Tổng kết tình hình hàng tuần qua email
                </Text>
              </View>
              <Switch
                value={weeklyReport}
                onValueChange={setWeeklyReport}
                trackColor={{ false: "#D1D5DB", true: "#C4B5FD" }}
                thumbColor={weeklyReport ? "#8B5CF6" : "#F3F4F6"}
              />
            </View>
          </View>
        </View>

        {/* App Settings */}
        <View style={{ padding: 16 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "800",
              color: "#1F2937",
              marginBottom: 16,
            }}
          >
            Cài đặt ứng dụng
          </Text>

          <View
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              overflow: "hidden",
            }}
          >
            {/* Dark Mode */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
              }}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                  <Ionicons name="moon" size={20} color="#6366F1" />
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: "#1F2937",
                      marginLeft: 8,
                    }}
                  >
                    Chế độ tối
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: "#6B7280",
                  }}
                >
                  Giao diện tối bảo vệ mắt
                </Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: "#D1D5DB", true: "#A5B4FC" }}
                thumbColor={darkMode ? "#6366F1" : "#F3F4F6"}
              />
            </View>

            <View style={{ height: 1, backgroundColor: "#F3F4F6" }} />

            {/* Auto Refresh */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
              }}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                  <Ionicons name="refresh" size={20} color="#10B981" />
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: "#1F2937",
                      marginLeft: 8,
                    }}
                  >
                    Tự động cập nhật
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: "#6B7280",
                  }}
                >
                  Làm mới dữ liệu mỗi 5 phút
                </Text>
              </View>
              <Switch
                value={autoRefresh}
                onValueChange={setAutoRefresh}
                trackColor={{ false: "#D1D5DB", true: "#86EFAC" }}
                thumbColor={autoRefresh ? "#10B981" : "#F3F4F6"}
              />
            </View>

            <View style={{ height: 1, backgroundColor: "#F3F4F6" }} />

            {/* Sound */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
              }}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                  <Ionicons name="volume-high" size={20} color="#EC4899" />
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: "#1F2937",
                      marginLeft: 8,
                    }}
                  >
                    Âm thanh
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: "#6B7280",
                  }}
                >
                  Phát âm báo khi có cảnh báo
                </Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: "#D1D5DB", true: "#F9A8D4" }}
                thumbColor={soundEnabled ? "#EC4899" : "#F3F4F6"}
              />
            </View>
          </View>
        </View>

        {/* Other Options */}
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
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
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
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
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
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
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
                  <Ionicons name="information-circle" size={22} color="#F59E0B" />
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

        {/* Save Button */}
        <View style={{ padding: 16 }}>
          <TouchableOpacity
            onPress={handleSaveChanges}
            style={{
              backgroundColor: "#3B82F6",
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              shadowColor: "#3B82F6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
            activeOpacity={0.8}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "800",
                color: "white",
              }}
            >
              Lưu thay đổi
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
