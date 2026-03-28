import { FloodRoute, FloodZone } from "../constants/map-data";

export function getZoneCenter(zone: FloodZone) {
  const latSum = zone.coordinates.reduce((sum, c) => sum + c.latitude, 0);
  const lngSum = zone.coordinates.reduce((sum, c) => sum + c.longitude, 0);
  return {
    latitude: latSum / zone.coordinates.length,
    longitude: lngSum / zone.coordinates.length,
  };
}

export function getRouteMidPoint(route: FloodRoute) {
  const midIndex = Math.floor(route.coordinates.length / 2);
  return route.coordinates[midIndex];
}
