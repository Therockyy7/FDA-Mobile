// features/map/lib/instruction-translator.ts
// Translates GraphHopper English instruction text to Vietnamese.
// Street names (OSM data, already in Vietnamese) are preserved as-is.

const GRAPHHOPPER_TRANSLATIONS: Array<{
  pattern: RegExp;
  replace: (m: RegExpMatchArray) => string;
}> = [
  { pattern: /^turn left onto (.+)$/i, replace: (m) => `Rẽ trái vào ${m[1]}` },
  { pattern: /^turn right onto (.+)$/i, replace: (m) => `Rẽ phải vào ${m[1]}` },
  { pattern: /^turn left$/i, replace: () => "Rẽ trái" },
  { pattern: /^turn right$/i, replace: () => "Rẽ phải" },
  { pattern: /^continue onto (.+)$/i, replace: (m) => `Tiếp tục trên ${m[1]}` },
  { pattern: /^continue$/i, replace: () => "Đi thẳng" },
  { pattern: /^make a u-turn onto (.+)$/i, replace: (m) => `Quay đầu vào ${m[1]}` },
  { pattern: /^make a u-turn$/i, replace: () => "Quay đầu" },
  {
    pattern: /^at roundabout, take exit (\d+) onto (.+)$/i,
    replace: (m) => `Tại vòng xuyến, rẽ lối ra ${m[1]} vào ${m[2]}`,
  },
  {
    pattern: /^at roundabout, take exit (\d+)$/i,
    replace: (m) => `Tại vòng xuyến, rẽ lối ra ${m[1]}`,
  },
  { pattern: /^arrive at destination$/i, replace: () => "Đến nơi" },
  { pattern: /^keep left onto (.+)$/i, replace: (m) => `Giữ bên trái vào ${m[1]}` },
  { pattern: /^keep right onto (.+)$/i, replace: (m) => `Giữ bên phải vào ${m[1]}` },
  { pattern: /^keep left$/i, replace: () => "Giữ bên trái" },
  { pattern: /^keep right$/i, replace: () => "Giữ bên phải" },
];

export function translateInstruction(text: string): string {
  for (const { pattern, replace } of GRAPHHOPPER_TRANSLATIONS) {
    const m = text.match(pattern);
    if (m) return replace(m);
  }
  return text;
}

export function getManeuverIcon(instructionText: string): string {
  const text = instructionText.toLowerCase();
  if (text.includes("rẽ trái") || text.includes("turn left")) return "arrow-back";
  if (text.includes("rẽ phải") || text.includes("turn right")) return "arrow-forward";
  if (text.includes("quay đầu") || text.includes("u-turn")) return "return-down-back";
  if (
    text.includes("vòng xuyến") ||
    text.includes("vòng xoay") ||
    text.includes("roundabout")
  )
    return "refresh-circle";
  if (text.includes("đến nơi") || text.includes("điểm đến") || text.includes("arrive"))
    return "flag";
  if (
    text.includes("thẳng") ||
    text.includes("tiếp tục") ||
    text.includes("continue")
  )
    return "arrow-up";
  return "navigate";
}
