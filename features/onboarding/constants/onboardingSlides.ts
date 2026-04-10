export type OnboardingSlide = {
  key: string;
  topTitle: string;
  bottomTitle: string;
  description: string;
  backgroundGradient: [string, string];
  mascotImage: number;
};

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    key: "realtime_map",
    topTitle: "BẢN ĐỒ NGẬP LỤT\nREALTIME",
    bottomTitle: "BẢN ĐỒ NGẬP LỤT REALTIME",
    description: "Bản đồ tương tác với cảnh báo realtime\nGPS, sông nước, định vị",
    backgroundGradient: ["#07162B", "#0B2B52"],
    mascotImage: require("../../../assets/images/mascot_no_bg/onboarding_realtime_map.png"),
  },
  {
    key: "safe_navigation",
    topTitle: "TÌM ĐƯỜNG\nAN TOÀN",
    bottomTitle: "TÌM ĐƯỜNG AN TOÀN",
    description: "Điều hướng tránh vùng ngập\nNavigation, an toàn",
    backgroundGradient: ["#0AA37A", "#0B6FA0"],
    mascotImage: require("../../../assets/images/mascot_no_bg/onboarding_safe_navigation.png"),
  },
  {
    key: "ai_prediction",
    topTitle: "AI DỰ ĐOÁN\nNGẬP LỤT",
    bottomTitle: "AI DỰ ĐOÁN NGẬP LỤT",
    description: "Ensemble model kết hợp AI + Satellite\nAI brain, phân tích dữ liệu",
    backgroundGradient: ["#081A32", "#0B2C56"],
    mascotImage: require("../../../assets/images/mascot_no_bg/onboarding_ai_prediction.png"),
  },
  {
    key: "realtime_alerts",
    topTitle: "CẢNH BÁO\nTHỜI GIAN THỰC",
    bottomTitle: "CẢNH BÁO THỜI GIAN THỰC",
    description: "Nhận thông báo FCM khi có ngập\nChuông cảnh báo, notify",
    backgroundGradient: ["#B88910", "#6C4F0A"],
    mascotImage: require("../../../assets/images/mascot_no_bg/onboarding_realtime_alerts.png"),
  },
  {
    key: "community_report",
    topTitle: "CỘNG ĐỒNG\nBÁO CÁO NGẬP",
    bottomTitle: "CỘNG ĐỒNG BÁO CÁO NGẬP",
    description: "Cộng đồng, report, camera",
    backgroundGradient: ["#0F7DBB", "#0E5DA8"],
    mascotImage: require("../../../assets/images/mascot_no_bg/onboarding_community_report.png"),
  },
];
