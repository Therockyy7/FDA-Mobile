import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "~/features/i18n";

type LoginRequiredOverlayProps = {
  visible: boolean;
  onClose: () => void;
  onLogin: () => void;
  onSignUp: () => void;
};

export const LoginRequiredOverlay = ({
  visible,
  onClose,
  onLogin,
  onSignUp,
}: LoginRequiredOverlayProps) => {
  const { t } = useTranslation();
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{t("auth.loginRequired.title")}</Text>
          <Text style={styles.desc}>
            {t("auth.loginRequired.desc")}
          </Text>

          <TouchableOpacity style={styles.primaryBtn} onPress={onLogin}>
            <Text style={styles.primaryText}>{t("auth.signIn")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>{t("auth.loginRequired.later")}</Text>
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