import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// FilledButton — brass background, ink text. The primary action.
// Renders as <button> by default, or as <Link> when `to` is supplied.
export default function FilledButton({
  children,
  to,
  onClick,
  type = 'button',
  fullWidth = false,
  small = false,
  disabled = false,
  style = {},
}) {
  const Component = motion[to ? Link : 'button'];
  const props = to
    ? { to, onClick }
    : { onClick, type, disabled };

  return (
    <Component
      {...props}
      whileHover={disabled ? {} : { scale: 1.02, backgroundColor: '#D4B97A' }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        width: fullWidth ? '100%' : 'auto',
        padding: small ? '10px 20px' : '14px 28px',
        background: disabled ? '#5C5550' : '#C9A961',
        color: '#0A0907',
        fontFamily: '"Inter", system-ui, sans-serif',
        fontWeight: 500,
        fontSize: small ? 12 : 13,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        border: 'none',
        borderRadius: 100,
        cursor: disabled ? 'not-allowed' : 'pointer',
        textDecoration: 'none',
        ...style,
      }}
    >
      {children}
    </Component>
  );
}
