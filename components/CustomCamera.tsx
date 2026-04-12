import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import React, { useRef, useState, useEffect } from "react";
import { Image, Pressable, TouchableOpacity, View, SafeAreaView } from "react-native";
import { Text } from "~/components/ui/text";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";

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
  const [recordingTime, setRecordingTime] = useState(0);

  // State để chuyển đổi chế độ chụp/quay
  const [cameraMode, setCameraMode] = useState<"picture" | "video">("picture");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [camPermission, requestCamPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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
    setRecordingTime(0);

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= 29) {
          stopRecording();
          return 30; // Maximum visual value
        }
        return prev + 1;
      });
    }, 1000);

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
      stopRecording();
    }
  };

  // 3. HÀM DỪNG QUAY
  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (isRecording && cameraRef.current) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
    }
    // Trả lại chế độ hình ảnh để sẵn sàng cho lần chạm tiếp theo
    setCameraMode("picture");
  };

  const formatTime = (seconds: number) => {
    const s = seconds % 60;
    return `00:${s < 10 ? "0" + s : s}`;
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
        videoQuality="1080p"
      >
        <SafeAreaView style={{ flex: 1, justifyContent: "space-between" }}>
          {/* Header Controls */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 24,
              paddingTop: 16,
              zIndex: 10,
            }}
          >
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                alignItems: "center",
                backdropFilter: "blur(10px)",
              }}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>

            {isRecording && (
              <BlurView
                intensity={40}
                tint="dark"
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: "rgba(239,68,68,0.2)",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  overflow: "hidden",
                }}
              >
                <MotiView
                  from={{ opacity: 0.4 }}
                  animate={{ opacity: 1 }}
                  transition={{ loop: true, type: "timing", duration: 800 }}
                  style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#ef4444" }}
                />
                <Text style={{ color: "white", fontSize: 14, fontWeight: "bold", fontVariant: ["tabular-nums"] }}>
                  {formatTime(recordingTime)} / 00:30
                </Text>
              </BlurView>
            )}

            {/* Placeholder to balance close button */}
            <View style={{ width: 44 }} />
          </View>

          {/* Footer Controls */}
          <BlurView
            intensity={50}
            tint="dark"
            style={{
              paddingHorizontal: 24,
              paddingVertical: 32,
              paddingBottom: 48,
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              overflow: "hidden",
            }}
          >
            {/* Thumbnail */}
            <View style={{ flex: 1, alignItems: "flex-start" }}>
              {capturedList.length > 0 && (
                <TouchableOpacity activeOpacity={0.8} onPress={() => onDone(capturedList)} style={{ alignItems: "center" }}>
                  <View style={{ position: "relative" }}>
                    <Image
                      source={{ uri: capturedList[capturedList.length - 1].uri }}
                      style={{ width: 60, height: 60, borderRadius: 12, borderWidth: 2, borderColor: "rgba(255,255,255,0.8)" }}
                    />
                    {capturedList[capturedList.length - 1].type === "video" && (
                      <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center", borderRadius: 10 }}>
                        <Ionicons name="videocam" size={20} color="white" />
                      </View>
                    )}
                    <View style={{ position: "absolute", top: -8, right: -8, width: 26, height: 26, borderRadius: 13, backgroundColor: "#ef4444", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#1e293b", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 }}>
                      <Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>{capturedList.length}</Text>
                    </View>
                  </View>
                  <View style={{ marginTop: 12, flexDirection: "row", alignItems: "center", backgroundColor: "white", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
                    <Text style={{ color: "black", fontWeight: "700", fontSize: 14 }}>Xong</Text>
                    <Ionicons name="checkmark" size={18} color="black" style={{ marginLeft: 6 }} />
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Chụp/Quay */}
            <View style={{ flex: 1, alignItems: "center", justifyContent: "flex-end" }}>
              {!isRecording ? (
                <MotiView
                  from={{ opacity: 0, translateY: 5 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: "timing", duration: 600, delay: 200 }}
                  style={{
                    backgroundColor: "rgba(0,0,0,0.5)",
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.15)",
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 11, fontWeight: "600", letterSpacing: 0.2 }}>
                    Chạm chụp • Giữ quay
                  </Text>
                </MotiView>
              ) : (
                <View style={{ height: 26, marginBottom: 12 }} />
              )}
              <Pressable
                onPress={takePicture}
                onLongPress={startRecording}
                onPressOut={stopRecording}
                delayLongPress={300}
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 42,
                  borderWidth: isRecording ? 4 : 4,
                  justifyContent: "center",
                  alignItems: "center",
                  borderColor: isRecording ? "rgba(239,68,68,0.5)" : "white",
                  backgroundColor: isRecording ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.15)",
                }}
              >
                <View
                  style={{
                    backgroundColor: isRecording ? "#ef4444" : "white",
                    width: isRecording ? 32 : 68,
                    height: isRecording ? 32 : 68,
                    borderRadius: isRecording ? 8 : 34,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 5,
                  }}
                />
              </Pressable>
            </View>

            {/* Lật Camera */}
            <View style={{ flex: 1, alignItems: "flex-end", paddingRight: 4 }}>
              <TouchableOpacity
                onPress={toggleCameraFacing}
                disabled={isRecording}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  justifyContent: "center",
                  alignItems: "center",
                  opacity: isRecording ? 0 : 1,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.3)",
                }}
              >
                <Ionicons name="camera-reverse" size={26} color="white" />
              </TouchableOpacity>
            </View>
          </BlurView>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}
