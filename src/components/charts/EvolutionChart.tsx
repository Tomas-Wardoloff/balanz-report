'use client';

import { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { RawOrder } from '@/types';
import { parseOrderDate } from '@/utils/parser';
import { usePrivacy } from '@/context/PrivacyContext';

interface EvolutionChartProps {
  orders: RawOrder[];
  arsToUsdRate: number;
  currency: 'USD' | 'ARS';
}

type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';

// Helper to add days to a date
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Helper to format date for chart
function formatDate(date: Date): string {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}

function formatXAxis(dateStr: string): string {
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [, month, year] = parts;
    return `${month}/${year}`;
  }
  return dateStr;
}

export function EvolutionChart({ orders, arsToUsdRate, currency }: EvolutionChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('ALL');
  const { isPrivate } = usePrivacy();

  const chartData = useMemo(() => {
    if (!orders || orders.length === 0) {
      return [];
    }

    const sortedOrders = [...orders].sort(
      (a, b) => parseOrderDate(a.Concertacion).getTime() - parseOrderDate(b.Concertacion).getTime()
    );

    const firstDate = parseOrderDate(sortedOrders[0].Concertacion);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const timeline: any[] = [];
    let cumulativeInvestedUSD = 0;
    const currentHoldings: Record<string, number> = {};
    const costBasisHoldings: Record<string, number> = {};

    let orderIndex = 0;

    for (let d = new Date(firstDate); d <= today; d = addDays(d, 1)) {
      const dateStr = formatDate(d);

      // Apply any orders that happened on this day
      while (orderIndex < sortedOrders.length) {
        const order = sortedOrders[orderIndex];
        const orderDate = parseOrderDate(order.Concertacion);

        if (orderDate.getTime() > d.getTime()) {
          // This order is in the future relative to our current loop day
          break;
        }

        if (orderDate.getTime() === d.getTime()) {
          const isUSD =
            order.Moneda.toLowerCase().includes('dólar') ||
            order.Moneda.toLowerCase().includes('dollar');
          const rate = isUSD ? 1 : arsToUsdRate > 0 ? 1 / arsToUsdRate : 0;
          const orderNetoUSD = Number(order.Neto) * rate;

          if (order.Tipo === 'COMPRA') {
            cumulativeInvestedUSD += orderNetoUSD;
            currentHoldings[order.Ticker] = (currentHoldings[order.Ticker] || 0) + order.Cantidad;
            costBasisHoldings[order.Ticker] = (costBasisHoldings[order.Ticker] || 0) + orderNetoUSD;
          } else if (order.Tipo === 'VENTA') {
            const qty = currentHoldings[order.Ticker] || 0;
            const avgPriceUSD = qty > 0 ? (costBasisHoldings[order.Ticker] || 0) / qty : 0;

            currentHoldings[order.Ticker] -= order.Cantidad;
            costBasisHoldings[order.Ticker] -= order.Cantidad * avgPriceUSD;
            cumulativeInvestedUSD -= order.Cantidad * avgPriceUSD;

            if (currentHoldings[order.Ticker] <= 0) {
              currentHoldings[order.Ticker] = 0;
              costBasisHoldings[order.Ticker] = 0;
            }
          }
        }
        orderIndex++;
      }

      timeline.push({
        date: dateStr,
        timestamp: d.getTime(),
        investedUSD: Math.max(0, cumulativeInvestedUSD),
      });
    }

    return timeline;
  }, [orders, arsToUsdRate]);

  const filteredData = useMemo(() => {
    if (chartData.length === 0) return [];
    if (timeRange === 'ALL') return chartData;

    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);

    switch (timeRange) {
      case '1M':
        cutoff.setMonth(cutoff.getMonth() - 1);
        break;
      case '3M':
        cutoff.setMonth(cutoff.getMonth() - 3);
        break;
      case '6M':
        cutoff.setMonth(cutoff.getMonth() - 6);
        break;
      case '1Y':
        cutoff.setFullYear(cutoff.getFullYear() - 1);
        break;
    }

    const cutoffTime = cutoff.getTime();
    const filtered = chartData.filter((p) => p.timestamp >= cutoffTime);

    // Fallback: if range cutoff is older than the very first data point, filtered will be all of them
    return filtered.length > 0 ? filtered : chartData;
  }, [chartData, timeRange]);

  if (filteredData.length === 0) return null;

  // Transform data based on selected currency
  const displayData = filteredData.map((point) => {
    const multiplier = currency === 'USD' ? 1 : arsToUsdRate;
    return {
      ...point,
      Invertido: point.investedUSD * multiplier,
    };
  });

  const currencyPrefix = currency === 'USD' ? 'US$ ' : 'AR$ ';
  const formatYAxis = (value: number) => {
    if (isPrivate) return '***';
    if (value >= 1000000) return `${currencyPrefix}${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${currencyPrefix}${(value / 1000).toFixed(0)}k`;
    return `${currencyPrefix}${value}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
          Evolución del Capital Invertido
        </h3>
        <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-lg self-start sm:self-auto">
          {(['1M', '3M', '6M', '1Y', 'ALL'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 cursor-pointer ${
                timeRange === range
                  ? 'text-slate-900 font-semibold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6 h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorInvertido" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              tickFormatter={formatXAxis}
              minTickGap={30}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              tickFormatter={formatYAxis}
              width={80}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-4 border border-slate-100 shadow-xl rounded-lg">
                      <p className="text-sm font-semibold text-slate-700 mb-2">{label}</p>
                      <div className="flex items-center gap-3 justify-between">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: payload[0].color }}
                          />
                          <span className="text-sm text-slate-500">Total Invertido</span>
                        </div>
                        <span className="text-sm font-bold text-slate-800">
                          {isPrivate ? (
                            '***'
                          ) : (
                            <>
                              {currencyPrefix}
                              {Number(payload[0].value).toLocaleString(
                                currency === 'USD' ? 'en-US' : 'es-AR',
                                {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                }
                              )}
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="Invertido"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorInvertido)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
