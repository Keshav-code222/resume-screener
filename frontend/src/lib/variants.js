// Shared framer-motion variants. Single source of truth so every page
// (Landing, Login, Analyze, Dashboard) feels identical.
//
// All variants respect useReducedMotion() — they short-circuit to duration: 0
// when the user has prefers-reduced-motion: reduce enabled.

import { useReducedMotion } from 'framer-motion';

// Easing curves — "easeOutQuint" and "easeOutExpo" approximations.
const easeOut = [0.22, 1, 0.36, 1];
const easeEditorial = [0.16, 1, 0.3, 1];

// Default durations.
const D = {
  fade: 0.7,
  chapter: 1.1,
  preloader: 0.6,
  fast: 0.4,
};

/** Fade + rise on enter. */
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: D.fade, ease: easeOut },
  },
};

/** Container that staggers its fadeUp children. */
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

/** Bigger, slower reveal for chapter heads. */
export const chapterReveal = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: D.chapter, ease: easeEditorial },
  },
};

/** Preloader exit: fades + slight scale-up. */
export const preloaderExit = {
  opacity: 0,
  scale: 1.04,
  transition: { duration: D.preloader, ease: 'easeInOut' },
};

/** Page transition variants (used in App.jsx PageWrapper). */
export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.35, ease: 'easeIn' },
  },
};

/** Hover state for cream text → brass. */
export const hoverGold = {
  color: '#D4B97A',
  transition: { duration: 0.2, ease: 'easeOut' },
};

/**
 * Returns a framer-motion `animate` prop for an infinite horizontal marquee.
 * Use as `<motion.div animate={marqueeX().animate} transition={marqueeX().transition}>`.
 */
export function marqueeX(duration = 30) {
  return {
    animate: { x: ['0%', '-50%'] },
    transition: { duration, repeat: Infinity, ease: 'linear' },
  };
}

/** Hook: returns fadeUp-compatible variants tuned for reduced motion. */
export function useEditorialVariants() {
  const reduce = useReducedMotion();
  const dur = reduce ? 0 : undefined;
  return {
    fadeUp: {
      hidden: { opacity: 0, y: reduce ? 0 : 24 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: dur ?? D.fade, ease: easeOut },
      },
    },
    chapterReveal: {
      hidden: { opacity: 0, y: reduce ? 0 : 40 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: dur ?? D.chapter, ease: easeEditorial },
      },
    },
  };
}
