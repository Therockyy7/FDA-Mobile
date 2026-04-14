import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { AiConsultant } from "../types/prediction.types";
import { SHADOW } from "~/lib/design-tokens";

interface Props {
  aiConsultant: AiConsultant;
}

// Parse markdown headings ## into sections, or fallback to line-break blocks
function parseSections(text: string): { title: string; content: string }[] {
  let sections: { title: string; content: string }[] = [];
  const lines = text.split("\n");
  let current: { title: string; content: string } | null = null;

  // Attempt 1: Parse Markdown Headers (## )
  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (current) sections.push(current);
      current = { title: line.replace("## ", "").trim(), content: "" };
    } else if (current) {
      current.content += line + "\n";
    }
  }
  if (current) sections.push(current);

  // Attempt 2: If no Markdown headers found, assuming plain text separated by empty lines.
  // The first line of each block is treated as the title, rest as content.
  if (sections.length === 0) {
    const blocks = text.split(/\n\s*\n/);
    for (const block of blocks) {
      const blockLines = block.trim().split("\n");
      if (blockLines.length > 0) {
        const title = blockLines[0].trim();
        const content = blockLines.slice(1).join("\n").trim();

        // Only classify as a section if there is actual content under the title
        if (content) {
          sections.push({ title, content });
        } else if (title) {
          // If it's just a single paragraph without a title, show it under a generic title
          sections.push({ title: "Thông tin chung", content: title });
        }
      }
    }
  }

  return sections;
}

// Remove Vietnamese accents for easier matching
function normalizeText(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const SECTION_ICONS: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  default: { icon: "information-circle-outline", color: "#64748B" },
  "tinh hinh": { icon: "pulse-outline", color: "#3B82F6" },
  "nguyen nhan": { icon: "git-branch-outline", color: "#8B5CF6" },
  "hanh dong": { icon: "flash-outline", color: "#F59E0B" },
  "theo doi": { icon: "eye-outline", color: "#10B981" },
};

function getSectionMeta(title: string) {
  const normalizedTitle = normalizeText(title);
  const key = Object.keys(SECTION_ICONS).find(k =>
    normalizedTitle.includes(k)
  );
  return SECTION_ICONS[key ?? "default"];
}

export function NewAiConsultantCard({ aiConsultant }: Props) {
  const [expanded, setExpanded] = useState(true);

  const sections = parseSections(aiConsultant.finalSummary || "");

  return (
    <View
      testID="prediction-new-ai-consultant-card"
      className="bg-white dark:bg-slate-800 rounded-2xl border-l-[3px] border-indigo-500"
      style={{ padding: 16, ...SHADOW.md }}
    >
      {/* Header */}
      <TouchableOpacity
        testID="prediction-new-ai-consultant-toggle"
        onPress={() => setExpanded(e => !e)}
        style={{ flexDirection: "row", alignItems: "center", marginBottom: expanded ? 14 : 0, gap: 10 }}
      >
        <View className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/40 items-center justify-center">
          <Ionicons name="sparkles" size={18} color="#6366F1" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            testID="prediction-new-ai-consultant-title"
            className="text-sm font-extrabold text-gray-900 dark:text-slate-100"
          >
            Tư vấn AI
          </Text>
          <Text
            testID="prediction-new-ai-consultant-provider"
            className="text-xs text-slate-500 dark:text-slate-400"
          >
            Cung cấp bởi {aiConsultant.provider?.toUpperCase() ?? "AI"} · Phân tích chuyên sâu
          </Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          className="text-slate-500 dark:text-slate-400"
        />
      </TouchableOpacity>

      {expanded && (
        <View style={{ gap: 10 }}>
          {sections.length > 0 ? sections.map((section, idx) => {
            const meta = getSectionMeta(section.title);
            return (
              <View
                key={idx}
                testID={`prediction-new-ai-consultant-section-${idx}`}
                className="bg-slate-50 dark:bg-slate-900 rounded-2xl"
                style={{ padding: 12 }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <View style={{
                    width: 24, height: 24, borderRadius: 7,
                    backgroundColor: `${meta.color}20`,
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <Ionicons name={meta.icon} size={13} color={meta.color} />
                  </View>
                  <Text
                    testID={`prediction-new-ai-consultant-section-title-${idx}`}
                    style={{ fontSize: 12, fontWeight: "800", color: meta.color, flex: 1 }}
                  >
                    {section.title}
                  </Text>
                </View>
                <Text
                  testID={`prediction-new-ai-consultant-section-content-${idx}`}
                  className="text-xs text-slate-500 dark:text-slate-400"
                  style={{ lineHeight: 19 }}
                >
                  {section.content.trim()}
                </Text>
              </View>
            );
          }) : (
            <Text
              testID="prediction-new-ai-consultant-fallback"
              className="text-sm text-slate-500 dark:text-slate-400"
              style={{ lineHeight: 20 }}
            >
              {aiConsultant.finalSummary}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
