/** POI 类别 */
export type POICategory =
  | "cafe"
  | "restaurant"
  | "shop"
  | "vintage"
  | "landmark"
  | "culture";

/** 路线主题 */
export type RouteTheme =
  | "买衣服"
  | "吃东西"
  | "探店"
  | "咖啡"
  | "文化"
  | "综合";

/** 兴趣点 */
export interface POI {
  id: string;
  name: string;
  nameKo: string;
  category: POICategory;
  subcategory: string;
  lat: number;
  lng: number;
  address: string;
  subwayExit: string;
  walkingMinutes: number;
  popularity: number;
  description: string;
}

/** 路线停靠点 */
export interface RouteStop {
  poi: POI;
  position: number;           // 第几个停靠
  walkFromPrevMin: number;    // 从上一点步行时间
  transitFromStation: string; // "圣水站 4号口 → 步行2分钟"
}

/** 完整路线 */
export interface RoutePlan {
  title: string;
  district: string;
  theme: RouteTheme;
  stops: RouteStop[];
  totalDurationMin: number;
  totalWalkMin: number;
  narrative: string;
}

/** API 请求 */
export interface PlanRequest {
  district: string;
  theme: RouteTheme;
  days?: number;
  picks?: string[];
}

/** API 响应 */
export interface PlanResponse {
  success: boolean;
  route?: RoutePlan;
  error?: string;
}
