import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

// Brass R monogram + "resumap." wordmark. Used in SiteNav, Footer, ChapterNav.
// `size` controls both the tile and the wordmark font size.
export default function Logo({ size = 28, withWordmark = true, to = '/', tone = 'brass' }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  const tileBg = tone === 'paper' ? '#F2E9D8' : 'transparent';
  const tileBorder = tone === 'paper' ? 'transparent' : 'rgba(201, 169, 97, 0.6)';
  const letterColor = tone === 'paper' ? '#0A0907' : '#C9A961';
  const wordColor = '#F2E9D8';

  return (
    <Link
      to={to}
      aria-label="ResuMap — home"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
    >
      <motion.span
        whileHover={{ rotate: -4, scale: 1.04 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{
          width: size,
          height: size,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: tileBg,
          border: `1px solid ${tileBorder}`,
          borderRadius: 4,
          color: letterColor,
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: size * 0.72,
          lineHeight: 1,
        }}
      >
        R
      </motion.span>
      {withWordmark && (
        <span
          style={{
            color: wordColor,
            fontFamily: '"Inter", system-ui, sans-serif',
            fontWeight: 500,
            fontSize: size * 0.5,
            letterSpacing: '-0.01em',
            opacity: isActive ? 1 : 0.95,
          }}
        >
          resumap<span style={{ color: '#C9A961' }}>.</span>
        </span>
      )}
    </Link>
  );
}
