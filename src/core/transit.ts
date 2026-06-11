import type { POI } from "./types";

interface TransitInfo {
  stationName: string;
  exitNumber: string;
  lineNumber: string;
  walkingMinutes: number;
}

/** 圣水站固定信息（V0.1 硬编码，后续接入 Kakao/Google API） */
const STATION_INFO: Record<string, TransitInfo> = {
  seongsu: {
    stationName: "圣水站",
    exitNumber: "4号口",
    lineNumber: "2号线",
    walkingMinutes: 2,
  },
};

/** 获取地铁指引文本 */
export function getTransitGuide(
  districtSlug: string,
  poi: POI,
): string {
  const station = STATION_INFO[districtSlug];
  if (!station) {
    return `步行${poi.walkingMinutes}分钟`;
  }

  return `${station.stationName} ${station.lineNumber} ${poi.subwayExit || station.exitNumber} → 步行${poi.walkingMinutes}分钟`;
}

/** 获取车站固定信息 */
export function getStationInfo(districtSlug: string): TransitInfo | undefined {
  return STATION_INFO[districtSlug];
}

/** 获取车站坐标 */
export function getStationCoords(districtSlug: string): { lat: number; lng: number } | undefined {
  const coords: Record<string, { lat: number; lng: number }> = {
    seongsu: { lat: 37.5442, lng: 127.0555 },
  };
  return coords[districtSlug];
}
