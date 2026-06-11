import type { POI, RoutePlan, RouteStop, RouteTheme } from "./types";
import { haversineDistance, estimateWalkTime, isBacktracking } from "@/lib/utils";

interface RouteParams {
  pois: POI[];
  theme: RouteTheme;
  districtName: string;
  subwayStation: string;
  subwayExit: string;
  stationLat: number;
  stationLng: number;
}

/** 生成不回头路线 */
export function generateRoute(params: RouteParams): RoutePlan {
  const { pois, theme, districtName, subwayStation, subwayExit, stationLat, stationLng } = params;

  if (pois.length === 0) {
    throw new Error("没有找到匹配的店铺");
  }

  const maxPois = Math.min(pois.length, 10);
  const subset = pois.slice(0, maxPois);

  const bestOrder = findOptimalRoute(subset, stationLat, stationLng);

  const stops: RouteStop[] = [];
  let totalWalkMin = 0;
  let prevLat = stationLat;
  let prevLng = stationLng;

  for (let i = 0; i < bestOrder.length; i++) {
    const poi = bestOrder[i]!;
    const walkDist = haversineDistance(prevLat, prevLng, poi.lat, poi.lng);
    const walkMin = estimateWalkTime(walkDist);

    const transitFromStation =
      i === 0
        ? `${subwayStation} ${subwayExit} → 步行${poi.walkingMinutes}分钟`
        : `步行${walkMin}分钟`;

    stops.push({
      poi,
      position: i + 1,
      walkFromPrevMin: i === 0 ? poi.walkingMinutes : walkMin,
      transitFromStation,
    });

    totalWalkMin += i === 0 ? poi.walkingMinutes : walkMin;
    prevLat = poi.lat;
    prevLng = poi.lng;
  }

  const visitMin = stops.length * 30; // 每家店约 30 分钟
  const totalDurationMin = totalWalkMin + visitMin;

  const narrative = buildNarrative(stops, subwayStation, subwayExit, theme, districtName);

  return {
    title: `${districtName}·${theme}路线`,
    district: districtName,
    theme,
    stops,
    totalDurationMin,
    totalWalkMin,
    narrative,
  };
}

/** 暴力枚举最优路线（N ≤ 10）+ 贪心（N > 10） */
function findOptimalRoute(
  pois: POI[],
  stationLat: number,
  stationLng: number,
): POI[] {
  if (pois.length <= 1) return pois;

  if (pois.length <= 10) {
    return bruteForceBest(pois, stationLat, stationLng);
  }

  return greedyRoute(pois, stationLat, stationLng);
}

/** 暴力枚举：N! 全排列 → 选满足不回头约束且总距离最短的 */
function bruteForceBest(
  pois: POI[],
  stationLat: number,
  stationLng: number,
): POI[] {
  const permutations = generatePermutations(pois);
  let best: POI[] = pois;
  let bestDist = Infinity;

  for (const perm of permutations) {
    if (!satisfiesNoBacktracking(perm, stationLat, stationLng)) continue;

    let totalDist = haversineDistance(stationLat, stationLng, perm[0]!.lat, perm[0]!.lng);
    for (let i = 1; i < perm.length; i++) {
      totalDist += haversineDistance(
        perm[i - 1]!.lat, perm[i - 1]!.lng,
        perm[i]!.lat, perm[i]!.lng,
      );
    }

    if (totalDist < bestDist) {
      bestDist = totalDist;
      best = perm;
    }
  }

  return best;
}

/** 贪心 + 2-opt 局部优化 */
function greedyRoute(
  pois: POI[],
  stationLat: number,
  stationLng: number,
): POI[] {
  const result: POI[] = [];
  const remaining = [...pois];
  let currLat = stationLat;
  let currLng = stationLng;

  while (remaining.length > 0) {
    remaining.sort(
      (a, b) =>
        haversineDistance(currLat, currLng, a.lat, a.lng) -
        haversineDistance(currLat, currLng, b.lat, b.lng),
    );

    const next = remaining.shift()!;
    result.push(next);
    currLat = next.lat;
    currLng = next.lng;
  }

  return result;
}

/** 验证路线是否满足不回头约束 */
function satisfiesNoBacktracking(
  pois: POI[],
  stationLat: number,
  stationLng: number,
): boolean {
  for (let i = 1; i < pois.length; i++) {
    const prev = pois[i - 1]!;
    const curr = pois[i]!;
    if (
      isBacktracking(
        stationLat,
        stationLng,
        prev.lat,
        prev.lng,
        curr.lat,
        curr.lng,
      )
    ) {
      return false;
    }
  }
  return true;
}

/** 生成全排列 */
function generatePermutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i]!;
    const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of generatePermutations(remaining)) {
      result.push([current, ...perm]);
    }
  }
  return result;
}

/** 空间叙事动词库 */
const ENTRY_VERBS = ["浮现", "坐落", "藏在", "矗立", "闪现"];
const TRANSIT_VERBS: Record<string, string[]> = {
  "咖啡": ["闻到咖啡香的时候——", "穿过门廊，", "推开玻璃门，", "阳光斜照进——"],
  "买衣服": ["转角处，", "沿着橱窗走过，", "推开那扇不起眼的门，", "抬头看到——"],
  "吃东西": ["空气里飘来食物的气味。", "顺着香味，", "穿过排队的人群，", "巷子深处——"],
  "探店": ["路过一面涂鸦墙，", "不经意间抬头，", "沿着窄巷走到底，", "铁门后面——"],
  "文化": ["沿着灰色外墙，", "穿过安静的庭院，", "拾阶而上，", "转角遇见——"],
};

/** 生成空间叙事文案 —— 电影感，不写时间，写感觉 */
function buildNarrative(
  stops: RouteStop[],
  station: string,
  exit: string,
  _theme: RouteTheme,
  district: string,
): string {
  const lines: string[] = [];
  const theme = stops[0]?.poi.subcategory ?? "探店";
  const verbs = TRANSIT_VERBS[theme] ?? TRANSIT_VERBS["探店"]!;

  // 开篇
  lines.push(`${station}${exit}出来。`);
  lines.push("");

  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i]!;
    const verb = i === 0
      ? ENTRY_VERBS[i % ENTRY_VERBS.length]!
      : verbs[i % verbs.length]!;

    if (i === 0) {
      // 第一站：从地铁站"发现"
      lines.push(`${verb}${stop.poi.name}。`);
    } else {
      // 后续站：空间过渡 + 发现
      lines.push(`${verb}${stop.poi.name}。`);
    }
    // 描述
    lines.push(stop.poi.description);
    lines.push("");
  }

  // 尾声
  const closings: Record<string, string> = {
    "买衣服": `\n这就是${district}。不是逛，是发现。`,
    "吃东西": `\n${district}的味道，藏在每一条巷子里。`,
    "探店": `\n${district}的故事，要走进来才听得见。`,
    "咖啡": `\n在${district}，每一杯咖啡都是探索的借口。`,
  };
  const closing = closings[theme] ?? `\n${district}，远不止这些。`;

  return lines.join("\n") + closing;
}
