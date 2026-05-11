'use client';

import { useAnimatedNumber } from '../hooks/useAnimatedNumber';

interface AnimatedCurrencyProps {
  value: number;
  currency: 'USD' | 'ARS';
  decimals?: number;
  showSign?: boolean;
}

export function AnimatedCurrency({ value, currency, decimals = 2, showSign = false }: AnimatedCurrencyProps) {
  const animatedValue = useAnimatedNumber(value, 400);

  const prefix = currency === 'USD' ? 'US$ ' : 'AR$ ';
  const locale = currency === 'USD' ? 'en-US' : 'es-AR';
  
  const formattedNumber = Math.abs(animatedValue).toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  let sign = '';
  if (showSign) {
    sign = animatedValue >= 0 ? '+' : '';
    // if negative, formattedNumber already has no sign, we will prepend '-' below for negative values.
    if (animatedValue < 0) sign = '-';
  } else if (animatedValue < 0) {
    sign = '-';
  }

  return <span>{`${sign}${prefix}${formattedNumber}`}</span>;
}
