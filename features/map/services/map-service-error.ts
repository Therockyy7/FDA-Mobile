// features/map/services/map-service-error.ts
// Typed error class for all map service failures

export class MapServiceError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "MapServiceError";
  }
}
