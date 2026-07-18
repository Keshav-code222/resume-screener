// ItalicByline — small italic Cormorant "by ResuMap" lockup. Like a bookplate.
export default function ItalicByline({ children, size = 14, color = 'mute-500', style = {} }) {
  const colorValue =
    color === 'brass'
      ? '#C9A961'
      : color === 'cream'
        ? '#F2E9D8'
        : '#7A7268';

  return (
    <span
      style={{
        fontFamily: '"Cormorant Garamond", Georgia, serif',
        fontStyle: 'italic',
        fontWeight: 400,
        fontSize: size,
        color: colorValue,
        letterSpacing: '0.01em',
        ...style,
      }}
    >
      {children}
    </span>
  );
}
