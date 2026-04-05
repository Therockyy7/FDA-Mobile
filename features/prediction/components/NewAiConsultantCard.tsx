import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { AiConsultant } from "../types/prediction.types";
import { useColorScheme } from "~/lib/useColorScheme";

interface Props {
  aiConsultant: AiConsultant;
}

// Parse markdown headings ## into sections
function parseSections(text: string): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = [];
  const lines = text.split("\n");
  let current: { title: string; content: string } | null = null;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (current) sections.push(current);
      current = { title: line.replace("## ", "").trim(), content: "" };
    } else if (current) {
      current.content += line + "\n";
    }
  }
  if (current) sections.push(current);
  return sections;
}

const SECTION_ICONS: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  default: { icon: "information-circle-outline", color: "#64748B" },
  "tinh hinh": { icon: "pulse-outline", color: "#3B82F6" },
  "nguyen nhan": { icon: "git-branch-outline", color: "#8B5CF6" },
  "hanh dong": { icon: "flash-outline", color: "#F59E0B" },
  "theo doi": { icon: "eye-outline", color: "#10B981" },
};

function getSectionMeta(title: string) {
  const key = Object.keys(SECTION_ICONS).find(k =>
    title.toLowerCase().replace(/\s+/g, " ").includes(k)
  );
  return SECTION_ICONS[key ?? "default"];
}

export function NewAiConsultantCard({ aiConsultant }: Props) {
  const { isDarkColorScheme } = useColorScheme();
  const [expanded, setExpanded] = useState(true);
  const bg   = isDarkColorScheme ? "#1E293B" : "#FFFFFF";
  const muted = isDarkColorScheme ? "#94A3B8" : "#64748B";
  const text  = isDarkColorScheme ? "#F1F5F9" : "#0F172A";
  const sub   = isDarkColorScheme ? "#0F172A" : "#F8FAFC";

  const sections = parseSections(aiConsultant.finalSummary || "");

  return (
    <View style={{
      backgroundColor: bg, borderRadius: 20,
      padding: 16,
      shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
      borderLeftWidth: 3, borderLeftColor: "#6366F1",
    }}>
      {/* Header */}
      <TouchableOpacity
        onPress={() => setExpanded(e => !e)}
        style={{ flexDirection: "row", alignItems: "center", marginBottom: expanded ? 14 : 0, gap: 10 }}
      >
        <View style={{
          width: 36, height: 36, borderRadius: 12,
          backgroundColor: isDarkColorScheme ? "#1E1B4B" : "#EDE9FE",
          alignItems: "center", justifyContent: "center",
        }}>
          <Ionicons name="sparkles" size={18} color="#6366F1" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: "800", color: text }}>Tư vấn AI</Text>
          <Text style={{ fontSize: 11, color: muted }}>
            Cung cấp bởi {aiConsultant.provider?.toUpperCase() ?? "AI"} · Phân tích chuyên sâu
          </Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18} color={muted}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={{ gap: 10 }}>
          {sections.length > 0 ? sections.map((section, idx) => {
            const meta = getSectionMeta(section.title);
            return (
              <View key={idx} style={{ backgroundColor: sub, borderRadius: 14, padding: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <View style={{
                    width: 24, height: 24, borderRadius: 7,
                    backgroundColor: `${meta.color}20`,
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <Ionicons name={meta.icon} size={13} color={meta.color} />
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: "800", color: meta.color, flex: 1 }}>
                    {section.title}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: isDarkColorScheme ? "#CBD5E1" : "#475569", lineHeight: 19 }}>
                  {section.content.trim()}
                </Text>
              </View>
            );
          }) : (
            <Text style={{ fontSize: 13, color: isDarkColorScheme ? "#CBD5E1" : "#475569", lineHeight: 20 }}>
              {aiConsultant.finalSummary}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
