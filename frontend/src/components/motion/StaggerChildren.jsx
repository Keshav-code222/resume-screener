// StaggerChildren — container that staggers FadeUp-style children.
import { motion } from 'framer-motion';
import { staggerContainer } from '../../lib/variants';

export default function StaggerChildren({
  children,
  stagger = 0.12,
  delay = 0.05,
  style = {},
}) {
  const variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10%' }}
      variants={variants}
      style={style}
    >
      {children}
    </motion.div>
  );
}
