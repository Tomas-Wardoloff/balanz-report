'use client';

import { useMemo, useState } from 'react';
import { Position, RawOrder } from '@/types';
import { PortfolioDistribution } from '@/components/charts/PortfolioDistribution';
import { AssetTypeDistribution } from '@/components/charts/AssetTypeDistribution';
import { PositionsTable } from '@/components/PositionsTable';
import { NavBar } from '@/components/NavBar';
import { EvolutionChart } from '@/components/charts/EvolutionChart';
import { PrivacyProvider } from '@/context/PrivacyContext';
import { KPICardsGrid } from '@/components/KPICardsGrid';

interface DashboardProps {
  positions: Position[];
  orders: RawOrder[];
  arsToUsdRate: number;
  onReset: () => void;
}

export function Dashboard({ positions, orders, arsToUsdRate, onReset }: DashboardProps) {
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
    <PrivacyProvider>
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Header */}
        <NavBar
          arsToUsdRate={arsToUsdRate}
          onReset={onReset}
          currency={globalCurrency}
          onCurrencyChange={setGlobalCurrency}
        />

        {/* KPI Cards */}
        <KPICardsGrid
          positions={positions}
          globalCurrency={globalCurrency}
          totalInvested={totalInvested}
          currentTotalValue={currentTotalValue}
          totalPnlAbsolute={totalPnlAbsolute}
          totalPnlPercentage={totalPnlPercentage}
        />

        {/* Charts */}
        <EvolutionChart
          orders={orders}
          positions={positions}
          arsToUsdRate={arsToUsdRate}
          currency={globalCurrency}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PortfolioDistribution
            positions={positions}
            arsToUsdRate={arsToUsdRate}
            currency={globalCurrency}
          />
          <AssetTypeDistribution
            positions={positions}
            arsToUsdRate={arsToUsdRate}
            currency={globalCurrency}
          />
        </div>

        {/* Table */}
        <PositionsTable
          positions={positions}
          arsToUsdRate={arsToUsdRate}
          currency={globalCurrency}
        />
      </div>
    </PrivacyProvider>
  );
}
