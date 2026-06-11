import { NextResponse } from "next/server";
import type { PlanRequest, PlanResponse } from "@/core/types";
import { filterPoisByTheme, findPoiByName } from "@/core/search";
import { generateRoute } from "@/core/route-engine";
import { getStationInfo, getStationCoords } from "@/core/transit";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PlanRequest;

    if (!body.district || !body.theme) {
      return NextResponse.json(
        { success: false, error: "请填写地点和路线主题" } satisfies PlanResponse,
        { status: 400 },
      );
    }

    const station = getStationInfo(body.district);
    const coords = getStationCoords(body.district);

    if (!station || !coords) {
      return NextResponse.json(
        { success: false, error: `暂不支持该区域: ${body.district}` } satisfies PlanResponse,
        { status: 400 },
      );
    }

    // 筛选 POI
    let pois = filterPoisByTheme(body.theme);

    // 用户指定了想去的店
    if (body.picks && body.picks.length > 0) {
      const pickedPois = body.picks
        .map((name) => findPoiByName(name, pois))
        .filter(Boolean);
      if (pickedPois.length > 0) {
        pois = pickedPois as typeof pois;
      }
    }

    if (pois.length === 0) {
      return NextResponse.json(
        { success: false, error: `没有找到匹配「${body.theme}」的店铺` } satisfies PlanResponse,
        { status: 404 },
      );
    }

    // 多日路线：简单复制（V0.1 简化版，V0.3 做真正的多日）
    const days = body.days ?? 1;
    const perDay = Math.ceil(pois.length / days);

    // 取第一天的 POI（V0.1 只输出单天路线，多天后续迭代）
    const dayPois = pois.slice(0, Math.min(perDay, 10));

    const route = generateRoute({
      pois: dayPois,
      theme: body.theme,
      districtName: getDistrictName(body.district),
      subwayStation: station.stationName,
      subwayExit: station.exitNumber,
      stationLat: coords.lat,
      stationLng: coords.lng,
    });

    return NextResponse.json({ success: true, route } satisfies PlanResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "路线生成失败";
    return NextResponse.json(
      { success: false, error: message } satisfies PlanResponse,
      { status: 500 },
    );
  }
}

function getDistrictName(slug: string): string {
  const names: Record<string, string> = {
    seongsu: "圣水洞",
  };
  return names[slug] ?? slug;
}
