import { useState, useEffect } from 'react';

export function useAnimatedNumber(value: number, duration = 400) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let startTimestamp: number;
    const startValue = displayValue;
    const endValue = value;

    if (startValue === endValue) return;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);

      setDisplayValue(startValue + (endValue - startValue) * ease);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };

    const animationId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationId);
  }, [value, duration]);

  return displayValue;
}
