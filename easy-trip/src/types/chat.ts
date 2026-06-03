import type { Place, Route, TripPlan } from "./place";

/** 对话阶段 */
export type ChatStage = "greeting" | "asking" | "searching" | "planning" | "done";

/** 消息角色 */
export type MessageRole = "user" | "assistant";

/** 单条消息 */
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  options?: ChatOption[];     // AI 提供的选项卡片
  route?: Route;              // 路线结果
  tripPlan?: TripPlan;        // 多日行程结果
  timestamp: number;
}

/** 选项卡片 */
export interface ChatOption {
  id: string;
  label: string;
  emoji: string;
  description?: string;
}

/** AI API 返回结构 */
export interface ChatResponse {
  reply: string;
  options?: ChatOption[];
  places?: Place[];
  stage: ChatStage;
  route?: Route;
  tripPlan?: TripPlan;
}
