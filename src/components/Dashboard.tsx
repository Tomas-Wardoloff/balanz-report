'use client';

import { useMemo } from 'react';
import { Position } from '../types';
import { PortfolioDistribution } from './charts/PortfolioDistribution';
import { SectorDistribution } from './charts/SectorDistribution';
import { PositionsTable } from './PositionsTable';
import { KPICard } from './charts/KPICard';
import { NavBar } from './NavBar';

interface DashboardProps {
  positions: Position[];
  arsToUsdRate: number;
  onReset: () => void;
}

export function Dashboard({ positions, arsToUsdRate, onReset }: DashboardProps) {
  const totalInvestedUSD = useMemo(() => {
    return positions.reduce((sum, pos) => sum + pos.investedValueUSD, 0);
  }, [positions]);

  const currentTotalValueUSD = useMemo(() => {
    return positions.reduce((sum, pos) => sum + (pos.currentValueUSD || pos.investedValueUSD), 0);
  }, [positions]);

  const totalPnlAbsolute = currentTotalValueUSD - totalInvestedUSD;
  const totalPnlPercentage = totalInvestedUSD > 0 ? (totalPnlAbsolute / totalInvestedUSD) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Header */}
      <NavBar arsToUsdRate={arsToUsdRate} onReset={onReset} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Total Invertido"
          value={`US$ ${totalInvestedUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <KPICard
          title="Valor Actual"
          value={`US$ ${currentTotalValueUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          badge={`${totalPnlPercentage >= 0 ? '+' : ''}${totalPnlPercentage.toFixed(2)}%`}
          badgeColor={
            totalPnlAbsolute >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }
        />
        <KPICard
          title="P&L Global"
          value={`${totalPnlAbsolute >= 0 ? '+' : '-'}US$ ${Math.abs(totalPnlAbsolute).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          valueColor={totalPnlAbsolute >= 0 ? 'text-emerald-600' : 'text-red-600'}
        />
        <KPICard title="Posiciones Abiertas" value={positions.length.toString()} />
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
