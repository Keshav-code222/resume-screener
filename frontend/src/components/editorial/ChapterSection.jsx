// ChapterSection — full-bleed section wrapper. Accepts a chapter id so
// ChapterNav scroll-spy can track it. Composes ChapterLabel + optional
// serif headline.
import ChapterLabel from './ChapterLabel';

export default function ChapterSection({
  id,
  index,
  label,
  children,
  py = 'clamp(6rem, 14vh, 12rem)',
  bg = 'ink-950',
  style = {},
  showLabel = true,
}) {
  const bgValue =
    bg === 'ink-900'
      ? '#0F0D0A'
      : bg === 'ink-800'
        ? '#15120E'
        : bg === 'forest'
          ? '#0E1F19'
          : '#0A0907';

  return (
    <section
      id={id}
      style={{
        background: bgValue,
        padding: `${py} 0`,
        position: 'relative',
        ...style,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 clamp(1.25rem, 4vw, 4rem)',
        }}
      >
        {showLabel && (index || label) && (
          <div style={{ marginBottom: 'clamp(2rem, 5vh, 4rem)' }}>
            <ChapterLabel index={index} label={label} />
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
