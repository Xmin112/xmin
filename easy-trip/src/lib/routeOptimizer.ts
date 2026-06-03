import type { Place, MetroExit, RouteStop } from "@/types/place";
import type { GeoPoint, RouteOptimizeResponse } from "@/types/route";
import { haversineDistance, estimateWalkMinutes, buildDistanceMatrix } from "./geoUtils";

interface OptimizeInput {
  places: Place[];
  metroExits?: MetroExit[];
  startExit?: MetroExit;
}

/**
 * 路线排序引擎
 *
 * 算法思路：
 * 1. 贪心最近邻构造初始路径（从地铁口出发，每次去最近的未访问点）
 * 2. 2-opt 局部交换优化（消除交叉路径，实现"不走回头路"）
 *
 * 复杂度：n ≤ 10 时毫秒级完成，满足实时对话需求
 */
export function optimizeRoute(input: OptimizeInput): RouteOptimizeResponse {
  const { places } = input;

  if (places.length === 0) {
    throw new Error("至少需要一个地点");
  }

  // 如果只有 1-2 个点，直接用最近邻，不需要 2-opt
  const points: GeoPoint[] = places.map((p) => ({ lat: p.lat, lng: p.lng }));

  // 确定起点：最近的地铁出口
  const startPoint = input.startExit
    ? { lat: input.startExit.lat, lng: input.startExit.lng }
    : points[0]; // 没有地铁数据时从第一个地点开始

  // Step 1: 贪心最近邻
  const order = nearestNeighbor(points, startPoint);

  // Step 2: 2-opt 优化（3 个点以上才有意义）
  const distMatrix = buildDistanceMatrix(points);
  const optimizedOrder = places.length >= 3 ? twoOpt(order, distMatrix) : order;

  // 构造结果
  const stops = buildStops(places, optimizedOrder, distMatrix, startPoint);

  const totalMeters = stops.reduce((sum, s) => sum + (s.walkFromPrevMeters ?? 0), 0);

  // 地铁出口：优先用输入的
  const metroStart: MetroExit = input.startExit ?? {
    name: "出发点",
    lat: startPoint.lat,
    lng: startPoint.lng,
    stationName: "",
    exitNumber: "",
  };

  return {
    stops,
    metroStart,
    totalWalkMeters: Math.round(totalMeters),
    totalWalkMinutes: estimateWalkMinutes(totalMeters),
  };
}

/** 贪心最近邻：从 start 出发，每次找最近的未访问点 */
function nearestNeighbor(points: GeoPoint[], start: GeoPoint): number[] {
  const n = points.length;
  const visited = new Array<boolean>(n).fill(false);
  const order: number[] = [];

  let current = start;

  for (let _ = 0; _ < n; _++) {
    let bestIdx = -1;
    let bestDist = Infinity;

    for (let i = 0; i < n; i++) {
      if (visited[i]) continue;
      const d = haversineDistance(current, points[i]);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }

    if (bestIdx === -1) break;

    visited[bestIdx] = true;
    order.push(bestIdx);
    current = points[bestIdx];
  }

  return order;
}

/** 2-opt 局部搜索：翻转子路径消除交叉 */
function twoOpt(order: number[], distMatrix: number[][]): number[] {
  const n = order.length;
  let improved = true;
  const current = [...order];

  while (improved) {
    improved = false;

    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 2; j < n; j++) {
        // 检查交换后是否更短
        const oldEdge1 = distMatrix[current[i]][current[i + 1]];
        const oldEdge2 = distMatrix[current[j]][current[(j + 1) % n]];
        const newEdge1 = distMatrix[current[i]][current[j]];
        const newEdge2 = distMatrix[current[i + 1]][current[(j + 1) % n]];

        if (newEdge1 + newEdge2 < oldEdge1 + oldEdge2) {
          // 翻转 i+1 到 j 之间的路径
          reverseSegment(current, i + 1, j);
          improved = true;
        }
      }
    }
  }

  return current;
}

/** 翻转数组片段 */
function reverseSegment(arr: number[], start: number, end: number): void {
  while (start < end) {
    [arr[start], arr[end]] = [arr[end], arr[start]];
    start++;
    end--;
  }
}

/** 构造 RouteStop 列表 */
function buildStops(
  places: Place[],
  order: number[],
  distMatrix: number[][],
  startPoint: GeoPoint
): RouteStop[] {
  const stops: RouteStop[] = [];

  for (let i = 0; i < order.length; i++) {
    const idx = order[i];
    const place = places[idx];

    let walkFromPrevMeters: number | undefined;
    let walkFromPrevMin: number | undefined;

    if (i === 0) {
      // 第一站：从起点（地铁口）出发
      const d = haversineDistance(startPoint, { lat: place.lat, lng: place.lng });
      walkFromPrevMeters = Math.round(d);
      walkFromPrevMin = estimateWalkMinutes(d);
    } else {
      const prevIdx = order[i - 1];
      const d = distMatrix[prevIdx][idx];
      walkFromPrevMeters = Math.round(d);
      walkFromPrevMin = estimateWalkMinutes(d);
    }

    stops.push({
      order: i + 1,
      place,
      walkFromPrevMeters,
      walkFromPrevMin,
      note: i === 0 ? "从这里出发" : undefined,
    });
  }

  return stops;
}
