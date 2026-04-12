/**
 * EWKB (Extended Well-Known Binary) Hex Parser
 *
 * Parses PostGIS EWKB hex geometry strings into GeoJSON-style coordinates.
 * Supports: Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon.
 *
 * EWKB format:
 *   [byte_order: 1 byte] [type: 4 bytes] [srid?: 4 bytes] [geometry data...]
 *   - byte_order: 01 = little-endian, 00 = big-endian
 *   - type: geometry type with optional flags (SRID flag = 0x20000000)
 */

// Geometry type constants
const WKB_POINT = 1;
const WKB_LINESTRING = 2;
const WKB_POLYGON = 3;
const WKB_MULTIPOINT = 4;
const WKB_MULTILINESTRING = 5;
const WKB_MULTIPOLYGON = 6;
const WKB_GEOMETRYCOLLECTION = 7;

// Flag mask
const WKB_SRID_FLAG = 0x20000000;
const WKB_TYPE_MASK = 0x0fffffff;

interface ParsedGeometry {
  type: string;
  coordinates: any;
}

class BinaryReader {
  private hex: string;
  private pos: number;
  private littleEndian: boolean;

  constructor(hex: string) {
    this.hex = hex.toUpperCase();
    this.pos = 0;
    this.littleEndian = true;
  }

  readUInt8(): number {
    const val = parseInt(this.hex.substring(this.pos, this.pos + 2), 16);
    this.pos += 2;
    return val;
  }

  readUInt32(): number {
    const bytes: number[] = [];
    for (let i = 0; i < 4; i++) {
      bytes.push(parseInt(this.hex.substring(this.pos, this.pos + 2), 16));
      this.pos += 2;
    }
    if (this.littleEndian) {
      return ((bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0]) >>> 0;
    }
    return ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
  }

  readFloat64(): number {
    const bytes: number[] = [];
    for (let i = 0; i < 8; i++) {
      bytes.push(parseInt(this.hex.substring(this.pos, this.pos + 2), 16));
      this.pos += 2;
    }

    // Create a DataView to properly read IEEE 754 double
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    if (this.littleEndian) {
      for (let i = 0; i < 8; i++) {
        view.setUint8(i, bytes[i]);
      }
      return view.getFloat64(0, true); // little-endian
    } else {
      for (let i = 0; i < 8; i++) {
        view.setUint8(i, bytes[i]);
      }
      return view.getFloat64(0, false); // big-endian
    }
  }

  setByteOrder(byteOrder: number): void {
    this.littleEndian = byteOrder === 1;
  }

  hasMore(): boolean {
    return this.pos < this.hex.length;
  }
}

function readPoint(reader: BinaryReader): [number, number] {
  const x = reader.readFloat64(); // longitude
  const y = reader.readFloat64(); // latitude
  return [x, y];
}

function readLinearRing(reader: BinaryReader): [number, number][] {
  const numPoints = reader.readUInt32();
  const points: [number, number][] = [];
  for (let i = 0; i < numPoints; i++) {
    points.push(readPoint(reader));
  }
  return points;
}

function readPolygon(reader: BinaryReader): [number, number][][] {
  const numRings = reader.readUInt32();
  const rings: [number, number][][] = [];
  for (let i = 0; i < numRings; i++) {
    rings.push(readLinearRing(reader));
  }
  return rings;
}

function readGeometry(reader: BinaryReader): ParsedGeometry | null {
  const byteOrder = reader.readUInt8();
  reader.setByteOrder(byteOrder);

  let typeInt = reader.readUInt32();

  // Check for SRID flag
  const hasSRID = (typeInt & WKB_SRID_FLAG) !== 0;
  const geometryType = typeInt & WKB_TYPE_MASK;

  // Read and discard SRID if present
  if (hasSRID) {
    reader.readUInt32(); // srid value, we don't need it
  }

  switch (geometryType) {
    case WKB_POINT: {
      const coords = readPoint(reader);
      return { type: "Point", coordinates: coords };
    }

    case WKB_LINESTRING: {
      const numPoints = reader.readUInt32();
      const coords: [number, number][] = [];
      for (let i = 0; i < numPoints; i++) {
        coords.push(readPoint(reader));
      }
      return { type: "LineString", coordinates: coords };
    }

    case WKB_POLYGON: {
      const coords = readPolygon(reader);
      return { type: "Polygon", coordinates: coords };
    }

    case WKB_MULTIPOINT: {
      const numPoints = reader.readUInt32();
      const coords: [number, number][] = [];
      for (let i = 0; i < numPoints; i++) {
        const pt = readGeometry(reader);
        if (pt && pt.type === "Point") {
          coords.push(pt.coordinates);
        }
      }
      return { type: "MultiPoint", coordinates: coords };
    }

    case WKB_MULTILINESTRING: {
      const numLines = reader.readUInt32();
      const coords: [number, number][][] = [];
      for (let i = 0; i < numLines; i++) {
        const line = readGeometry(reader);
        if (line && line.type === "LineString") {
          coords.push(line.coordinates);
        }
      }
      return { type: "MultiLineString", coordinates: coords };
    }

    case WKB_MULTIPOLYGON: {
      const numPolygons = reader.readUInt32();
      const coords: [number, number][][][] = [];
      for (let i = 0; i < numPolygons; i++) {
        const poly = readGeometry(reader);
        if (poly && poly.type === "Polygon") {
          coords.push(poly.coordinates);
        }
      }
      return { type: "MultiPolygon", coordinates: coords };
    }

    case WKB_GEOMETRYCOLLECTION: {
      const numGeometries = reader.readUInt32();
      const geometries: ParsedGeometry[] = [];
      for (let i = 0; i < numGeometries; i++) {
        const geom = readGeometry(reader);
        if (geom) {
          geometries.push(geom);
        }
      }
      return {
        type: "GeometryCollection",
        coordinates: geometries, // non-standard, but handled upstream
      };
    }

    default:
      console.warn(`[EWKB] Unsupported geometry type: ${geometryType}`);
      return null;
  }
}

/**
 * Check if a string is likely an EWKB hex string.
 */
export function isEwkbHex(str: string): boolean {
  if (!str || typeof str !== "string") return false;
  const trimmed = str.trim();
  // Must be hex chars only, reasonably long, and start with 00 or 01 (byte order)
  return (
    trimmed.length >= 10 &&
    /^[0-9a-fA-F]+$/.test(trimmed) &&
    (trimmed.startsWith("01") || trimmed.startsWith("00"))
  );
}

/**
 * Parse an EWKB hex string into a GeoJSON-like geometry object.
 * Returns null if parsing fails.
 */
export function parseEwkbHex(hex: string): ParsedGeometry | null {
  try {
    const reader = new BinaryReader(hex.trim());
    return readGeometry(reader);
  } catch (error) {
    console.warn("[EWKB] Failed to parse geometry:", error);
    return null;
  }
}

/**
 * Extract lat/lng coordinate arrays from an EWKB hex string.
 * Returns the first polygon's outer ring as an array of {latitude, longitude}.
 * For MultiPolygon, returns the first polygon's outer ring.
 */
export function ewkbToLatLngArray(
  hex: string,
): { latitude: number; longitude: number }[] {
  const geometry = parseEwkbHex(hex);
  if (!geometry) return [];

  let coords: [number, number][] = [];

  switch (geometry.type) {
    case "Polygon":
      coords = geometry.coordinates[0] || [];
      break;

    case "MultiPolygon":
      // Take the first polygon's outer ring
      coords = geometry.coordinates[0]?.[0] || [];
      break;

    case "Point":
      coords = [geometry.coordinates];
      break;

    case "LineString":
      coords = geometry.coordinates;
      break;

    case "MultiLineString":
      coords = geometry.coordinates[0] || [];
      break;

    case "MultiPoint":
      coords = geometry.coordinates;
      break;

    default:
      return [];
  }

  return coords.map(([lng, lat]) => ({
    latitude: lat,
    longitude: lng,
  }));
}

/**
 * Extract ALL polygons from an EWKB hex string as separate coordinate arrays.
 * Useful for MultiPolygon that contains multiple disconnected parts.
 */
export function ewkbToMultiLatLngArrays(
  hex: string,
): { latitude: number; longitude: number }[][] {
  const geometry = parseEwkbHex(hex);
  if (!geometry) return [];

  switch (geometry.type) {
    case "Polygon":
      return [
        (geometry.coordinates[0] || []).map(
          ([lng, lat]: [number, number]) => ({
            latitude: lat,
            longitude: lng,
          }),
        ),
      ];

    case "MultiPolygon":
      return geometry.coordinates.map(
        (polygon: [number, number][][]) =>
          (polygon[0] || []).map(([lng, lat]: [number, number]) => ({
            latitude: lat,
            longitude: lng,
          })),
      );

    default:
      return [];
  }
}

/**
 * Calculate a bounding box region from an array of lat/lng coordinates.
 * Returns a region suitable for react-native-maps animateToRegion.
 */
export function getBoundsFromCoords(
  coordinates: { latitude: number; longitude: number }[],
  padding: number = 1.3,
): {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} | null {
  if (!coordinates || coordinates.length === 0) return null;

  let minLat = coordinates[0].latitude;
  let maxLat = coordinates[0].latitude;
  let minLng = coordinates[0].longitude;
  let maxLng = coordinates[0].longitude;

  for (const coord of coordinates) {
    if (coord.latitude < minLat) minLat = coord.latitude;
    if (coord.latitude > maxLat) maxLat = coord.latitude;
    if (coord.longitude < minLng) minLng = coord.longitude;
    if (coord.longitude > maxLng) maxLng = coord.longitude;
  }

  const latDelta = (maxLat - minLat) * padding;
  const lngDelta = (maxLng - minLng) * padding;

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(latDelta, 0.002), // minimum zoom level
    longitudeDelta: Math.max(lngDelta, 0.002),
  };
}

/**
 * Thuật toán Ray-casting (Point in Polygon)
 * Kiểm tra xem một điểm có nằm trong đa giác hay không.
 */
export function pointInPolygon(
  point: { latitude: number; longitude: number },
  polygon: { latitude: number; longitude: number }[]
): boolean {
  let isInside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].longitude,
      yi = polygon[i].latitude;
    const xj = polygon[j].longitude,
      yj = polygon[j].latitude;

    const intersect =
      yi > point.latitude !== yj > point.latitude &&
      point.longitude < ((xj - xi) * (point.latitude - yi)) / (yj - yi) + xi;
    if (intersect) isInside = !isInside;
  }
  return isInside;
}

/**
 * Hàm kiểm tra nhanh tọa độ với chuỗi EWKB Geometry
 * Giải mã nhanh sau đó áp dụng Point-in-Polygon.
 * Sẽ kết thúc sớm (early exit) ngay khi phát hiện point nằm trong bất kỳ polygon nào (với kiểu dữ liệu MultiPolygon).
 */
export function isPointInAdminArea(
  point: { latitude: number; longitude: number },
  ewkbHex: string
): boolean {
  if (!hexIsNotEmpty(ewkbHex)) return false;
  
  const multiPolygons = ewkbToMultiLatLngArrays(ewkbHex);
  for (const polygon of multiPolygons) {
    if (pointInPolygon(point, polygon)) {
      return true;
    }
  }
  return false;
}

// Cố gắng tối ưu logic kiểm tra empty bằng cách kiểm tra sơ
function hexIsNotEmpty(str: string): boolean {
  return str && str.trim().length > 0;
}
