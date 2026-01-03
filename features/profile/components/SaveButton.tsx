import React from "react";
import { TouchableOpacity, View, ActivityIndicator } from "react-native";
import { Text } from "~/components/ui/text";

type Props = {
  onPress: () => void;
  loading?: boolean;
};

const SaveButton: React.FC<Props> = ({ onPress, loading = false }) => {
  return (
    <View style={{ padding: 16 }}>
      <TouchableOpacity
        onPress={onPress}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#93C5FD" : "#3B82F6",
          borderRadius: 16,
          paddingVertical: 16,
          alignItems: "center",
          shadowColor: "#3B82F6",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
          flexDirection: "row",
          justifyContent: "center",
          gap: 8
        }}
        activeOpacity={0.8}
      >
        {loading && <ActivityIndicator color="white" />}
        <Text
          style={{
            fontSize: 16,
            fontWeight: "800",
            color: "white",
          }}
        >
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SaveButton;