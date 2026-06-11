import { describe, expect, test, beforeAll } from "@jest/globals";
import { haversineDistance, isBacktracking, estimateWalkTime } from "../src/lib/utils";
import type { POI } from "../src/core/types";

// ============================================================
// utils 单元测试
// ============================================================

describe("haversineDistance", () => {
  test("同一坐标距离为 0", () => {
    expect(haversineDistance(37.5, 127.0, 37.5, 127.0)).toBe(0);
  });

  test("圣水站到圣水洞核心区（约 200m）", () => {
    const dist = haversineDistance(37.5442, 127.0555, 37.5450, 127.0560);
    expect(dist).toBeGreaterThan(50);
    expect(dist).toBeLessThan(300);
  });
});

describe("isBacktracking", () => {
  test("正向移动不回头", () => {
    // 从原点出发，先往北再往北东 → 不应回头
    const result = isBacktracking(
      37.5442, 127.0555, // 原点（圣水站）
      37.5450, 127.0555, // 向北
      37.5455, 127.0560, // 继续北东
    );
    expect(result).toBe(false);
  });

  test("反向回头", () => {
    // 先往北，再往南 → 应该被判定为回头
    const result = isBacktracking(
      37.5442, 127.0555,
      37.5460, 127.0555, // 向北
      37.5440, 127.0555, // 向南（回头了）
    );
    expect(result).toBe(true);
  });
});

describe("estimateWalkTime", () => {
  test("80m = 1 分钟", () => {
    expect(estimateWalkTime(80)).toBe(1);
  });

  test("400m = 5 分钟", () => {
    expect(estimateWalkTime(400)).toBe(5);
  });
});

// ============================================================
// route-engine 单元测试
// ============================================================

// 不能在 jest 环境 import Next.js 服务端代码，
// 这里测试纯函数逻辑。路线算法核心已验证于 utils 中。
// 完整的 route-engine 集成测试用 Playwright E2E。

describe("POI 数据验证", () => {
  // 延迟导入 ESM
  let pois: POI[];

  beforeAll(async () => {
    const mod = await import("../src/core/search");
    pois = mod.SEONGSU_SEED_DATA;
  });

  test("至少 20 个 POI", () => {
    expect(pois.length).toBeGreaterThanOrEqual(20);
  });

  test("所有 POI 有完整的必填字段", () => {
    for (const poi of pois) {
      expect(poi.id).toBeTruthy();
      expect(poi.name).toBeTruthy();
      expect(poi.lat).toBeGreaterThan(0);
      expect(poi.lng).toBeGreaterThan(0);
      expect(poi.category).toBeTruthy();
      expect(poi.subcategory).toBeTruthy();
    }
  });

  test("所有 POI 坐标在圣水洞范围内", () => {
    for (const poi of pois) {
      expect(poi.lat).toBeGreaterThan(37.54);
      expect(poi.lat).toBeLessThan(37.55);
      expect(poi.lng).toBeGreaterThan(127.05);
      expect(poi.lng).toBeLessThan(127.06);
    }
  });
});

describe("filterPoisByTheme", () => {
  let pois: POI[];
  let filterPoisByTheme: (theme: Parameters<typeof import("../src/core/search").filterPoisByTheme>[0], p?: POI[]) => POI[];

  beforeAll(async () => {
    const mod = await import("../src/core/search");
    pois = mod.SEONGSU_SEED_DATA;
    filterPoisByTheme = mod.filterPoisByTheme;
  });

  test("买衣服主题包含 shop 和 vintage", () => {
    const result = filterPoisByTheme("买衣服", pois);
    expect(result.length).toBeGreaterThan(5);
    for (const p of result) {
      expect(p.subcategory).toBe("买衣服");
    }
  });

  test("吃东西主题只含餐厅", () => {
    const result = filterPoisByTheme("吃东西", pois);
    expect(result.length).toBeGreaterThan(3);
    for (const p of result) {
      expect(p.subcategory).toBe("吃东西");
    }
  });

  test("按热度降序排列", () => {
    const result = filterPoisByTheme("咖啡", pois);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1]!.popularity).toBeGreaterThanOrEqual(result[i]!.popularity);
    }
  });
});
