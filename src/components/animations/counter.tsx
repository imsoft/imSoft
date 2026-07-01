'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'motion/react';

interface CounterProps {
  value: string;
  className?: string;
  duration?: number;
}

export function Counter({ value, className, duration = 1.5 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px -10% 0px' });
  const [displayValue, setDisplayValue] = useState('0');

  // Strip commas for parsing, but we can add them back later
  const cleanValue = value.replace(/,/g, '');
  const match = cleanValue.match(/^([^\d]*)([\d.]+)([^\d]*)$/);
  
  const prefix = match ? match[1] : '';
  const targetNumber = match ? parseFloat(match[2]) : 0;
  const suffix = match ? match[3] : '';

  useEffect(() => {
    if (!isInView || targetNumber === 0) {
      setDisplayValue(value); // If not a valid animateable number, just set it
      return;
    }

    const start = 0;
    const end = targetNumber;
    const startTime = performance.now();
    let animationFrameId: number;

    const updateNumber = (now: number) => {
      const elapsed = (now - startTime) / 1000; // in seconds
      const progress = Math.min(elapsed / duration, 1);
      
      // Cubic ease-out curve
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeProgress * (end - start) + start);

      // Format with commas if original had it
      const formattedCurrent = value.includes(',') ? current.toLocaleString() : current.toString();

      setDisplayValue(`${prefix}${formattedCurrent}${suffix}`);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateNumber);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(updateNumber);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isInView, targetNumber, prefix, suffix, duration, value]);

  // If the value doesn't match a numeric structure, we render it directly
  if (!match) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span ref={ref} className={className}>
      {isInView ? displayValue : `${prefix}0${suffix}`}
    </span>
  );
}
