// SiteNav — fixed top horizontal nav. Used on every page (slight variations
// per page; this version is the public/marketing variant used on Landing).
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../ui/Logo';
import GhostButton from '../ui/GhostButton';
import FilledButton from '../ui/FilledButton';

export default function SiteNav({ transparent = false }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navBg = transparent && !scrolled
    ? 'rgba(10, 9, 7, 0)'
    : 'rgba(10, 9, 7, 0.85)';
  const navBorder = transparent && !scrolled
    ? 'transparent'
    : 'rgba(38, 34, 27, 0.6)';

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
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
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
          <NavItem href="#about">About</NavItem>
          <NavItem href="#method">Method</NavItem>
          <NavItem href="#results">Results</NavItem>
          <NavItem href="#trust">Trust</NavItem>
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

function NavItem({ href, children }) {
  return (
    <a
      href={href}
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
