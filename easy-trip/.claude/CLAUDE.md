# Easy Trip 项目配置

## 技术栈
Next.js 16 + TypeScript + Tailwind CSS 4 + DeepSeek V4 API

## 启动
```bash
cp .env.example .env.local
# 编辑 .env.local，填入 DEEPSEEK_API_KEY
npm run dev
```

## 项目结构
- `src/components/chat/` — 聊天界面组件
- `src/components/map/` — 地图渲染组件
- `src/components/share/` — 分享卡片组件
- `src/components/ui/` — 通用 UI 组件
- `src/lib/` — 工具库（AI 调用、路线优化、地理计算）
- `src/types/` — TypeScript 类型定义
- `src/app/api/` — API 路由

## 开发规范
- TDD：先写测试再写实现
- 禁止 `any` 类型
- 变量/函数名英文，注释中文
- commit message 用中文

## 环境变量
| 变量 | 说明 |
|---|---|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 |
