import React, { useState, useEffect, useRef } from 'react';

interface Props {
  value: number | string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * AnimatedNumber — Jupiter-style rolling number animation.
 * Accepts number (animated) or string (displayed directly).
 * Handles formatted strings with commas by falling back to direct display.
 */
const AnimatedNumber: React.FC<Props> = ({
  value,
  decimals = 2,
  prefix = '',
  suffix = '',
  duration = 600,
  className = '',
  style = {},
}) => {
  const numVal = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  const isFormatted = typeof value === 'string' && value.includes(',');

  const [display, setDisplay] = useState(numVal);
  const prevValue = useRef(numVal);
  const raf = useRef<number>(0);
  const startTime = useRef(0);

  useEffect(() => {
    // Skip animation for formatted strings or NaN
    if (isFormatted || isNaN(numVal)) {
      setDisplay(numVal);
      prevValue.current = numVal;
      return;
    }

    const start = prevValue.current;
    const end = numVal;
    const diff = end - start;
    prevValue.current = end;

    if (Math.abs(diff) < 0.001) {
      setDisplay(end);
      return;
    }

    startTime.current = performance.now();
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (now: number) => {
      const elapsed = now - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const current = start + diff * easeOutCubic(progress);
      setDisplay(current);
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };

    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [numVal, duration, isFormatted]);

  // Direct display for formatted strings
  if (isFormatted || (isNaN(numVal) && typeof value === 'string')) {
    return (
      <span className={`animate-number ${className}`} style={style}>
        {prefix}{value}{suffix}
      </span>
    );
  }

  const formatted = display.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={`animate-number ${className}`} style={style}>
      {prefix}{formatted}{suffix}
    </span>
  );
};

export default AnimatedNumber;
