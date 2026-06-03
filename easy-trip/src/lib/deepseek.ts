/**
 * DeepSeek API 封装
 *
 * API 兼容 OpenAI 格式
 * 文档：https://api-docs.deepseek.com/
 */

const DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";
const DEEPSEEK_MODEL = "deepseek-v4-pro";

interface ChatParams {
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  stream?: boolean;
}

interface ChatResult {
  content: string;
}

/** 调用 DeepSeek 聊天（非流式） */
export async function deepseekChat(params: ChatParams): Promise<ChatResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY 环境变量未设置");
  }

  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: params.messages,
      stream: false,
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API 错误 ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content: string = data.choices?.[0]?.message?.content ?? "";

  return { content };
}

/** AI 返回的 route JSON 结构 */
export interface RouteJson {
  stage: "greeting" | "asking" | "searching" | "done";
  route?: {
    dayLabel?: string;
    metroStart?: {
      name: string;
      stationName: string;
      exitNumber: string;
      lat: number;
      lng: number;
    };
    stops?: Array<{
      place: {
        name: string;
        lat: number;
        lng: number;
        category: string;
        intro: string;
        address?: string;
        source: string;
      };
    }>;
  };
}

/** 从 AI 回复中提取 route JSON */
export function extractRouteJson(content: string): RouteJson | null {
  const match = content.match(/```route-json\s*([\s\S]*?)```/);
  if (!match?.[1]) return null;

  try {
    return JSON.parse(match[1].trim()) as RouteJson;
  } catch {
    console.error("解析 route-json 失败");
    return null;
  }
}
