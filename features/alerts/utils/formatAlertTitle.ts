/**
 * Strips everything before the first ":" in an alert/notification title.
 *
 * API titles often come in the form  "🚨 GẤP: Ngập lụt tại Khu Vực"
 * or  "⚠️ CẢNH BÁO: Mực nước tăng cao".
 *
 * This helper returns only the meaningful part after the colon,
 * trimmed and with the first letter capitalised.
 *
 * If there is no colon the original title is returned as-is.
 */
export function formatAlertTitle(raw: string | undefined | null): string {
  if (!raw) return "";
  const colonIndex = raw.indexOf(":");
  if (colonIndex === -1) return raw.trim();
  const after = raw.slice(colonIndex + 1).trim();
  if (!after) return raw.trim();
  // Capitalise the first letter
  return after.charAt(0).toUpperCase() + after.slice(1);
}
