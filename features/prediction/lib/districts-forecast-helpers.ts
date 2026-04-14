import * as Location from "expo-location";

// ─────────────────────────────────────────────────────────────
// Location formatting
// ─────────────────────────────────────────────────────────────

export function formatLocationName(
  parts: Location.LocationGeocodedAddress
): string {
  const ward = parts.district ?? parts.name ?? "";
  const cityPart = parts.city ?? parts.subregion ?? "";
  if (ward && cityPart) return `${ward}, ${cityPart}`;
  return ward || cityPart || "Vị trí hiện tại";
}

// ─────────────────────────────────────────────────────────────
// Admin area fuzzy matching
// ─────────────────────────────────────────────────────────────

/** Normalize Vietnamese string: lowercase + remove diacritics for fuzzy comparison */
export function normalizeVi(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

/**
 * Score how well an admin-area name matches a search term.
 *   100 – exact match (normalized)
 *    80 – area name starts with term
 *    60 – term starts with area name
 *    40 – area name contains term
 *    20 – term contains area name
 *     0 – no match
 */
export function scoreAreaMatch(areaName: string, searchTerm: string): number {
  const a = normalizeVi(areaName);
  const t = normalizeVi(searchTerm);
  if (!a || !t) return 0;
  if (a === t) return 100;
  if (a.startsWith(t)) return 80;
  if (t.startsWith(a)) return 60;
  if (a.includes(t)) return 40;
  if (t.includes(a)) return 20;
  return 0;
}

/** Given a list of admin areas and a search term, return the best-matching one or null */
export function pickBestArea(
  areas: { id: string; name: string }[],
  term: string
): { id: string; name: string } | null {
  let best: { id: string; name: string } | null = null;
  let bestScore = 0;
  for (const area of areas) {
    const score = scoreAreaMatch(area.name, term);
    if (score > bestScore) {
      bestScore = score;
      best = area;
    }
  }
  return bestScore > 0 ? best : null;
}

// ─────────────────────────────────────────────────────────────
// Risk gradient helper
// ─────────────────────────────────────────────────────────────

export function getRiskGradient(riskLevel: string): readonly [string, string] {
  const upper = riskLevel?.toUpperCase() ?? "";
  if (upper.includes("CAO") || upper.includes("HIGH") || upper.includes("CAM"))
    return ["#DC2626", "#F87171"] as const;
  if (upper.includes("VANG") || upper.includes("MODERATE") || upper.includes("MED"))
    return ["#D97706", "#FBBF24"] as const;
  if (upper.includes("CRITICAL") || upper.includes("RAT"))
    return ["#7F1D1D", "#DC2626"] as const;
  return ["#059669", "#34D399"] as const;
}
