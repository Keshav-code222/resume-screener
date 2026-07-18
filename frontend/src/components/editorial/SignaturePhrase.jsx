// SignaturePhrase — recurring italic Cormorant micro-phrase.
import { motion } from 'framer-motion';

export default function SignaturePhrase({ children, size = 13, color = 'mute-500' }) {
  const colorValue =
    color === 'brass'
      ? '#C9A961'
      : color === 'cream'
        ? '#F2E9D8'
        : '#7A7268';

  return (
    <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
      style={{
        display: 'block',
        fontFamily: '"Cormorant Garamond", Georgia, serif',
        fontStyle: 'italic',
        fontWeight: 300,
        fontSize: size,
        color: colorValue,
        letterSpacing: '0.04em',
        textAlign: 'center',
      }}
    >
      {children}
    </motion.span>
  );
}
