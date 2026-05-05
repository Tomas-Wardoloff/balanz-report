"use client";

import React, { useMemo } from "react";
import { Position } from "../types";
import { PortfolioDistribution } from "./charts/PortfolioDistribution";
import { SectorDistribution } from "./charts/SectorDistribution";
import { PositionsTable } from "./PositionsTable";
import { TrendingUp, LayoutGrid, ChevronLeft } from "lucide-react";

interface DashboardProps {
  positions: Position[];
  arsToUsdRate: number;
  onReset: () => void;
}

export function Dashboard({ positions, arsToUsdRate, onReset }: DashboardProps) {
  const totalInvestedUSD = useMemo(() => {
    return positions.reduce((sum, pos) => sum + pos.investedValueUSD, 0);
  }, [positions]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Balanz Report</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard de Inversiones</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Costo histórico consolidado
            {arsToUsdRate ? (
              <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-mono font-medium">
                TC: ${arsToUsdRate.toLocaleString('es-AR')}
              </span>
            ) : (
              <span className="ml-1.5 text-slate-400">· sólo activos en USD</span>
            )}
          </p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium text-sm shadow-sm"
        >
          <ChevronLeft size={15} />
          Subir otro archivo
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white px-6 py-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp size={20} strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Total Invertido</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              USD {totalInvestedUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="bg-white px-6 py-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <LayoutGrid size={20} strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Posiciones Abiertas</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">{positions.length}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PortfolioDistribution positions={positions} arsToUsdRate={arsToUsdRate} />
        <SectorDistribution positions={positions} arsToUsdRate={arsToUsdRate} />
      </div>

      {/* Table */}
      <PositionsTable positions={positions} arsToUsdRate={arsToUsdRate} />
    </div>
  );
}
