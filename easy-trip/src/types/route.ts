import type { Place, RouteStop, MetroExit, Route } from "./place";

/** 路线排序请求 */
export interface RouteOptimizeRequest {
  places: Place[];
  metroExits?: MetroExit[];
}

/** 路线排序结果 */
export interface RouteOptimizeResponse {
  stops: RouteStop[];
  metroStart: MetroExit;
  totalWalkMeters: number;
  totalWalkMinutes: number;
}

/** 地图坐标 */
export interface GeoPoint {
  lat: number;
  lng: number;
}

/** 地图上的一条线 */
export interface MapLine {
  points: GeoPoint[];
  color: string;
  width: number;
  dashed?: boolean;
}
