import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker"; // ✅ Thư viện ảnh
import AsyncStorage from "@react-native-async-storage/async-storage";

// Components
import ModalChangePassword from "~/features/auth/components/ModalChangePassword";
import AppSettingsSection from "~/features/profile/components/AppSettingsSection";
import NotificationSettingsSection from "~/features/profile/components/NotificationSettingsSection";
import OtherSettingsSection from "~/features/profile/components/OtherSettingsSection";
import ProfileHeader from "~/features/profile/components/ProfileHeader";
import ProfileInfoSection from "~/features/profile/components/ProfileInfoSection";
import SaveButton from "~/features/profile/components/SaveButton";

// Services & Store
import { AuthService, CheckSetPassword } from "~/features/auth/services/auth.service";
import { ProfileService } from "~/features/profile/services/profile.service";
import { useSignOut, useUser } from "~/features/auth/stores/hooks";
import { useAppDispatch } from "~/app/hooks"; // ⚠️ Đảm bảo đường dẫn này đúng trong project bạn
import { setUser } from "~/features/auth/stores/auth.slice"; 

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const signOut = useSignOut();
  const user = useUser();

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("Đang cập nhật...");
  
  // Avatar & Loading State
  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Settings State (Giữ nguyên)
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [weatherUpdates, setWeatherUpdates] = useState(true);
  const [trafficAlerts, setTrafficAlerts] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Change Password State
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePwLoading, setChangePwLoading] = useState(false);
  const [changePwError, setChangePwError] = useState<string | null>(null);

  // Extra Info State
  const [createdAt, setCreatedAt] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [roles, setRoles] = useState<string[]>([]);
  const [provider, setProvider] = useState<string>("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  // 1. Sync User Data to State
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setPhone(user.phoneNumber || "");
      
      // Cast user to any để lấy các trường mở rộng nếu TS báo lỗi
      const userAny = user as any; 
      setCreatedAt(userAny.createdAt || "");
      setStatus(userAny.status || "");
      setRoles(user.roles || []);
      setProvider(userAny.provider || "");
      setIsEmailVerified(!!userAny.emailVerifiedAt);
      setIsPhoneVerified(!!userAny.phoneVerifiedAt);
    }
  }, [user]);

  // 2. Handle Pick Avatar
  const handlePickAvatar = async () => {
    // Xin quyền
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Quyền truy cập", "Cần cấp quyền thư viện ảnh để thay đổi avatar.");
      return;
    }

    // Mở thư viện
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setNewAvatarUri(result.assets[0].uri);
    }
  };

  // 3. Handle Save Changes (API Update)
  const handleSaveChanges = async () => {
    try {
      setIsUpdating(true);
      
      const formData = new FormData();
      formData.append("fullName", fullName);

      // Nếu có chọn ảnh mới thì append vào
      if (newAvatarUri) {
        const filename = newAvatarUri.split('/').pop() || "avatar.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        // ⚠️ Quan trọng: Ép kiểu any cho React Native FormData
        formData.append("avatarFile", {
          uri: newAvatarUri,
          name: filename,
          type: type,
        } as any);
      }

      // Gọi Service
      const res = await ProfileService.updateProfile(formData);

      if (res.data.success) {
        const updatedProfile = res.data.profile;

        // Cập nhật Redux
        dispatch(setUser(updatedProfile));

        // Cập nhật Storage (để lần sau mở app vẫn đúng)
        await AsyncStorage.setItem("user_data", JSON.stringify(updatedProfile));

        setNewAvatarUri(null); // Reset ảnh tạm
        Alert.alert("Thành công", "Cập nhật hồ sơ thành công!");
      }
    } catch (err: any) {
      console.error("Update Profile Error:", err);
      const message = err?.response?.data?.message || "Không thể cập nhật hồ sơ.";
      Alert.alert("Lỗi", message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      Alert.alert("Lỗi", "Không thể đăng xuất. Vui lòng thử lại.");
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

  // Ưu tiên hiển thị ảnh vừa chọn để Preview
  const displayAvatar = newAvatarUri || user?.avatarUrl;
  const displayName = fullName || user?.email || "Người dùng";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" translucent />
      
      <ProfileHeader
        displayName={displayName}
        email={email}
        avatarUrl={displayAvatar} // ✅ Hiển thị ảnh mới ngay lập tức
        onLogout={handleLogout}
        createdAt={createdAt}
        role={roles}
        status={status}
        onPickAvatar={handlePickAvatar} // ✅ Truyền hàm
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
        
        {/* Save Button có Loading */}
        <SaveButton onPress={handleSaveChanges} loading={isUpdating} />
        
        <ModalChangePassword
          visible={showChangePassword}
          loading={changePwLoading}
          error={changePwError}
          requireCurrentPassword={true}
          onSubmit={handleSubmitChangePassword}
          onClose={() => setShowChangePassword(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}