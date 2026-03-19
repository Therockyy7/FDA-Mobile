import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import React, { useRef, useState } from "react";
import { Image, Pressable, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";

export interface CapturedMedia {
  uri: string;
  type: "image" | "video";
}

interface CustomCameraProps {
  onClose: () => void;
  onDone: (media: CapturedMedia[]) => void;
}

export function CustomCamera({ onClose, onDone }: CustomCameraProps) {
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [capturedList, setCapturedList] = useState<CapturedMedia[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  // State để chuyển đổi chế độ chụp/quay
  const [cameraMode, setCameraMode] = useState<"picture" | "video">("picture");

  const [camPermission, requestCamPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const cameraRef = useRef<CameraView>(null);

  const hasPermissions = camPermission?.granted && micPermission?.granted;

  if (!camPermission || !micPermission) {
    return <View style={{ flex: 1, backgroundColor: "black" }} />;
  }

  if (!hasPermissions) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f172a", padding: 16 }}>
        <Text style={{ color: "white", textAlign: "center", marginBottom: 16, fontSize: 18 }}>
          Cần cấp quyền truy cập Camera và Micro để báo cáo ngập lụt.
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: "#3b82f6", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
          onPress={async () => {
            await requestCamPermission();
            await requestMicPermission();
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>Cấp quyền</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 16 }} onPress={onClose}>
          <Text style={{ color: "#94a3b8" }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 1. HÀM CHỤP ẢNH
  const takePicture = async () => {
    if (!cameraRef.current || isRecording) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
      });
      if (photo) {
        setCapturedList((prev) => [...prev, { uri: photo.uri, type: "image" }]);
      }
    } catch (error) {
      console.error("Lỗi khi chụp ảnh:", error);
    }
  };

  // 2. HÀM QUAY VIDEO
  const startRecording = async () => {
    if (!cameraRef.current) return;

    // Đổi sang chế độ Video trước
    setCameraMode("video");
    setIsRecording(true);

    try {
      // Cho Native View 150ms để kịp lật ống kính sang video trước khi gọi lệnh quay
      setTimeout(async () => {
        if (cameraRef.current) {
          const video = await cameraRef.current.recordAsync({
            maxDuration: 30,
          });
          if (video) {
            setCapturedList((prev) => [...prev, { uri: video.uri, type: "video" }]);
          }
        }
      }, 150);
    } catch (error) {
      console.error("Lỗi khi quay video:", error);
      setIsRecording(false);
      setCameraMode("picture");
    }
  };

  // 3. HÀM DỪNG QUAY
  const stopRecording = () => {
    if (isRecording && cameraRef.current) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
    }
    // Trả lại chế độ hình ảnh để sẵn sàng cho lần chạm tiếp theo
    setCameraMode("picture");
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <CameraView
        style={{ flex: 1 }}
        facing={facing}
        ref={cameraRef}
        mode={cameraMode}
        videoQuality="720p"
      >
        {/* Nút Đóng */}
        <View style={{ position: "absolute", top: 48, left: 16, zIndex: 10 }}>
          <TouchableOpacity
            onPress={onClose}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Trạng thái đang quay */}
        {isRecording && (
          <View style={{ position: "absolute", top: 52, alignSelf: "center", backgroundColor: "rgba(239,68,68,0.8)", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, flexDirection: "row", alignItems: "center", gap: 4, zIndex: 10 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "white" }} />
            <Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>ĐANG QUAY</Text>
          </View>
        )}

        {/* Cụm điều khiển */}
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 48, backgroundColor: "rgba(0,0,0,0.4)" }}>
          {/* Cột trái: Thumbnail & Xong */}
          <View style={{ flex: 1, alignItems: "flex-start" }}>
            {capturedList.length > 0 && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onDone(capturedList)}
                style={{ alignItems: "center" }}
              >
                <View style={{ position: "relative" }}>
                  <Image
                    source={{ uri: capturedList[capturedList.length - 1].uri }}
                    style={{ width: 56, height: 56, borderRadius: 8, borderWidth: 2, borderColor: "white" }}
                  />
                  {capturedList[capturedList.length - 1].type === "video" && (
                    <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center", borderRadius: 8 }}>
                      <Ionicons name="videocam" size={16} color="white" />
                    </View>
                  )}
                  <View style={{ position: "absolute", top: -8, right: -8, width: 24, height: 24, borderRadius: 12, backgroundColor: "#3b82f6", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "black" }}>
                    <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>{capturedList.length}</Text>
                  </View>
                </View>
                <Text style={{ color: "white", marginTop: 8, fontWeight: "600", backgroundColor: "#3b82f6", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, overflow: "hidden" }}>
                  Xong
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Cột giữa: Nút Chụp/Quay */}
          <View style={{ flex: 1, alignItems: "center" }}>
            <Pressable
              onPress={takePicture}
              onLongPress={startRecording}
              onPressOut={stopRecording}
              delayLongPress={300}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                borderWidth: 4,
                justifyContent: "center",
                alignItems: "center",
                borderColor: isRecording ? "#ef4444" : "white",
                backgroundColor: isRecording ? "rgba(239,68,68,0.2)" : "transparent"
              }}
            >
              <View
                style={{
                  backgroundColor: "white",
                  width: isRecording ? 32 : 64,
                  height: isRecording ? 32 : 64,
                  borderRadius: isRecording ? 4 : 32
                }}
              />
            </Pressable>
          </View>

          {/* Cột phải: Lật Camera */}
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <TouchableOpacity
              onPress={toggleCameraFacing}
              disabled={isRecording}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "rgba(0,0,0,0.4)",
                justifyContent: "center",
                alignItems: "center",
                opacity: isRecording ? 0.5 : 1
              }}
            >
              <Ionicons name="camera-reverse-outline" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}
