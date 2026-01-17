// features/profile/components/ProfileInfoSection.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";

type Props = {
  fullName: string;
  setFullName: (v: string) => void;
  email: string;
  phone: string;
  setPhone: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  onChangePassword: () => void;
  // New props
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  provider?: string;
  originalPhone?: string;
  onVerifyPhone?: () => void;
};

const ProfileInfoSection: React.FC<Props> = ({
  fullName,
  setFullName,
  email,
  phone,
  setPhone,
  address,
  setAddress,
  onChangePassword,
  isEmailVerified,
  isPhoneVerified,
  provider,
  originalPhone,
  onVerifyPhone,
}) => {
  
  const getProviderName = (p?: string) => {
    switch(p) {
        case 'google': return 'Google Account';
        case 'facebook': return 'Facebook';
        case 'apple': return 'Apple ID';
        default: return 'Tài khoản thường';
    }
  };

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
        Thông tin cá nhân
      </Text>

      <View style={{ gap: 16 }}>
        {/* Provider Info (Read only) */}
        {provider && provider !== 'local' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', padding: 12, borderRadius: 12 }}>
                <Ionicons name="logo-google" size={20} color="#3B82F6" />
                <Text style={{ marginLeft: 10, color: '#1E40AF', fontWeight: '600', fontSize: 14 }}>
                    Đăng nhập qua {getProviderName(provider)}
                </Text>
            </View>
        )}

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
            placeholder="Nhập họ tên"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#6B7280", marginBottom: 8 }}>
                    Email
                </Text>
                {isEmailVerified && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                         <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                         <Text style={{ fontSize: 12, color: '#10B981', marginLeft: 4, fontWeight: '600' }}>Đã xác thực</Text>
                    </View>
                )}
            </View>
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

        <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#6B7280", marginBottom: 8 }}>
                    Số điện thoại
                </Text>
                {isPhoneVerified ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                         <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                         <Text style={{ fontSize: 12, color: '#10B981', marginLeft: 4, fontWeight: '600' }}>Đã xác thực</Text>
                    </View>
                ) : phone ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                         <Ionicons name="alert-circle" size={14} color="#F59E0B" />
                         <Text style={{ fontSize: 12, color: '#F59E0B', marginLeft: 4, fontWeight: '600' }}>Chưa xác thực</Text>
                    </View>
                ) : null}
            </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={{
                flex: 1,
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
              placeholder="Nhập số điện thoại"
              placeholderTextColor="#9CA3AF"
            />
            {/* Nút Xác nhận - hiện khi phone thay đổi */}
            {phone && phone !== originalPhone && onVerifyPhone && (
              <TouchableOpacity
                onPress={onVerifyPhone}
                style={{
                  backgroundColor: '#3B82F6',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderRadius: 12,
                }}
                activeOpacity={0.8}
              >
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>Xác nhận</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

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
            placeholder="Nhập địa chỉ"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <TouchableOpacity
          onPress={onChangePassword}
          style={{
            marginTop: 8,
            flexDirection: "row",
            alignItems: "center",
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="key-outline" size={18} color="#3B82F6" />
          <Text
            style={{
              marginLeft: 8,
              fontSize: 14,
              fontWeight: "600",
              color: "#3B82F6",
            }}
          >
            Đổi mật khẩu
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileInfoSection;