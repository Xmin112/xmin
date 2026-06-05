/**
 * 实体协议 — 洗牌、逆位判定、实体选取
 *
 * 纯函数，无副作用。
 */

/**
 * Fisher-Yates 洗牌
 * @template T
 * @param {T[]} array
 * @returns {T[]} 新数组
 */
export function shuffleDeck(array) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * 确定实体形态方向
 * 30% 概率为衰减形态（逆位），70% 为稳定形态（正位）
 * @returns {'stable' | 'decayed'}
 */
export function determineOrientation() {
  return Math.random() < 0.3 ? 'decayed' : 'stable'
}

/**
 * 选取一张随机实体
 * @param {import('../data/entities').Entity[]} deck
 * @returns {{ entity: import('../data/entities').Entity, index: number }}
 */
export function pickRandom(deck) {
  const index = Math.floor(Math.random() * deck.length)
  return { entity: deck[index], index }
}

/**
 * 根据索引选取实体
 * @param {import('../data/entities').Entity[]} deck
 * @param {number} index
 * @returns {import('../data/entities').Entity}
 */
export function pickByIndex(deck, index) {
  return deck[index % deck.length]
}
