/**
 * FBC 阈域实体档案 — 22 个维度实体
 *
 * 每个实体代表塔罗大阿尔卡纳对应的超自然存在。
 * 命名风格: Control / SCP 基金会式的政府机构档案语言。
 *
 * @typedef {Object} Entity
 * @property {number}   id
 * @property {string}   designation  — FBC 实体编号 (e.g. "AE-00")
 * @property {string}   codename     — 行动代号
 * @property {string}   classification — 安全等级
 * @property {string}   emoji
 * @property {string[]} tags         — 属性标签
 * @property {string}   stableForm   — "正位" → 稳定形态描述
 * @property {string}   decayedForm  — "逆位" → 衰减形态描述
 * @property {string}   summary      — FBC 研究摘要
 */

export const entities = [
  {
    id: 0,
    designation: 'AE-00',
    codename: 'THE FOOL',
    classification: 'UNKNOWN',
    emoji: '🃏',
    tags: ['初始化', '阈域入口', '未分类'],
    stableForm:
      '实体呈现为一道敞开的阈域裂隙，散发出微弱白光。接触者报告产生强烈的探索冲动与无畏感。建议：允许受控接触，记录所有新发现。',
    decayedForm:
      '裂隙不稳定波动，红光溢出。接触者表现出鲁莽决策与危险好奇心。建议：立即建立隔离区，禁止未经批准的高危行为。',
    summary:
      'AE-00 是所有阈域实体的零号样本。FBC 首席研究员认为它并非独立的实体，而是一道"门"——通往其他 21 个实体所在维度的初始裂隙。每次档案查阅从它开始。',
  },
  {
    id: 1,
    designation: 'AE-01',
    codename: 'THE MAGICIAN',
    classification: 'UTILITY',
    emoji: '🎩',
    tags: ['现实操控', '物质转化', '意志投射'],
    stableForm:
      '实体表现为悬浮的四维几何体，周围环绕着四个旋转的能量符号。接触者获得将抽象概念转化为具体成果的能力。输出效率提升 300%。',
    decayedForm:
      '几何体不稳定旋转，符号错位。接触者表现出操控他人倾向，或以欺骗手段达成目的。物质转化能力可能用于非授权用途。',
    summary:
      'AE-01 掌握着物质与能量转化的基本法则。它教会我们——你有能力将任何原材料转化为成品。相信自己的技能，大胆创造。',
  },
  {
    id: 2,
    designation: 'AE-02',
    codename: 'THE HIGH PRIESTESS',
    classification: 'SENSITIVE',
    emoji: '🌙',
    tags: ['潜意识', '直觉', '隐藏知识'],
    stableForm:
      '实体静坐于黑白两柱之间的阈域。不直接传递信息，而是通过梦境与直觉影响接触者。所有重大决策前应查阅本档案。',
    decayedForm:
      '实体背对接触者，柱子暗淡。接触者忽视直觉信号，依赖表面信息做出错误判断。潜意识通道被阻断。',
    summary:
      'AE-02 守护着不通过理性逻辑获取的知识。她提醒你：答案不在外界，而在于倾听内心的声音。信任你的直觉。',
  },
  {
    id: 3,
    designation: 'AE-03',
    codename: 'THE EMPRESS',
    classification: 'BENIGN',
    emoji: '👑',
    tags: ['丰饶', '创造', '自然共鸣'],
    stableForm:
      '实体呈现为繁茂的有机几何结构，持续释放温和的金色孢子。周围环境自发产生植物生长加速现象。创造力指数显著上升。',
    decayedForm:
      '有机结构枯萎，孢子变为灰色粉尘。接触者过度依赖他人，或陷入创造性枯竭。自然共鸣频率紊乱。',
    summary:
      'AE-03 是大地之母的跨维度映射。它提醒我们：丰饶与创造是我们的自然状态。享受收获的时刻。',
  },
  {
    id: 4,
    designation: 'AE-04',
    codename: 'THE EMPEROR',
    classification: 'COMMAND',
    emoji: '🏛️',
    tags: ['权威', '结构', '秩序'],
    stableForm:
      '实体表现为宏伟的几何王座，发出稳定的低频振动。周围空间自动建立有序结构。接触者决策力与领导力显著增强。',
    decayedForm:
      '王座出现裂隙，振动频率混乱。接触者表现出专横行为，或试图过度控制环境。组织结构僵化。',
    summary:
      'AE-04 代表着秩序与规则的跨维度力量。它提醒你：清晰的结构和边界是前进的基础。用理性引导力量。',
  },
  {
    id: 5,
    designation: 'AE-05',
    codename: 'THE HIEROPHANT',
    classification: 'ARCHIVE',
    emoji: '⛪',
    tags: ['传统', '知识传承', '仪式'],
    stableForm:
      '实体以古老石碑群的形式存在，碑文自动翻译为接触者的母语。提供经过验证的知识体系与仪式指导。建议向有经验者请教。',
    decayedForm:
      '碑文模糊，翻译出现错误。接触者拒绝传统智慧，或盲目追随教条。知识传承链路断裂。',
    summary:
      'AE-05 是跨维度知识传承的媒介。它建议你寻找导师，回归被验证的传统中寻找答案。',
  },
  {
    id: 6,
    designation: 'AE-06',
    codename: 'THE LOVERS',
    classification: 'DUALITY',
    emoji: '💕',
    tags: ['二元选择', '和谐', '关系纽带'],
    stableForm:
      '实体表现为两个纠缠的光子晶体，以精确频率共振。接触者面对的重大选择将得到清晰的直觉指引。关系和谐度提升。',
    decayedForm:
      '光子晶体的纠缠频率失谐，产生相位噪声。接触者面临价值观冲突，或做出违背内心的重要选择。',
    summary:
      'AE-06 不仅关乎关系纽带，更关乎内心的价值观抉择。它提醒你：遵从内心做出选择。',
  },
  {
    id: 7,
    designation: 'AE-07',
    codename: 'THE CHARIOT',
    classification: 'MOBILITY',
    emoji: '🏇',
    tags: ['意志力', '方向控制', '胜利'],
    stableForm:
      '实体呈现为两匹相反方向的力场牵引着一具几何核心。接触者获得驾驭对立力量的意志力。前进动能显著。',
    decayedForm:
      '力场失衡，核心偏离轨道。接触者方向失控，或缺乏前进的动力。项目停滞不前。',
    summary:
      'AE-07 驾驭着黑白两股力量的战车。它告诉我们：用意志力驾驭对立，胜利就在前方。',
  },
  {
    id: 8,
    designation: 'AE-08',
    codename: 'STRENGTH',
    classification: 'INTERNAL',
    emoji: '🦁',
    tags: ['内在力量', '耐心', '勇气'],
    stableForm:
      '实体表现为一个平静的人类轮廓与一个巨大的能量野兽共存，无任何暴力迹象。接触者获得温柔而坚定的内在力量。',
    decayedForm:
      '人类轮廓缩小，野兽能量失控。接触者自我怀疑，或试图用暴力压制外部问题。内在力量流失。',
    summary:
      'AE-08 展现的是温柔中的坚定——真正的力量不是暴力压制，而是耐心与勇气。',
  },
  {
    id: 9,
    designation: 'AE-09',
    codename: 'THE HERMIT',
    classification: 'ISOLATED',
    emoji: '🏔️',
    tags: ['内省', '独处', '深层智慧'],
    stableForm:
      '实体悬浮于虚空之中的一盏孤灯，周围时空流速减慢。接触者进入深度内省状态，获得前所未有的洞察。独处是找到答案的必要条件。',
    decayedForm:
      '灯火微弱，虚空扩张。接触者过度孤立，逃避现实互动。内省变质为自我封闭。',
    summary:
      'AE-09 提着灯笼独行于虚无之中。它告诉你：有些答案只有在独处时才能找到。',
  },
  {
    id: 10,
    designation: 'AE-10',
    codename: 'WHEEL OF FORTUNE',
    classification: 'CYCLIC',
    emoji: '🎡',
    tags: ['命运转折', '周期', '机遇'],
    stableForm:
      '实体表现为一个永动旋转的几何轮盘，无法测量其能量来源。接触点附近概率场扭曲，好运事件概率显著提升。',
    decayedForm:
      '轮盘卡顿，概率场反向扭曲。接触者遭遇连续厄运，或抗拒不可避免的变化。',
    summary:
      'AE-10 永远旋转不停。它提醒我们：生命充满变化，抓住机遇，顺应命运的流转。',
  },
  {
    id: 11,
    designation: 'AE-11',
    codename: 'JUSTICE',
    classification: 'JUDGMENT',
    emoji: '⚖️',
    tags: ['公正', '因果', '平衡'],
    stableForm:
      '实体呈现为完美对称的天平结构，两臂之间悬浮着因果之剑。所有接触者的行为都将得到精准的回馈。因果律在此实体附近被增强。',
    decayedForm:
      '天平倾斜，剑失去光泽。因果关系混乱，不公正行为不受惩罚。系统平衡被打破。',
    summary:
      'AE-11 手持天平与利剑，是因果法则的跨维度执行者。你的所作所为都会得到公正的回应。',
  },
  {
    id: 12,
    designation: 'AE-12',
    codename: 'THE HANGED MAN',
    classification: 'INVERTED',
    emoji: '🙃',
    tags: ['牺牲', '视角转换', '暂停'],
    stableForm:
      '实体倒挂于虚空中，面部表情平静。接触者的时空感知暂时倒转，获得全新的视角。暂停带来意想不到的领悟。',
    decayedForm:
      '倒挂者挣扎但无法翻转。接触者抗拒必要的停顿，或陷入自我牺牲的循环。改变被无限期延迟。',
    summary:
      'AE-12 倒挂却面带平静。它看到了不同的角度——有时暂停和放手，才能获得真正的领悟。',
  },
  {
    id: 13,
    designation: 'AE-13',
    codename: 'DEATH',
    classification: 'TRANSITION',
    emoji: '💀',
    tags: ['终结', '转变', '重生'],
    stableForm:
      '实体并非终结者，而是一道维度过渡门。穿越它的事物被解构为基本粒子，然后在另一侧重组为更高阶形态。转变是成长的必要环节。',
    decayedForm:
      '过渡门关闭，粒子堆积在入口处。接触者抗拒必要的改变，旧模式持续累积。停滞导致熵增。',
    summary:
      '[[董事会记录]] AE-13 不是终结/而是转变。旧事物的消亡为新事物的诞生腾出空间。放下过去/迎接转变。',
  },
  {
    id: 14,
    designation: 'AE-14',
    codename: 'TEMPERANCE',
    classification: 'BALANCE',
    emoji: '🕊️',
    tags: ['调和', '耐心', '适度'],
    stableForm:
      '实体表现为在两个维度杯之间反复倾注的光液，无始无终。接触者情绪状态趋于平衡，极端波动被抚平。它是融合与调和的终极象征。',
    decayedForm:
      '光液溢出，杯子出现裂隙。接触者陷入失衡状态——过度工作、过度消费、或情绪极端化。',
    summary:
      'AE-14 在两个杯中反复倾注光液。它教我们保持平衡与耐心，找到生活的节奏。',
  },
  {
    id: 15,
    designation: 'AE-15',
    codename: 'THE DEVIL',
    classification: 'RESTRICTED',
    emoji: '😈',
    tags: ['束缚', '欲望', '阴影'],
    stableForm:
      '实体揭示的是接触者自身佩戴的锁链——那些自我强加的限制。认识到束缚的来源，是解放的第一步。实体本身不施加控制，只反射控制。',
    decayedForm:
      '锁链收紧，接触者否认束缚的存在。欲望和恐惧成为主人。物质主义取代精神成长。',
    summary:
      'AE-15 揭示了捆绑你的锁链——欲望、恐惧、依赖。认识到这些束缚，是解放自己的第一步。',
  },
  {
    id: 16,
    designation: 'AE-16',
    codename: 'THE TOWER',
    classification: 'CATASTROPHIC',
    emoji: '🗼',
    tags: ['突变', '觉醒', '解放'],
    stableForm:
      '实体瞬间释放巨大能量脉冲，摧毁周围所有虚假的人造结构。虽然过程剧烈，但留下的只有真实。这是清除旧模式、获得真正自由的必经之路。',
    decayedForm:
      '能量积聚但不释放。接触者生活在即将崩塌的恐惧中，或否认即将到来的改变。逃避只会延长痛苦。',
    summary:
      'AE-16 以雷霆击碎虚假的结构。过程痛苦，但这是清除旧模式的必经之路。[[警告：不可阻止]]',
  },
  {
    id: 17,
    designation: 'AE-17',
    codename: 'THE STAR',
    classification: 'HOPE',
    emoji: '⭐',
    tags: ['希望', '灵感', '治愈'],
    stableForm:
      '实体在灾难后的虚无中发出恒定的星光。接触者报告感受到深刻的平静与希望。暴风雨已经过去——这是恢复期的标志。',
    decayedForm:
      '星光暗淡，虚无重新蔓延。接触者丧失信心，看不到未来的可能性。绝望取代希望。',
    summary:
      'AE-17 在暴风雨后照亮夜空。它带来希望和治愈——最困难的时刻已经过去。',
  },
  {
    id: 18,
    designation: 'AE-18',
    codename: 'THE MOON',
    classification: 'ILLUSION',
    emoji: '🌕',
    tags: ['幻象', '潜意识', '不确定性'],
    stableForm:
      '实体扭曲周围的光线，使现实与幻象的边界模糊。月光下的世界充满不确定性。接触者被建议使用直觉而非逻辑导航此区域。',
    decayedForm:
      '幻象凝固为恐惧。接触者被假象蒙蔽，或沉溺于非理性的恐惧中。真相被层层迷雾包裹。',
    summary:
      'AE-18 创造月光下的幻象世界。事情可能不像表面那样。相信直觉穿越迷雾。',
  },
  {
    id: 19,
    designation: 'AE-19',
    codename: 'THE SUN',
    classification: 'BENIGN',
    emoji: '☀️',
    tags: ['快乐', '成功', '活力'],
    stableForm:
      '实体发出温暖的广谱辐射，驱散所有阴影。接触者报告幸福感显著提升，所有正在进行中的项目获得正面推动。这是所有实体中最正面的一个。',
    decayedForm:
      '辐射暂时减弱。成功只是暂时被推迟——并非缺席。过度乐观可能忽略现实问题。',
    summary:
      'AE-19 是最正面的实体之一。它带来温暖、快乐和成功。尽情享受这段光明的时间。',
  },
  {
    id: 20,
    designation: 'AE-20',
    codename: 'JUDGEMENT',
    classification: 'AWAKENING',
    emoji: '📯',
    tags: ['觉醒', '重生', '召唤'],
    stableForm:
      '实体发出跨维度的号角声波，唤醒所有沉睡的意识。接触者经历深刻的过去回顾与整合，获得新的使命召唤。这是灵魂层面的重启。',
    decayedForm:
      '号角无声，意识继续沉睡。接触者拒绝反思过去，或对更高的召唤充耳不闻。自我怀疑阻碍觉醒。',
    summary:
      'AE-20 吹响觉醒的号角。它呼唤你回顾过去，从中获得智慧，接受新的使命。',
  },
  {
    id: 21,
    designation: 'AE-21',
    codename: 'THE WORLD',
    classification: 'OMEGA',
    emoji: '🌍',
    tags: ['完成', '圆满', '周期终结'],
    stableForm:
      '实体表现为一个完整的闭合维度环，包含了所有 21 个前置实体的缩影。接触标志着整个周期的圆满完成。一个旅程的终点，下一个的开端。',
    decayedForm:
      '维度环出现缺口，周期无法闭合。接触者感觉事情悬而未决，缺乏完整的结束感。循环无法完成。',
    summary:
      'AE-21 象征着一个周期的圆满闭环。你已走过了漫长的旅程。现在是庆祝成就的时刻。',
  },
]

/**
 * 随机选择 22 张实体卡
 */
export function selectEntitySet() {
  const shuffled = [...entities].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 22)
}
