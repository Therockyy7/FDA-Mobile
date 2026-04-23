// features/profile/components/ProfileInfoSection.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useTranslation } from "~/features/i18n";
import { useColorScheme } from "~/lib/useColorScheme";

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
  isCheckingPassword?: boolean;
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
  isCheckingPassword,
}) => {
  const { isDarkColorScheme } = useColorScheme();
  const { t } = useTranslation();

  const colors = {
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    textMain: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    textSub: isDarkColorScheme ? "#94A3B8" : "#6B7280",
    inputBg: "transparent",
    divider: isDarkColorScheme ? "#334155" : "#F1F5F9",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    disabledBg: isDarkColorScheme ? "transparent" : "transparent",
    disabledText: isDarkColorScheme ? "#64748B" : "#9CA3AF"
  };

  const getProviderName = (p?: string) => {
    switch(p) {
        case 'google': return 'Google Account';
        case 'facebook': return 'Facebook';
        case 'apple': return 'Apple ID';
        default: return t("profile.provider.local");
    }
  };

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "800",
          color: colors.textMain,
          marginBottom: 12,
          marginLeft: 4,
        }}
      >
        {t("profile.info.title")}
      </Text>

      {/* Provider Info (Read only) */}
      {provider && provider !== 'local' && (
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDarkColorScheme ? "rgba(59, 130, 246, 0.15)" : '#EFF6FF', padding: 14, borderRadius: 16, marginBottom: 16 }}>
            <Ionicons name="logo-google" size={20} color={isDarkColorScheme ? "#60A5FA" : "#007AFF"} />
            <Text style={{ marginLeft: 10, color: isDarkColorScheme ? '#93C5FD' : '#1E40AF', fontWeight: '600', fontSize: 14 }}>
                {t("profile.provider.signedInVia", { provider: getProviderName(provider) })}
            </Text>
        </View>
      )}

      {/* Grouped Card */}
      <View
        style={{
          backgroundColor: colors.cardBg,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
          shadowColor: isDarkColorScheme ? "#000" : "#64748B",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDarkColorScheme ? 0.3 : 0.04,
          shadowRadius: 10,
          elevation: 2,
        }}
      >
        {/* Họ tên */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="person-outline" size={16} color={colors.textSub} style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textSub }}>{t("profile.info.fullName")}</Text>
          </View>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            style={{
              backgroundColor: colors.inputBg,
              fontSize: 16,
              fontWeight: "600",
              color: colors.textMain,
              paddingVertical: 8,
              paddingHorizontal: 0,
            }}
            placeholder={t("auth.fullName.placeholder")}
            placeholderTextColor={isDarkColorScheme ? "#64748B" : "#9CA3AF"}
          />
        </View>

        <View style={{ height: 1, backgroundColor: colors.divider, marginLeft: 16 }} />

        {/* Email */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="mail-outline" size={16} color={colors.textSub} style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textSub }}>{t("profile.info.email")}</Text>
            </View>
            {isEmailVerified && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                     <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                     <Text style={{ fontSize: 11, color: '#10B981', marginLeft: 4, fontWeight: '700' }}>{t("profile.info.verified")}</Text>
                </View>
            )}
          </View>
          <TextInput
            value={email}
            editable={false}
            style={{
              backgroundColor: colors.disabledBg,
              fontSize: 16,
              fontWeight: "600",
              color: colors.disabledText,
              paddingVertical: 8,
              paddingHorizontal: 0,
            }}
          />
        </View>

        <View style={{ height: 1, backgroundColor: colors.divider, marginLeft: 16 }} />

        {/* SĐT */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="call-outline" size={16} color={colors.textSub} style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textSub }}>{t("profile.info.phone")}</Text>
            </View>
            {isPhoneVerified ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                     <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                     <Text style={{ fontSize: 11, color: '#10B981', marginLeft: 4, fontWeight: '700' }}>{t("profile.info.verified")}</Text>
                </View>
            ) : phone ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                     <Ionicons name="alert-circle" size={14} color="#F59E0B" />
                     <Text style={{ fontSize: 11, color: '#F59E0B', marginLeft: 4, fontWeight: '700' }}>{t("profile.info.notVerified")}</Text>
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
                backgroundColor: colors.inputBg,
                fontSize: 16,
                fontWeight: "600",
                color: colors.textMain,
                paddingVertical: 8,
                paddingHorizontal: 0,
              }}
              placeholder={t("auth.phone.placeholder")}
              placeholderTextColor={isDarkColorScheme ? "#64748B" : "#9CA3AF"}
            />
            {/* Nút Xác nhận */}
            {phone && phone !== originalPhone && onVerifyPhone && (
              <TouchableOpacity
                onPress={onVerifyPhone}
                style={{
                  backgroundColor: 'rgba(0, 122, 255, 0.1)',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 10,
                }}
                activeOpacity={0.8}
              >
                <Text style={{ color: '#007AFF', fontWeight: '700', fontSize: 13 }}>{t("profile.info.verifyPhone")}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: colors.divider, marginLeft: 16 }} />

        {/* Địa chỉ */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="location-outline" size={16} color={colors.textSub} style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textSub }}>{t("profile.info.address")}</Text>
          </View>
          <TextInput
            value={address}
            onChangeText={setAddress}
            multiline
            style={{
              backgroundColor: colors.inputBg,
              fontSize: 15,
              fontWeight: "500",
              color: colors.textMain,
              paddingTop: 8,
              paddingBottom: 8,
              paddingHorizontal: 0,
              minHeight: 50,
              textAlignVertical: "top",
            }}
            placeholder={t("profile.address.placeholder")}
            placeholderTextColor={isDarkColorScheme ? "#64748B" : "#9CA3AF"}
          />
        </View>

        <View style={{ height: 1, backgroundColor: colors.divider, marginLeft: 0 }} />

        {/* Đổi mật khẩu */}
        <TouchableOpacity
          onPress={onChangePassword}
          disabled={isCheckingPassword}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 16,
            opacity: isCheckingPassword ? 0.6 : 1,
          }}
          activeOpacity={0.7}
        >
          <View style={{ 
            width: 32, 
            height: 32, 
            borderRadius: 8, 
            backgroundColor: isDarkColorScheme ? "rgba(56, 189, 248, 0.1)" : "rgba(0, 122, 255, 0.1)", 
            alignItems: "center", 
            justifyContent: "center", 
            marginRight: 12 
          }}>
            {isCheckingPassword ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Ionicons name="key" size={16} color={isDarkColorScheme ? "#38BDF8" : "#007AFF"} />
            )}
          </View>
          
          <Text
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: isDarkColorScheme ? "#38BDF8" : "#007AFF",
              flex: 1
            }}
          >
            {isCheckingPassword ? t("profile.password.checking") : t("profile.password.changeOrSet")}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textSub} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileInfoSection;