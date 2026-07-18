// MarqeeRow — infinite horizontal scroll of editorial text in brass.
// Use as a chapter divider or as an in-section ornament.
import { motion } from 'framer-motion';
import { marqueeX } from '../../lib/variants';

export default function MarqeeRow({
  text = 'ResuMap',
  repeat = 6,
  duration = 30,
  separator = '·',
  color = '#C9A961',
  opacity = 0.5,
  size = 13,
  letterSpacing = '0.4em',
  style = {},
}) {
  const items = Array.from({ length: repeat * 2 });

  return (
    <div
      style={{
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        whiteSpace: 'nowrap',
        ...style,
      }}
      aria-hidden="true"
    >
      <motion.div
        animate={marqueeX(duration).animate}
        transition={marqueeX(duration).transition}
        style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
      >
        {items.map((_, i) => (
          <span
            key={i}
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: size,
              fontWeight: 500,
              color,
              opacity,
              letterSpacing,
              textTransform: 'uppercase',
              padding: '0 2.5em',
            }}
          >
            {text}
            <span style={{ margin: '0 1.5em', opacity: 0.6 }}>{separator}</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
