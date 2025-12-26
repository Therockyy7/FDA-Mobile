import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type LoginRequiredOverlayProps = {
  visible: boolean;
  onClose: () => void;
  onLogin: () => void;
  onSignUp: () => void;
};

// Có thể tách ra file riêng: features/auth/components/LoginRequiredOverlay.tsx
export const LoginRequiredOverlay = ({
  visible,
  onClose,
  onLogin,
  onSignUp,
}: LoginRequiredOverlayProps) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Yêu cầu đăng nhập</Text>
          <Text style={styles.desc}>
            Đăng nhập để truy cập khu vực, nhận thông báo và quản lý tài khoản.
          </Text>

          <TouchableOpacity style={styles.primaryBtn} onPress={onLogin}>
            <Text style={styles.primaryText}>Đăng nhập</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={onSignUp}>
            <Text style={styles.secondaryText}>Tạo tài khoản mới</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Để sau</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 16,
    padding: 20,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.6)",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E5E7EB",
    marginBottom: 8,
    textAlign: "center",
  },
  desc: {
    fontSize: 14,
    color: "#CBD5F5",
    textAlign: "center",
    marginBottom: 16,
  },
  primaryBtn: {
    backgroundColor: "#3B82F6",
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  primaryText: {
    color: "#F9FAFB",
    fontWeight: "700",
    fontSize: 15,
  },
  secondaryBtn: {
    paddingVertical: 8,
    alignItems: "center",
  },
  secondaryText: {
    color: "#9CA3AF",
    fontSize: 13,
    textDecorationLine: "underline",
  },
  closeBtn: {
    marginTop: 8,
    paddingVertical: 6,
    alignItems: "center",
  },
  closeText: {
    color: "#6B7280",
    fontSize: 13,
  },
});