import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// GhostButton — brass outline, cream text. Secondary action.
export default function GhostButton({
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
      whileHover={
        disabled
          ? {}
          : {
              borderColor: '#D4B97A',
              color: '#D4B97A',
              backgroundColor: 'rgba(201, 169, 97, 0.05)',
            }
      }
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        width: fullWidth ? '100%' : 'auto',
        padding: small ? '10px 20px' : '14px 28px',
        background: 'transparent',
        color: disabled ? '#5C5550' : '#F2E9D8',
        fontFamily: '"Inter", system-ui, sans-serif',
        fontWeight: 500,
        fontSize: small ? 12 : 13,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        border: `1px solid ${disabled ? '#26221B' : 'rgba(201, 169, 97, 0.6)'}`,
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
