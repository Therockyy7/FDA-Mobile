/**
 * Parser for AI Consultant Advice
 * Extracts structured data from markdown-formatted advice string
 */

export interface ParsedAdvice {
  // Overview
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  riskPercentage: number;
  riskLabel: string;
  
  // Key Factors
  factors: {
    slope: { percentage: number; description: string };
    saturation: { percentage: number; description: string };
    historySimilarity: { percentage: number; description: string };
  };
  
  // Main Assessment
  mainAssessment: string;
  
  // Recommendations
  recommendations: Array<{
    icon: string;
    title: string;
    description: string;
    items: string[];
  }>;
  
  // Conclusion
  conclusion: {
    icon: string;
    text: string;
  };
}

export function parseAdvice(advice: string): ParsedAdvice {
  // Extract risk percentage and level
  const riskMatch = advice.match(/(\d+\.?\d*)%.*?(\w+)/);
  const riskPercentage = parseFloat(riskMatch?.[1] || "0");
  
  // Determine risk level from keywords
  let riskLevel: ParsedAdvice["riskLevel"] = "Low";
  let riskLabel = "Thấp";
  
  if (advice.toLowerCase().includes("rủi ro cao") || advice.toLowerCase().includes("nguy cấp")) {
    riskLevel = "Critical";
    riskLabel = "Nguy Cấp";
  } else if (advice.toLowerCase().includes("rủi ro trung bình")) {
    riskLevel = "Medium";
    riskLabel = "Trung Bình";
  } else if (advice.toLowerCase().includes("rủi ro thấp")) {
    riskLevel = "Low";
    riskLabel = "Thấp";
  }
  
  // Extract factors
  const slopeMatch = advice.match(/độ dốc.*?(\d+\.?\d*)%/i);
  const saturationMatch = advice.match(/bão hòa.*?(\d+\.?\d*)%/i);
  const historyMatch = advice.match(/(?:tương đồng|lịch sử).*?(\d+)%/i);
  
  const factors = {
    slope: {
      percentage: parseFloat(slopeMatch?.[1] || "0"),
      description: extractDescription(advice, "độ dốc"),
    },
    saturation: {
      percentage: parseFloat(saturationMatch?.[1] || "0"),
      description: extractDescription(advice, "bão hòa"),
    },
    historySimilarity: {
      percentage: parseFloat(historyMatch?.[1] || "0"),
      description: extractDescription(advice, "lịch sử"),
    },
  };
  
  // Extract main assessment (first paragraph after risk statement)
  const assessmentMatch = advice.match(/⚠️.*?\*\*:(.+?)(?=\n-|\n\n|###)/s);
  const mainAssessment = assessmentMatch?.[1]?.trim() || "";
  
  // Extract recommendations section
  const recommendations: ParsedAdvice["recommendations"] = [];
  
  // Main recommendation
  const mainRecMatch = advice.match(/🟢\s*\*\*(.+?)\*\*:?(.+?)(?=\n-|\n\n|###)/s);
  if (mainRecMatch) {
    const items: string[] = [];
    const itemMatches = advice.matchAll(/^-\s*\*\*(.+?)\*\*:(.+?)$/gm);
    
    for (const match of itemMatches) {
      items.push(`${match[1]}: ${match[2].trim()}`);
    }
    
    recommendations.push({
      icon: "🟢",
      title: mainRecMatch[1].trim(),
      description: mainRecMatch[2].trim(),
      items: items.length > 0 ? items : extractBulletPoints(advice, "Khuyến Nghị"),
    });
  }
  
  // Extract conclusion
  const conclusionMatch = advice.match(/🌊\s*(.+?)$/s);
  const conclusion = {
    icon: "🌊",
    text: conclusionMatch?.[1]?.trim() || "Không có thông tin kết luận.",
  };
  
  return {
    riskLevel,
    riskPercentage,
    riskLabel,
    factors,
    mainAssessment,
    recommendations,
    conclusion,
  };
}

// Helper function to extract description for a factor
function extractDescription(text: string, keyword: string): string {
  const regex = new RegExp(`${keyword}.*?:(.+?)(?=\\n-|\\n\\n|###)`, "is");
  const match = text.match(regex);
  if (match) {
    return match[1].trim().replace(/\*\*/g, "").replace(/\n/g, " ");
  }
  return "";
}

// Helper function to extract bullet points from a section
function extractBulletPoints(text: string, sectionTitle: string): string[] {
  const items: string[] = [];
  const sectionRegex = new RegExp(`###\\s*${sectionTitle}[\\s\\S]*?(?=###|$)`, "i");
  const sectionMatch = text.match(sectionRegex);
  
  if (sectionMatch) {
    const bullets = sectionMatch[0].matchAll(/^-\s*(?:\*\*)?(.+?)(?:\*\*)?:?\s*(.*)$/gm);
    for (const bullet of bullets) {
      const combined = bullet[2] ? `${bullet[1]}: ${bullet[2]}` : bullet[1];
      items.push(combined.trim());
    }
  }
  
  return items;
}

// Get risk config for styling
export function getRiskConfig(level: ParsedAdvice["riskLevel"]) {
  switch (level) {
    case "Critical":
      return {
        color: "#EF4444",
        bgColor: "rgba(239, 68, 68, 0.1)",
        borderColor: "#EF4444",
        gradientColors: ["#DC2626", "#EF4444"] as const,
        icon: "alert-circle",
        label: "NGUY CẤP",
      };
    case "High":
      return {
        color: "#F97316",
        bgColor: "rgba(249, 115, 22, 0.1)",
        borderColor: "#F97316",
        gradientColors: ["#EA580C", "#F97316"] as const,
        icon: "alert-triangle",
        label: "CAO",
      };
    case "Medium":
      return {
        color: "#F59E0B",
        bgColor: "rgba(245, 158, 11, 0.1)",
        borderColor: "#F59E0B",
        gradientColors: ["#D97706", "#F59E0B"] as const,
        icon: "alert-circle",
        label: "TRUNG BÌNH",
      };
    default:
      return {
        color: "#10B981",
        bgColor: "rgba(16, 185, 129, 0.1)",
        borderColor: "#10B981",
        gradientColors: ["#059669", "#10B981"] as const,
        icon: "shield-checkmark",
        label: "THẤP",
      };
  }
}
