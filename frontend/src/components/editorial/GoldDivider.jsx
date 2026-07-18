// GoldDivider — three modes:
//   1. rule  — a 1px brass hairline (default)
//   2. wave  — the gold-wave SVG
//   3. rule+ — 1px line with a centered diamond (gold-rule.svg)
//   4. ornament — the gold-ornament fleuron
// width defaults to full container width but can be capped with `maxWidth`.

import goldWave from '../../assets/dividers/gold-wave.svg';
import goldRule from '../../assets/dividers/gold-rule.svg';
import goldOrnament from '../../assets/dividers/gold-ornament.svg';

export default function GoldDivider({
  mode = 'rule',
  maxWidth,
  height,
  style = {},
}) {
  const wrapStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    margin: '0 auto',
    maxWidth: maxWidth ?? '100%',
    ...style,
  };

  if (mode === 'wave') {
    return (
      <div style={wrapStyle}>
        <img
          src={goldWave}
          alt=""
          aria-hidden="true"
          style={{
            width: '100%',
            maxWidth: maxWidth ?? 1200,
            height: height ?? 60,
            opacity: 0.7,
          }}
        />
      </div>
    );
  }

  if (mode === 'rule+' || mode === 'rule-diamond') {
    return (
      <div style={wrapStyle}>
        <img
          src={goldRule}
          alt=""
          aria-hidden="true"
          style={{ width: 200, height: 12, opacity: 0.85 }}
        />
      </div>
    );
  }

  if (mode === 'ornament') {
    return (
      <div style={wrapStyle}>
        <img
          src={goldOrnament}
          alt=""
          aria-hidden="true"
          style={{ width: 64, height: 32, opacity: 0.7 }}
        />
      </div>
    );
  }

  // Default: simple 1px brass hairline.
  return (
    <div
      style={{
        width: '100%',
        maxWidth: maxWidth ?? '100%',
        margin: '0 auto',
        height: 1,
        background: 'rgba(201, 169, 97, 0.3)',
        ...style,
      }}
    />
  );
}
