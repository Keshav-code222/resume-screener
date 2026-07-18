// SerifHeadline — Cormorant 2-line stack headline. The signature editorial
// typography. `lines` is an array of strings; each becomes a separate <span>
// so we can stagger their entrance.
import { motion } from 'framer-motion';
import { chapterReveal } from '../../lib/variants';

export default function SerifHeadline({
  lines = [],
  size = 'lg', // 'xl' | 'lg' | 'md'
  color = 'cream-50',
  italic = false,
  stagger = 0.15,
  trigger = 'whileInView', // 'whileInView' | 'mount'
  style = {},
}) {
  const fontSize =
    size === 'xl'
      ? 'clamp(3.5rem, 8vw, 8rem)'
      : size === 'md'
        ? 'clamp(2rem, 4vw, 3rem)'
        : 'clamp(2.5rem, 5vw, 4.5rem)';

  const colorValue =
    color === 'paper'
      ? '#FFFFFF'
      : color === 'cream-100'
        ? '#F2E9D8'
        : '#F8F2E4';

  const baseLine = {
    fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
    fontWeight: 400,
    fontStyle: italic ? 'italic' : 'normal',
    fontSize,
    lineHeight: 1.0,
    letterSpacing: '-0.02em',
    color: colorValue,
    display: 'block',
  };

  const animationProps =
    trigger === 'whileInView'
      ? {
          initial: 'hidden',
          whileInView: 'visible',
          viewport: { once: true, margin: '-15%' },
        }
      : { initial: 'hidden', animate: 'visible' };

  return (
    <motion.h1
      variants={chapterReveal}
      {...animationProps}
      style={{
        margin: 0,
        ...style,
      }}
    >
      {lines.map((line, i) => (
        <motion.span
          key={i}
          variants={chapterReveal}
          transition={{ delay: i * stagger }}
          style={baseLine}
        >
          {line}
        </motion.span>
      ))}
    </motion.h1>
  );
}
