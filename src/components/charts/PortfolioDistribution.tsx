"use client";

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Position } from '../../types';
import { DollarSign, Banknote } from 'lucide-react';

interface PortfolioDistributionProps {
  positions: Position[];
  arsToUsdRate: number;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#f97316', '#64748b'];

export function PortfolioDistribution({ positions, arsToUsdRate }: PortfolioDistributionProps) {
  const [currency, setCurrency] = useState<'USD' | 'ARS'>('USD');
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const data = positions.map(pos => ({
    name: pos.ticker,
    value: currency === 'USD'
      ? pos.investedValueUSD
      : pos.investedValueUSD * arsToUsdRate,
  }));

  const totalValue = React.useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

  const formatValue = (v: number) =>
    currency === 'USD'
      ? `USD ${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `ARS ${v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const percent = totalValue > 0 ? ((value / totalValue) * 100).toFixed(2) : '0.00';
      return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">{payload[0].name}</p>
          <p className="text-sm font-semibold text-slate-800">{formatValue(value)}</p>
          <p className="text-xs text-slate-500 mt-0.5">{percent}% de la cartera</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
          Distribución por Ticker
        </h3>
        <CurrencyToggle currency={currency} onChange={setCurrency} disabled={!arsToUsdRate} />
      </div>
      <div className="flex-1 min-h-[300px]">
        {!isMounted ? null : <ResponsiveContainer width="100%" height="100%">}
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={105}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={40}
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-xs text-slate-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>}
      </div>
    </div>
  );
}

function CurrencyToggle({
  currency,
  onChange,
  disabled,
}: {
  currency: 'USD' | 'ARS';
  onChange: (c: 'USD' | 'ARS') => void;
  disabled: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-0.5 p-0.5 rounded-lg border border-slate-200 bg-slate-50 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
      title={disabled ? 'Ingresá el tipo de cambio para ver valores en ARS' : undefined}
    >
      <button
        onClick={() => onChange('USD')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
          currency === 'USD'
            ? 'bg-white text-slate-800 shadow-sm'
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <DollarSign size={12} />
        USD
      </button>
      <button
        onClick={() => onChange('ARS')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
          currency === 'ARS'
            ? 'bg-white text-slate-800 shadow-sm'
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Banknote size={12} />
        ARS
      </button>
    </div>
  );
}
