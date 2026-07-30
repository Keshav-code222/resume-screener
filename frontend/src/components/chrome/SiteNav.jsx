// SiteNav — fixed top horizontal nav. Used on every page (slight variations
// per page; this version is the public/marketing variant used on Landing).
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../ui/Logo';
import GhostButton from '../ui/GhostButton';
import FilledButton from '../ui/FilledButton';

export default function SiteNav({ transparent = false, onNavigate }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Solid background instead of backdrop-filter to avoid Chromium compositing
  // bug where fixed-position backdrop-filter paints black on scroll. The
  // "transparent" hero state is also a solid (not rgba(0)) so the page
  // background never bleeds through during scroll repaint.
  const navBg = transparent && !scrolled
    ? 'rgba(10, 9, 7, 0.55)'
    : '#0F0D0A';
  const navBorder = transparent && !scrolled
    ? 'rgba(38, 34, 27, 0.4)'
    : 'rgba(38, 34, 27, 0.6)';

  const handleNav = (sectionId) => (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(sectionId);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: navBg,
        isolation: 'isolate',
        borderBottom: `1px solid ${navBorder}`,
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '16px clamp(1.25rem, 4vw, 4rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        <Logo size={28} />
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 32,
          }}
        >
          <NavItem href="#about" onClick={handleNav('about')}>About</NavItem>
          <NavItem href="#method" onClick={handleNav('method')}>Method</NavItem>
          <NavItem href="#results" onClick={handleNav('results')}>Results</NavItem>
          <NavItem href="#trust" onClick={handleNav('trust')}>Trust</NavItem>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <GhostButton small onClick={() => navigate('/login')}>
            Sign in
          </GhostButton>
          <FilledButton small onClick={() => navigate('/login')}>
            Begin
          </FilledButton>
        </div>
      </div>
    </motion.header>
  );
}

function NavItem({ href, onClick, children }) {
  return (
    <a
      href={href}
      onClick={onClick}
      style={{
        color: '#7A7268',
        fontFamily: '"Inter", system-ui, sans-serif',
        fontSize: 13,
        fontWeight: 500,
        letterSpacing: '0.04em',
        textDecoration: 'none',
        transition: 'color 0.2s ease',
      }}
      onMouseEnter={(e) => (e.target.style.color = '#F2E9D8')}
      onMouseLeave={(e) => (e.target.style.color = '#7A7268')}
    >
      {children}
    </a>
  );
}
