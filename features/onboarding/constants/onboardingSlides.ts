export type OnboardingSlide = {
  key: string;
  headline: string;
  description: string;
  gradient: [string, string];
  image: number;
};

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    key: "realtime_map",
    headline: "BẢN ĐỒ NGẬP LỤT\nREALTIME",
    description: "Bản đồ tương tác với cảnh báo realtime\nGPS, sông nước, định vị",
    gradient: ["#07162B", "#0B2B52"],
    image: require("../../../assets/images/mascot/onboarding_realtime_map.png"),
  },
  {
    key: "safe_navigation",
    headline: "TÌM ĐƯỜNG\nAN TOÀN",
    description: "Điều hướng tránh vùng ngập\nNavigation, an toàn",
    gradient: ["#0AA37A", "#0B6FA0"],
    image: require("../../../assets/images/mascot/onboarding_safe_navigation.png"),
  },
  {
    key: "ai_prediction",
    headline: "AI DỰ ĐOÁN\nNGẬP LỤT",
    description: "Ensemble model kết hợp AI + Satellite\nAI brain, phân tích dữ liệu",
    gradient: ["#081A32", "#0B2C56"],
    image: require("../../../assets/images/mascot/onboarding_ai_prediction.png"),
  },
  {
    key: "realtime_alerts",
    headline: "CẢNH BÁO\nTHỜI GIAN THỰC",
    description: "Nhận thông báo FCM khi có ngập\nChuông cảnh báo, notify",
    gradient: ["#B88910", "#6C4F0A"],
    image: require("../../../assets/images/mascot/onboarding_realtime_alerts.png"),
  },
  {
    key: "community_report",
    headline: "CỘNG ĐỒNG\nBÁO CÁO NGẬP",
    description: "Cộng đồng, report, camera",
    gradient: ["#0F7DBB", "#0E5DA8"],
    image: require("../../../assets/images/mascot/onboarding_community_report.png"),
  },
];

