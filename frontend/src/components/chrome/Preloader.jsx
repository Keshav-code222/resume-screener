// Preloader — first-load slow-burn 0%→100% on a deep ink background.
// Center: Cormorant italic "ResuMap" wordmark. Below: brass hairline that
// scales 0→100%, then a monospace counter using react-countup.
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useEffect, useState } from 'react';
import { preloaderExit } from '../../lib/variants';

export default function Preloader() {
  const [start, setStart] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setStart(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      key="preloader"
      initial={{ opacity: 1 }}
      exit={preloaderExit}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: '#0A0907',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 36,
        overflow: 'hidden',
      }}
    >
      {/* Background film grain */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.79 0 0 0 0 0.66 0 0 0 0 0.38 0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          opacity: 0.05,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }}
      />
      {/* Top eyebrow */}
      <motion.span
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: 10,
          fontWeight: 500,
          color: '#7A7268',
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          position: 'relative',
          zIndex: 1,
        }}
      >
        a monograph on being hired
      </motion.span>

      {/* Wordmark */}
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontWeight: 300,
          fontStyle: 'italic',
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          color: '#C9A961',
          letterSpacing: '-0.01em',
          margin: 0,
          position: 'relative',
          zIndex: 1,
        }}
      >
        ResuMap
      </motion.h1>

      {/* Brass hairline scaling 0 → 100% */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: 280,
          maxWidth: '60vw',
          height: 1,
          background: 'linear-gradient(90deg, transparent 0%, #C9A961 50%, transparent 100%)',
          transformOrigin: 'left center',
          position: 'relative',
          zIndex: 1,
        }}
      />

      {/* Monospace counter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 11,
          fontWeight: 500,
          color: '#7A7268',
          letterSpacing: '0.2em',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {start ? (
          <CountUp
            start={0}
            end={100}
            duration={1.8}
            suffix=" %"
            preserveValue
          />
        ) : (
          '0 %'
        )}
      </motion.div>

      {/* Bottom signature */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
        style={{
          position: 'absolute',
          bottom: 48,
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 12,
          color: '#5C5550',
          letterSpacing: '0.04em',
          zIndex: 1,
        }}
      >
        loading the monograph
      </motion.span>
    </motion.div>
  );
}
