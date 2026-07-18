// Counter — scroll-triggered count-up using react-countup.
// Use: <Counter end={94} suffix="%" />
import { useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';

// react-countup's default export has `useCountUp` for hooks; we render
// a CountUp component and gate it with intersection-observer.
export default function Counter({
  end = 0,
  start = 0,
  duration = 1.8,
  suffix = '',
  prefix = '',
  decimals = 0,
  separator = ',',
  size = 40,
  color = 'cream-50',
  style = {},
}) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });
  const startedRef = useRef(false);

  const colorValue =
    color === 'brass' ? '#C9A961' : color === 'paper' ? '#FFFFFF' : '#F8F2E4';

  return (
    <span
      ref={ref}
      style={{
        fontFamily: '"Cormorant Garamond", Georgia, serif',
        fontSize: size,
        fontWeight: 500,
        color: colorValue,
        lineHeight: 1,
        letterSpacing: '-0.02em',
        display: 'inline-block',
        ...style,
      }}
    >
      {inView || startedRef.current ? (
        <CountUp
          start={start}
          end={end}
          duration={duration}
          decimals={decimals}
          separator={separator}
          prefix={prefix}
          suffix={suffix}
          preserveValue
          onStart={() => (startedRef.current = true)}
        />
      ) : (
        `${prefix}${start}${suffix}`
      )}
    </span>
  );
}
