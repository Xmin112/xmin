/** 计算两点间 Haversine 距离（米） */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000; // 地球半径（米）
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/** 估算步行时间（分钟），按 80m/分钟 */
export function estimateWalkTime(distanceMeters: number): number {
  return Math.ceil(distanceMeters / 80);
}

/** 判断方向是否回头：两点相对原点的角度偏差 > 90° */
export function isBacktracking(
  originLat: number,
  originLng: number,
  prevLat: number,
  prevLng: number,
  currLat: number,
  currLng: number,
): boolean {
  const distPrev = haversineDistance(originLat, originLng, prevLat, prevLng);
  const distCurr = haversineDistance(originLat, originLng, currLat, currLng);

  if (distPrev === 0) return false;

  const dxPrev = prevLng - originLng;
  const dyPrev = prevLat - originLat;
  const dxCurr = currLng - originLng;
  const dyCurr = currLat - originLat;

  // 点积 < 0 意味着方向矢量夹角 > 90°
  const dotProduct = dxPrev * dxCurr + dyPrev * dyCurr;
  return dotProduct < 0;
}
