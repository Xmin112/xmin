import { NextRequest } from "next/server";
import { deepseekChat, extractRouteJson } from "@/lib/deepseek";
import { buildMessages } from "@/lib/prompts";
import { optimizeRoute } from "@/lib/routeOptimizer";
import type { Place, Route } from "@/types/place";
import type { ChatResponse, ChatOption } from "@/types/chat";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawMessages = body.messages as { role: "user" | "assistant"; content: string }[];

    if (!rawMessages?.length) {
      return Response.json({ error: "messages 不能为空" }, { status: 400 });
    }

    // 调用 DeepSeek
    const messages = buildMessages(rawMessages);
    const { content } = await deepseekChat({ messages });

    // 尝试提取路线 JSON
    const routeData = extractRouteJson(content);

    const response: ChatResponse = {
      reply: cleanReply(content),
      stage: routeData?.stage ?? "done",
    };

    // 如果有路线数据，进行优化排序
    if (routeData?.stage === "done" && routeData.route) {
      const rawRoute = routeData.route;
      const places: Place[] =
        rawRoute.stops?.map((s) => ({
          name: s.place.name,
          lat: s.place.lat,
          lng: s.place.lng,
          category: normalizeCategory(s.place.category),
          intro: s.place.intro,
          address: s.place.address,
          source: normalizeSource(s.place.source),
        })) ?? [];

      if (places.length > 0) {
        try {
          const optimized = optimizeRoute({
            places,
            startExit: rawRoute.metroStart
              ? {
                  name: rawRoute.metroStart.name,
                  lat: rawRoute.metroStart.lat,
                  lng: rawRoute.metroStart.lng,
                  stationName: rawRoute.metroStart.stationName,
                  exitNumber: rawRoute.metroStart.exitNumber,
                }
              : undefined,
          });

          const route: Route = {
            dayLabel: rawRoute.dayLabel ?? "今日路线",
            metroStart: optimized.metroStart,
            stops: optimized.stops,
            totalWalkMeters: optimized.totalWalkMeters,
            totalWalkMinutes: optimized.totalWalkMinutes,
          };

          response.route = route;
        } catch {
          // 路线优化失败不影响回复
          console.error("路线优化失败，使用 AI 原始输出");
        }
      }
    }

    // 如果是 asking 阶段，提取选项
    if (routeData?.stage === "asking") {
      response.options = extractOptions(content);
    } else if (!routeData) {
      // AI 没输出 route-json，判断是还在聊还是已经输出路线
      response.options = extractOptions(content);
      if (response.options && response.options.length > 0) {
        response.stage = "asking";
      }
    }

    return Response.json(response);
  } catch (error) {
    console.error("Chat API 错误:", error);
    return Response.json(
      {
        reply: "抱歉，出了点问题 😢 可能是 API 暂时不可用，稍等再试试？",
        stage: "done",
      },
      { status: 200 } // 返回 200，前端正常显示错误消息
    );
  }
}

/** 清理 AI 回复（移除 route-json 块） */
function cleanReply(content: string): string {
  return content.replace(/```route-json[\s\S]*?```/g, "").trim();
}

/** 从 AI 回复中提取选项 */
function extractOptions(content: string): ChatOption[] | undefined {
  // 匹配模式：emoji + 文字（如 "💄 化妆品/护肤路线"）
  const lines = content.split("\n").filter((l) => l.trim());
  const options: ChatOption[] = [];

  for (const line of lines) {
    const match = line.match(/^([\u{1F300}-\u{1FAFF}✨📍🗺️💄👗☕🎨🛍️🍽️])\s*(.+)$/u);
    if (match) {
      options.push({
        id: `opt-${options.length}`,
        emoji: match[1],
        label: match[2].replace(/[\\*\-\d\.\s]+$/g, "").trim(),
      });
    }
  }

  // 限制最多 4 个选项
  return options.length >= 2 ? options.slice(0, 6) : undefined;
}

/** 归一化分类字段 */
function normalizeCategory(cat: string): Place["category"] {
  const map: Record<string, Place["category"]> = {
    beauty: "beauty",
    fashion: "fashion",
    cafe: "cafe",
    food: "food",
    art: "art",
    shopping: "shopping",
    culture: "culture",
  };
  return map[cat] ?? "other";
}

/** 归一化来源字段 */
function normalizeSource(src: string): Place["source"] {
  return src === "user" ? "user" : "search";
}
