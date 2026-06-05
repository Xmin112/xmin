/**
 * FloatingHeader — 顶部悬浮 Header + 发光渐变标题
 */

export default function FloatingHeader() {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-8 py-4"
      style={{
        background: 'linear-gradient(180deg, rgba(5,5,8,0.95) 0%, rgba(5,5,8,0) 100%)',
        backdropFilter: 'blur(8px)',
      }}>
      <div>
        <h1 style={{
          fontSize: 16, fontWeight: 700, letterSpacing: '0.4em',
          background: 'linear-gradient(135deg, #e8e0d5 0%, #c9a96e 50%, #c0392b 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase',
        }}>
          TAROT
        </h1>
      </div>
      <div style={{ fontSize: 8, color: '#6b6b6b', letterSpacing: '0.2em', fontFamily: "'JetBrains Mono', monospace" }}>
        FBC · CASE 22
      </div>
    </div>
  )
}
