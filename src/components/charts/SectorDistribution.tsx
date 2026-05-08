"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Position } from '../../types';
import { UNKNOWN_SECTOR } from '../../constants/sectors';
import { AlertCircle } from 'lucide-react';
import { CurrencyToggle } from './CurrencyToggle';
import { CustomTooltip } from './CustomTooltip';
import { COLORS } from '../../constants/colors';

interface SectorDistributionProps {
  positions: Position[];
  arsToUsdRate: number;
}

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
      .sort((a, b) => b.value - a.value)
      .map((item, index) => ({
        ...item,
        fill: COLORS[index % COLORS.length],
      }));
  }, [positions, currency, arsToUsdRate]);

  const totalValue = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

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
        {!isMounted ? null : (
          <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={105}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            />
            <Tooltip content={<CustomTooltip totalValue={totalValue} currency={currency} />} />
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
        </ResponsiveContainer>
        )}
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

