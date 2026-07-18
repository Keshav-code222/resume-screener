// FullBleedImage — section background with the signature two-layer overlay
// (gradient + warm color grade) and optional grain texture. No external
// images: uses CSS radial-gradients to evoke atmospheric depth.
import { motion } from 'framer-motion';

export default function FullBleedImage({
  variant = 'hero', // 'hero' | 'forest' | 'dawn' | 'dusk'
  children,
  withGrain = true,
  style = {},
}) {
  const gradients = {
    hero: {
      bg: 'radial-gradient(ellipse at 30% 20%, rgba(201, 169, 97, 0.12) 0%, rgba(10, 9, 7, 0) 50%), radial-gradient(ellipse at 80% 80%, rgba(14, 31, 25, 0.6) 0%, rgba(10, 9, 7, 0) 60%), #0A0907',
    },
    forest: {
      bg: 'radial-gradient(ellipse at 70% 30%, rgba(14, 31, 25, 0.8) 0%, rgba(10, 9, 7, 0) 60%), radial-gradient(ellipse at 20% 70%, rgba(201, 169, 97, 0.06) 0%, rgba(10, 9, 7, 0) 50%), #0A0907',
    },
    dawn: {
      bg: 'radial-gradient(ellipse at 50% 0%, rgba(201, 169, 97, 0.18) 0%, rgba(10, 9, 7, 0) 55%), radial-gradient(ellipse at 30% 100%, rgba(14, 31, 25, 0.4) 0%, rgba(10, 9, 7, 0) 60%), #0A0907',
    },
    dusk: {
      bg: 'radial-gradient(ellipse at 80% 20%, rgba(168, 138, 69, 0.15) 0%, rgba(10, 9, 7, 0) 50%), radial-gradient(ellipse at 20% 80%, rgba(14, 31, 25, 0.5) 0%, rgba(10, 9, 7, 0) 60%), #0A0907',
    },
  };

  const gradient = gradients[variant] || gradients.hero;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        background: gradient.bg,
        ...style,
      }}
    >
      {/* Warm color-grade overlay (mix-blend-mode) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(201, 169, 97, 0.08)',
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }}
      />
      {/* Bottom-up darkening for text legibility */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, rgba(10, 9, 7, 0) 0%, rgba(10, 9, 7, 0) 50%, rgba(10, 9, 7, 0.85) 100%)',
          pointerEvents: 'none',
        }}
      />
      {/* SVG film grain */}
      {withGrain && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.79 0 0 0 0 0.66 0 0 0 0 0.38 0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
            opacity: 0.06,
            mixBlendMode: 'overlay',
            pointerEvents: 'none',
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
        {children}
      </div>
    </div>
  );
}
