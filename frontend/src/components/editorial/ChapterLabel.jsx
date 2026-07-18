// ChapterLabel — "00 — PROLOG" small caps. Brass number + cream label.
export default function ChapterLabel({ index, label, size = 'md' }) {
  const numberSize = size === 'sm' ? 11 : 13;
  const labelSize = size === 'sm' ? 10 : 11;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        fontFamily: '"Inter", system-ui, sans-serif',
      }}
    >
      <span
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: numberSize,
          fontWeight: 500,
          color: '#C9A961',
          letterSpacing: '0.08em',
        }}
      >
        {index}
      </span>
      <span
        style={{
          display: 'inline-block',
          width: 24,
          height: 1,
          background: 'rgba(201, 169, 97, 0.4)',
        }}
      />
      <span
        style={{
          fontSize: labelSize,
          fontWeight: 500,
          color: '#F2E9D8',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
    </div>
  );
}
