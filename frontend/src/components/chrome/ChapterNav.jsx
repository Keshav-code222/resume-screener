// ChapterNav — fixed left rail. Numbered tabs (00, 01, 02…) for each
// Landing chapter. Brass tick animates between active chapters via
// framer-motion shared layout (layoutId="chapterTick").
import { motion } from 'framer-motion';
import { chapters } from '../../lib/chapters';

export default function ChapterNav({ activeId, onSelect }) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Chapter navigation"
      style={{
        position: 'fixed',
        left: 32,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
      className="chapter-nav-rail"
    >
      {chapters.map((c) => {
        const isActive = activeId === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect?.(c.id)}
            aria-label={`Go to ${c.label}`}
            aria-current={isActive ? 'true' : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span
              style={{
                position: 'relative',
                width: 14,
                height: 14,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {isActive && (
                <motion.span
                  layoutId="chapterTick"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  style={{
                    position: 'absolute',
                    width: 2,
                    height: 14,
                    background: '#C9A961',
                    left: 0,
                    top: 0,
                  }}
                />
              )}
            </span>
            <span
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                opacity: isActive ? 1 : 0.45,
                transition: 'opacity 0.25s ease',
              }}
            >
              <span
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 10,
                  fontWeight: 500,
                  color: isActive ? '#C9A961' : '#7A7268',
                  letterSpacing: '0.08em',
                }}
              >
                {c.index}
              </span>
              <span
                style={{
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontSize: 10,
                  fontWeight: 500,
                  color: isActive ? '#F2E9D8' : '#5C5550',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                }}
              >
                {c.label}
              </span>
            </span>
          </button>
        );
      })}
    </motion.aside>
  );
}
