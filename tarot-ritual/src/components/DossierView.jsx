/**
 * DossierView — 机密档案（解读结果）视图
 *
 * Control 星界分析报告界面：
 *   红条分类头 + [[董事会批示]] + 场效应分析 + 接触建议
 *   打字机风格段落 · 红色印章标签 · 青铜点缀
 *
 * @param {Object} props
 * @param {import('../data/entities').Entity} props.entity
 * @param {'stable'|'decayed'} props.orientation
 * @param {{fieldEffect:string,boardDirective:string,contactProtocol:string}|null} props.reading
 * @param {()=>void} props.onReset
 */

import { motion } from 'framer-motion'
import EntityCard from './EntityCard'

export default function DossierView({ entity, orientation, reading, onReset }) {
  const formLabel = orientation === 'stable' ? 'STABLE FORM' : 'DECAYED FORM'
  const isStable = orientation === 'stable'

  // 使用回退数据（Gemini 失败时）
  const report = reading || {
    fieldEffect: entity.summary,
    boardDirective: isStable
      ? `[[${entity.codename}/稳定/批准接触]]`
      : `[[${entity.codename}/衰减/谨慎评估]]`,
    contactProtocol: `[${formLabel}] ${isStable ? entity.stableForm : entity.decayedForm}`,
  }

  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
  }
  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.32, 0.72, 0, 1] },
    },
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-y-auto px-6 py-6">
      <motion.div
        className="flex flex-col items-center gap-6 max-w-lg w-full"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {/* 档案编号头部 */}
        <motion.div className="fbc-panel w-full" variants={item}>
          <div className="fbc-header" style={{ fontSize: 10 }}>
            ARCHIVE DOSSIER: {entity.designation}
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <span className="fbc-label" style={{ fontSize: 8 }}>
              SECURITY CLASSIFICATION: {entity.classification}
            </span>
            <span
              className="fbc-stamp"
              style={{
                fontSize: 7,
                borderColor: isStable ? 'rgba(201,169,110,0.6)' : 'rgba(192,57,43,0.8)',
                color: isStable ? '#c9a96e' : '#c0392b',
              }}
            >
              {formLabel}
            </span>
          </div>
        </motion.div>

        {/* 卡片 + 代号 */}
        <motion.div className="flex items-center gap-6" variants={item}>
          <EntityCard entity={entity} isFlipped={true} size="sm" />
          <div>
            <div style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: '#e8e0d5',
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: 'uppercase',
              lineHeight: 1.3,
            }}>
              {entity.codename}
            </div>
            <div className="fbc-label mt-2" style={{ fontSize: 8 }}>
              [{entity.designation}] · {entity.classification}
            </div>
          </div>
        </motion.div>

        {/* 星界分析报告 */}
        <motion.div className="fbc-panel w-full px-5 py-5 flex flex-col gap-5" variants={item}>
          {/* 董事会批示 */}
          <div>
            <div className="fbc-label" style={{ fontSize: 7, marginBottom: 6 }}>
              BOARD DIRECTIVE
            </div>
            <div className="fbc-board" style={{ fontSize: 11, lineHeight: 1.8 }}>
              {report.boardDirective}
            </div>
          </div>

          {/* 分隔线 */}
          <div style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.3), transparent)',
          }} />

          {/* 场效应分析 */}
          <div>
            <div className="fbc-label" style={{ fontSize: 7, marginBottom: 6 }}>
              FIELD EFFECT ANALYSIS
            </div>
            <p className="fbc-typewriter" style={{ fontSize: 11, color: '#e8e0d5' }}>
              {report.fieldEffect}
            </p>
          </div>

          {/* 分隔线 */}
          <div style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(192,57,43,0.2), transparent)',
          }} />

          {/* 接触协议 */}
          <div>
            <div className="fbc-label" style={{ fontSize: 7, marginBottom: 6 }}>
              CONTACT PROTOCOL
            </div>
            <p className="fbc-typewriter" style={{ fontSize: 11, color: '#e8e0d5' }}>
              {report.contactProtocol}
            </p>
          </div>
        </motion.div>

        {/* 标签 */}
        <motion.div className="flex gap-2 flex-wrap justify-center" variants={item}>
          {entity.tags.map((tag, i) => (
            <span key={i} className="fbc-stamp">{tag}</span>
          ))}
        </motion.div>

        {/* 重置按钮 */}
        <motion.div variants={item}>
          <button className="fbc-btn" onClick={onReset} style={{ fontSize: 10, padding: '10px 28px' }}>
            CLOSE DOSSIER
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
