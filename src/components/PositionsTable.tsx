"use client";

import React, { useState } from "react";
import { Position } from "../types";
import { DollarSign, Banknote } from "lucide-react";

interface PositionsTableProps {
  positions: Position[];
  arsToUsdRate: number;
}

export function PositionsTable({ positions, arsToUsdRate }: PositionsTableProps) {
  const [currency, setCurrency] = useState<'USD' | 'ARS'>('USD');

  if (positions.length === 0) return null;

  const formatPrice = (v: number, decimals = 2) =>
    currency === 'USD'
      ? `USD ${v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals + 2 })}`
      : `ARS ${(v * arsToUsdRate).toLocaleString('es-AR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
            Resumen de Posiciones
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{positions.length} posiciones abiertas</p>
        </div>
        <CurrencyToggle currency={currency} onChange={setCurrency} disabled={!arsToUsdRate} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-widest">
              <th className="px-6 py-3 font-semibold border-b border-slate-100">Ticker</th>
              <th className="px-6 py-3 font-semibold border-b border-slate-100">Sector</th>
              <th className="px-6 py-3 font-semibold border-b border-slate-100 text-right">Cantidad</th>
              <th className="px-6 py-3 font-semibold border-b border-slate-100 text-right">Precio Prom.</th>
              <th className="px-6 py-3 font-semibold border-b border-slate-100 text-right">Valor Invertido</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos, idx) => (
              <tr
                key={pos.ticker}
                className={`hover:bg-slate-50/70 transition-colors ${idx !== positions.length - 1 ? 'border-b border-slate-100' : ''}`}
              >
                <td className="px-6 py-4 font-semibold text-sm text-slate-800 tracking-tight">
                  {pos.ticker}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                    {pos.sector}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-mono text-sm text-slate-600">
                  {pos.quantity.toLocaleString('es-AR')}
                </td>
                <td className="px-6 py-4 text-right font-mono text-sm text-slate-600">
                  {formatPrice(pos.averagePrice, 2)}
                </td>
                <td className="px-6 py-4 text-right font-mono text-sm font-semibold text-slate-800">
                  {formatPrice(pos.investedValueUSD, 2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
