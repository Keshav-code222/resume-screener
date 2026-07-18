// Footer — closing chapter. Logo + italic byline + brass hairline.
import Logo from '../ui/Logo';
import ItalicByline from '../editorial/ItalicByline';
import GoldDivider from '../editorial/GoldDivider';

export default function Footer() {
  return (
    <footer
      style={{
        background: '#0A0907',
        borderTop: '1px solid #26221B',
        padding: 'clamp(3rem, 8vh, 6rem) 0',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 clamp(1.25rem, 4vw, 4rem)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <Logo size={32} />
        <GoldDivider mode="rule-diamond" />
        <ItalicByline color="mute-500" size={14}>
          a monograph on being hired · 2026
        </ItalicByline>
        <p
          style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: 11,
            color: '#5C5550',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          © ResuMap. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
