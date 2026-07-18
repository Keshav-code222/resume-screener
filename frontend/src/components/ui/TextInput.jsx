// TextInput — dark form input with brass focus ring.
export default function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  autoComplete,
  style = {},
}) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label
          style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#7A7268',
            fontWeight: 500,
          }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        style={{
          width: '100%',
          padding: '14px 16px',
          background: '#15120E',
          border: '1px solid #26221B',
          borderRadius: 4,
          color: '#F2E9D8',
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: 15,
          transition: 'border-color 0.2s ease, background 0.2s ease',
          ...style,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#C9A961';
          e.target.style.background = '#1F1B14';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#26221B';
          e.target.style.background = '#15120E';
        }}
      />
    </div>
  );
}
