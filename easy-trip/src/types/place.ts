/** 地点分类 */
export type PlaceCategory =
  | "beauty"      // 化妆品/护肤
  | "fashion"     // 服饰/设计师店
  | "cafe"        // 咖啡/甜品
  | "food"        // 餐厅/美食
  | "art"         // 展览/艺术馆
  | "shopping"    // 综合购物
  | "culture"     // 文化/历史景点
  | "other";      // 其他

/** AI 搜索返回的地点 */
export interface Place {
  name: string;
  lat: number;
  lng: number;
  category: PlaceCategory;
  intro: string;        // 一句话介绍
  source: "search" | "user";  // 来源：搜索到的 / 用户指定的
  address?: string;
}

/** 路线中的一个节点（排好序的地点） */
export interface RouteStop {
  order: number;
  place: Place;
  walkFromPrevMin?: number;   // 从上一站步行时间（分钟）
  walkFromPrevMeters?: number; // 从上一站步行距离（米）
  note?: string;               // 这一站的备注（如"从3号口出来"）
}

/** 地铁站出口 */
export interface MetroExit {
  name: string;         // 如"圣水站 3号出口"
  lat: number;
  lng: number;
  stationName: string;   // 如"圣水站"
  exitNumber: string;    // 如"3"
}

/** 一条完整的路线 */
export interface Route {
  dayLabel: string;          // "Day 1" 或 "圣水洞半日游"
  metroStart: MetroExit;     // 推荐出发地铁口
  stops: RouteStop[];
  totalWalkMeters: number;
  totalWalkMinutes: number;
}

/** 多日行程 */
export interface TripPlan {
  destination: string;       // "首尔"
  days: Route[];
}
