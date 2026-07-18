// FadeUp — scroll-triggered fade + rise. Single block.
import { motion } from 'framer-motion';
import { fadeUp } from '../../lib/variants';

export default function FadeUp({
  children,
  delay = 0,
  duration,
  y,
  as = 'div',
  style = {},
  ...rest
}) {
  const variants = {
    hidden: { opacity: 0, y: y ?? 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: duration ?? 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const Component = motion[as] || motion.div;

  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10%' }}
      variants={variants}
      style={style}
      {...rest}
    >
      {children}
    </Component>
  );
}
