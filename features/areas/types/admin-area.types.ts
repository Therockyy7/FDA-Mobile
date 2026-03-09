export interface AdminArea {
  id: string;
  name: string;
  level: "city" | "district" | "ward";
  parentId: string | null;
  code: string;
  geometry: string; // JSON string of GeoJSON
}

export interface AdminAreaResponse {
  success: boolean;
  message: string;
  statusCode: number;
  administrativeAreas: AdminArea[];
  totalCount: number;
}

export interface AdminAreaParams {
  searchTerm?: string;
  level?: string;
  parentId?: string;
  pageNumber?: number;
  pageSize?: number;
}
