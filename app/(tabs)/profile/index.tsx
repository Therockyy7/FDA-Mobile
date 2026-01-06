import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { Alert, Platform, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ModalChangePassword from "~/features/auth/components/ModalChangePassword";

import ModalConfirmLogout from "~/features/auth/components/ModalConfirmLogout";

import { AuthService } from "~/features/auth/services/auth.service";
import { setUser } from "~/features/auth/stores/auth.slice";

import { ProfileService } from "~/features/profile/services/profile.service";

import { useRouter } from "expo-router";
import { useAppDispatch } from "~/app/hooks";
import { useSignOut, useUser } from "~/features/auth/stores/hooks";
import AppSettingsSection from "~/features/profile/components/AppSettingsSection";
import NotificationSettingsSection from "~/features/profile/components/NotificationSettingsSection";
import OtherSettingsSection from "~/features/profile/components/OtherSettingsSection";
import ProfileHeader from "~/features/profile/components/ProfileHeader";
import ProfileInfoSection from "~/features/profile/components/ProfileInfoSection";
import SaveButton from "~/features/profile/components/SaveButton";

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const signOut = useSignOut();
  const user = useUser();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("Đang cập nhật...");

  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Settings states
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [weatherUpdates, setWeatherUpdates] = useState(true);
  const [trafficAlerts, setTrafficAlerts] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Password Modal State
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePwLoading, setChangePwLoading] = useState(false);
  const [changePwError, setChangePwError] = useState<string | null>(null);

 
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // User info extended
  const [createdAt, setCreatedAt] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [roles, setRoles] = useState<string[]>([]);
  const [provider, setProvider] = useState<string>("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
const router = useRouter();
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setPhone(user.phoneNumber || "");
      
      const userAny = user as any; 
      setCreatedAt(userAny.createdAt || "");
      setStatus(userAny.status || "");
      setRoles(user.roles || []);
      setProvider(userAny.provider || "");
      setIsEmailVerified(!!userAny.emailVerifiedAt);
      setIsPhoneVerified(!!userAny.phoneVerifiedAt);
    }
  }, [user]);

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Quyền truy cập", "Cần cấp quyền truy cập thư viện ảnh để thay đổi avatar.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
    });

    if (!result.canceled) {
      setNewAvatarUri(result.assets[0].uri);
    }
  };


// Trong ProfileScreen.tsx

const handleSaveChanges = async () => {
    try {
      setIsUpdating(true);
      const formData = new FormData();

      // 1. FullName
      formData.append("fullName", fullName.trim());

      // 2. AvatarUrl (✅ BỔ SUNG: Gửi lại URL cũ nếu có)
      // Nếu user không chọn ảnh mới (newAvatarUri là null), ta cần gửi lại avatarUrl cũ 
      // để Backend biết là "tôi muốn giữ nguyên ảnh cũ".
      formData.append("avatarUrl", user?.avatarUrl || "");

      // 3. AvatarFile (Chỉ gửi khi có ảnh mới)
      if (newAvatarUri) {
        // Xử lý path cho Android
        const uri = Platform.OS === "android" && !newAvatarUri.startsWith("file://")
            ? `file://${newAvatarUri}`
            : newAvatarUri;

        const filename = uri.split('/').pop() || "avatar.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append("avatarFile", {
          uri: uri,
          name: filename,
          type: type,
        } as any);
      }

      // 4. Gọi API
      const res = await ProfileService.updateProfile(formData);

      if (res.data.success) {
        const updatedProfile = res.data.profile;
        
        dispatch(setUser(updatedProfile));
        await AsyncStorage.setItem("user_data", JSON.stringify(updatedProfile));
        
        setNewAvatarUri(null);
        Alert.alert("Thành công", "Cập nhật hồ sơ thành công!");
      }
    } catch (err: any) {
      console.error("API Error:", err);
      // Log response data để debug lỗi server trả về
      if (err.response) {
          console.log("Server data:", err.response.data);
          console.log("Server status:", err.response.status);
      }
      
      const message = err?.response?.data?.message || "Lỗi cập nhật. Vui lòng thử lại.";
      Alert.alert("Lỗi", message);
    } finally {
      setIsUpdating(false);
    }
};


  const handleConfirmLogout = async () => {
  try {
    setIsLoggingOut(true); 

    await signOut();
    setIsLoggingOut(false);
    setShowLogoutModal(false);
    router.replace("/(tabs)");

  } catch (err) {
    console.error("Logout error:", err);
    Alert.alert("Lỗi", "Có lỗi xảy ra khi đăng xuất.");
    
    setIsLoggingOut(false);
    setShowLogoutModal(false); 
  }
};

  const handleSubmitChangePassword = async ({ currentPassword, newPassword }: any) => {
    try {
      setChangePwLoading(true);
      setChangePwError(null);
      if (!user?.email) {
        setChangePwError("Không tìm thấy email tài khoản.");
        return;
      }
      await AuthService.setPassWord({
        email: user.email,
        newPassword,
        confirmPassword: newPassword,
      });
      Alert.alert("Thành công", "Mật khẩu đã được cập nhật!");
      setShowChangePassword(false);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Không thể đổi mật khẩu.";
      setChangePwError(message);
    } finally {
      setChangePwLoading(false);
    }
  };

  const displayAvatar = newAvatarUri || user?.avatarUrl;
  const displayName = fullName || user?.email || "Người dùng";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" translucent />
      
      <ProfileHeader
        displayName={displayName}
        email={email}
        avatarUrl={displayAvatar}
        // ✅ Thay đổi: Mở modal thay vì gọi API ngay
        onLogout={() => setShowLogoutModal(true)} 
        createdAt={createdAt}
        role={roles}
        status={status}
        onPickAvatar={handlePickAvatar}
      />
      
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
        <ProfileInfoSection
          fullName={fullName}
          setFullName={setFullName}
          email={email}
          phone={phone}
          setPhone={setPhone}
          address={address}
          setAddress={setAddress}
          onChangePassword={() => setShowChangePassword(true)}
          isEmailVerified={isEmailVerified}
          isPhoneVerified={isPhoneVerified}
          provider={provider}
        />
        
        <NotificationSettingsSection
          emergencyAlerts={emergencyAlerts} setEmergencyAlerts={setEmergencyAlerts}
          weatherUpdates={weatherUpdates} setWeatherUpdates={setWeatherUpdates}
          trafficAlerts={trafficAlerts} setTrafficAlerts={setTrafficAlerts}
          weeklyReport={weeklyReport} setWeeklyReport={setWeeklyReport}
        />
        
        <AppSettingsSection
          darkMode={darkMode} setDarkMode={setDarkMode}
          autoRefresh={autoRefresh} setAutoRefresh={setAutoRefresh}
          soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled}
        />
        
        <OtherSettingsSection />
        
        <SaveButton onPress={handleSaveChanges} loading={isUpdating} />
        
        {/* Change Password Modal */}
        <ModalChangePassword
          visible={showChangePassword}
          loading={changePwLoading}
          error={changePwError}
          requireCurrentPassword={true}
          onSubmit={handleSubmitChangePassword}
          onClose={() => setShowChangePassword(false)}
        />

        {/* ✅ Confirm Logout Modal */}
        <ModalConfirmLogout 
          visible={showLogoutModal}
          loading={isLoggingOut}
          onConfirm={handleConfirmLogout}
          onClose={() => setShowLogoutModal(false)}
        />

      </ScrollView>
    </SafeAreaView>
  );
}