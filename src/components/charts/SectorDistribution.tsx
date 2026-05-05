"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Position } from '../../types';
import { UNKNOWN_SECTOR } from '../../constants/sectors';
import { DollarSign, Banknote, AlertCircle } from 'lucide-react';

interface SectorDistributionProps {
  positions: Position[];
  arsToUsdRate: number;
}

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#64748b', '#06b6d4', '#f97316', '#14b8a6'];

export function SectorDistribution({ positions, arsToUsdRate }: SectorDistributionProps) {
  const [currency, setCurrency] = useState<'USD' | 'ARS'>('USD');
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const data = useMemo(() => {
    const sectorMap = new Map<string, number>();

    positions.forEach(pos => {
      const val = currency === 'USD' ? pos.investedValueUSD : pos.investedValueUSD * arsToUsdRate;
      const currentVal = sectorMap.get(pos.sector) || 0;
      sectorMap.set(pos.sector, currentVal + val);
    });

    return Array.from(sectorMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [positions, currency, arsToUsdRate]);

  const totalValue = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

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

  const unknownTickers = useMemo(() => {
    return positions.filter(p => p.sector === UNKNOWN_SECTOR).map(p => p.ticker);
  }, [positions]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
          Distribución por Sector
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

      {unknownTickers.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-2">
          <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-700">Sin sector asignado: </span>
            {unknownTickers.join(', ')}
          </p>
        </div>
      )}
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
