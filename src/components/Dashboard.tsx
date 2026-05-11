'use client';

import { useMemo, useState } from 'react';
import { AnimatedCurrency } from './AnimatedCurrency';
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
  const [globalCurrency, setGlobalCurrency] = useState<'USD' | 'ARS'>('USD');

  const totalInvestedUSD = useMemo(() => {
    return positions.reduce((sum, pos) => sum + pos.investedValueUSD, 0);
  }, [positions]);

  const currentTotalValueUSD = useMemo(() => {
    return positions.reduce((sum, pos) => sum + (pos.currentValueUSD || pos.investedValueUSD), 0);
  }, [positions]);

  const currencyMultiplier = globalCurrency === 'USD' ? 1 : arsToUsdRate;

  const totalInvested = totalInvestedUSD * currencyMultiplier;
  const currentTotalValue = currentTotalValueUSD * currencyMultiplier;
  const totalPnlAbsolute = (currentTotalValueUSD - totalInvestedUSD) * currencyMultiplier;
  const totalPnlPercentage =
    totalInvestedUSD > 0 ? ((currentTotalValueUSD - totalInvestedUSD) / totalInvestedUSD) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Header */}
      <NavBar
        arsToUsdRate={arsToUsdRate}
        onReset={onReset}
        currency={globalCurrency}
        onCurrencyChange={setGlobalCurrency}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Total Invertido"
          value={<AnimatedCurrency value={totalInvested} currency={globalCurrency} />}
        />
        <KPICard
          title="Valor Actual"
          value={<AnimatedCurrency value={currentTotalValue} currency={globalCurrency} />}
        />
        <KPICard
          title="P&L Global"
          value={<AnimatedCurrency value={totalPnlAbsolute} currency={globalCurrency} showSign />}
          valueColor={totalPnlAbsolute >= 0 ? 'text-emerald-600' : 'text-red-600'}
          badge={`${totalPnlPercentage >= 0 ? '+' : ''}${totalPnlPercentage.toFixed(2)}%`}
          badgeColor={
            totalPnlAbsolute >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }
        />
        <KPICard title="Posiciones Abiertas" value={positions.length.toString()} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PortfolioDistribution
          positions={positions}
          arsToUsdRate={arsToUsdRate}
          currency={globalCurrency}
        />
        <SectorDistribution
          positions={positions}
          arsToUsdRate={arsToUsdRate}
          currency={globalCurrency}
        />
      </div>

      {/* Table */}
      <PositionsTable positions={positions} arsToUsdRate={arsToUsdRate} currency={globalCurrency} />
    </div>
  );
}
