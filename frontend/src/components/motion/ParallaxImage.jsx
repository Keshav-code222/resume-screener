// ParallaxImage — gives its child a slow scroll-linked Y translation.
// Use inside FullBleedImage to make the background feel "alive".
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ParallaxImage({ children, range = 300, yOffset = -80 }) {
  const ref = useRef(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, range], [0, yOffset]);

  return (
    <motion.div ref={ref} style={{ y, width: '100%', height: '100%' }}>
      {children}
    </motion.div>
  );
}
