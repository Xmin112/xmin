/**
 * 星界分析协议 — Gemini API 客户端
 *
 * FBC 使用 Gemini AI 对回收的阈域实体进行跨维度解读。
 * 输出格式遵循 FBC 档案标准：[[段落]] 风格 + 董事会批示。
 *
 * API Key: import.meta.env.VITE_GEMINI_API_KEY
 * 未配置时自动回退到内置实体摘要。
 */

const API_BASE =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

/**
 * 构建 FBC 风格的解读 prompt
 */
function buildPrompt(entity, orientation) {
  const formLabel = orientation === 'stable' ? '稳定形态' : '衰减形态'
  const formDesc  = orientation === 'stable' ? entity.stableForm : entity.decayedForm

  return `你是 FBC（联邦控制局）星界分析部门的首席研究员。你对一个回收的阈域实体进行档案解读。

[[实体档案]]
编号: ${entity.designation}
代号: ${entity.codename}
安全等级: ${entity.classification}
当前形态: ${formLabel}
形态描述: ${formDesc}
属性标签: ${entity.tags.join(' / ')}
研究摘要: ${entity.summary}

[[任务]]
请以 FBC 首席研究员的身份，用以下格式输出解读：

1. 一个诗意的、神秘的但专业的第一段落，描述该实体在当前形态下的"场域效应"（2-3 句）
2. 一个简短的[[董事会批示]]段落，以董事会全大写方括号风格给出关键洞察（1-2 句）
3. 一个"接触建议"段落，为接触者提供实用指导（1-2 句）

输出格式：纯 JSON
{
  "fieldEffect": "...",
  "boardDirective": "...",
  "contactProtocol": "..."
}

风格要求：
- 使用政府机构档案语言，但保留神秘感
- 避免陈词滥调和过于文艺的表达
- 董事会批示使用全大写，方括号内`
}

/**
 * 调用 Gemini API
 * @param {import('../data/entities').Entity} entity
 * @param {'stable' | 'decayed'} orientation
 * @returns {Promise<{fieldEffect: string, boardDirective: string, contactProtocol: string}>}
 */
export async function analyzeEntity(entity, orientation) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  // 无 API Key：使用内置摘要
  if (!apiKey) {
    return buildFallback(entity, orientation)
  }

  try {
    const prompt = buildPrompt(entity, orientation)

    const response = await fetch(`${API_BASE}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Gemini API: ${response.status}`)
    }

    const data = await response.json()
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!rawText) {
      throw new Error('Gemini 返回空响应')
    }

    // 尝试从响应中提取 JSON
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        fieldEffect:      parsed.fieldEffect      || entity.summary,
        boardDirective:   parsed.boardDirective   || '[[数据不足]]',
        contactProtocol:  parsed.contactProtocol  || entity.stableForm,
      }
    }

    // JSON 解析失败，使用原始文本
    return {
      fieldEffect:      rawText.slice(0, 300),
      boardDirective:   '[[非标格式/手动审核]]',
      contactProtocol:  '参见原始档案。',
    }
  } catch (err) {
    console.warn('[FBC::ASTRAL] Gemini 调用失败，回退到内置档案:', err.message)
    return buildFallback(entity, orientation)
  }
}

/**
 * 回退方案 — 使用实体内置档案
 */
function buildFallback(entity, orientation) {
  const formDesc = orientation === 'stable' ? entity.stableForm : entity.decayedForm
  const formLabel = orientation === 'stable' ? '稳定形态' : '衰减形态'

  return {
    fieldEffect: entity.summary,
    boardDirective: orientation === 'stable'
      ? `[[${entity.codename}/稳定/批准接触]]`
      : `[[${entity.codename}/衰减/谨慎评估]]`,
    contactProtocol: `[${formLabel}] ${formDesc}`,
  }
}
