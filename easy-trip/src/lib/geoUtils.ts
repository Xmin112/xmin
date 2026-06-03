import type { GeoPoint } from "@/types/route";

const EARTH_RADIUS_M = 6_371_000;

/** 用 Haversine 公式算两点间的球面距离（米） */
export function haversineDistance(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(x));
}

/** 估算步行时间（分钟），按 80m/分钟 */
export function estimateWalkMinutes(meters: number): number {
  return Math.round(meters / 80);
}

/** 构建距离矩阵 */
export function buildDistanceMatrix(points: GeoPoint[]): number[][] {
  const n = points.length;
  const matrix: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = haversineDistance(points[i], points[j]);
      matrix[i][j] = d;
      matrix[j][i] = d;
    }
  }

  return matrix;
}

/** 获取离给定点最近的地铁出口 */
export function findNearestMetroExit(
  point: GeoPoint,
  exits: GeoPoint[]
): { exitIndex: number; distance: number } {
  let minDist = Infinity;
  let minIndex = -1;

  for (let i = 0; i < exits.length; i++) {
    const d = haversineDistance(point, exits[i]);
    if (d < minDist) {
      minDist = d;
      minIndex = i;
    }
  }

  return { exitIndex: minIndex, distance: minDist };
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
