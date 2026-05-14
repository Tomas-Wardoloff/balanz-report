import { RawOrder, Position } from '../types';
import { getAssetType } from './assetTypes';
import { parseOrderDate } from './parser';

export function calculatePositions(orders: RawOrder[], arsToUsdRate: number): Position[] {
  const sortedOrders = [...orders].sort((a, b) => {
    return parseOrderDate(a.Concertacion).getTime() - parseOrderDate(b.Concertacion).getTime();
  });

  const positionMap = new Map<
    string,
    { quantity: number; totalCostUSD: number; especie: string }
  >();

  for (const order of sortedOrders) {
    const isUSD =
      order.Moneda.toLowerCase().includes('dólar') || order.Moneda.toLowerCase().includes('dollar');
    const rate = isUSD ? 1 : arsToUsdRate > 0 ? 1 / arsToUsdRate : 0;

    // We use Neto for total value, if it's not present we could use Precio * Cantidad
    const orderNetoUSD = Number(order.Neto) * rate;

    const currentPos = positionMap.get(order.Ticker) || {
      quantity: 0,
      totalCostUSD: 0,
      especie: order.Especie || '',
    };

    if (order.Tipo === 'COMPRA') {
      currentPos.quantity += order.Cantidad;
      currentPos.totalCostUSD += orderNetoUSD;
    } else if (order.Tipo === 'VENTA') {
      // Calculate average price before sale
      const avgPriceUSD =
        currentPos.quantity > 0 ? currentPos.totalCostUSD / currentPos.quantity : 0;
      currentPos.quantity -= order.Cantidad;
      // Subtract the cost basis of the sold shares
      currentPos.totalCostUSD -= order.Cantidad * avgPriceUSD;

      // Prevent floating point errors from leaving small negative balances
      if (currentPos.quantity <= 0) {
        currentPos.quantity = 0;
        currentPos.totalCostUSD = 0;
      }
    }

    positionMap.set(order.Ticker, currentPos);
  }

  const positions: Position[] = [];

  positionMap.forEach((pos, ticker) => {
    if (pos.quantity > 0) {
      const avgPrice = pos.totalCostUSD / pos.quantity;
      positions.push({
        ticker,
        assetType: getAssetType(pos.especie, ticker),
        quantity: pos.quantity,
        averagePrice: avgPrice,
        investedValueUSD: pos.totalCostUSD,
      });
    }
  });

  // Sort by invested value descending
  return positions.sort((a, b) => b.investedValueUSD - a.investedValueUSD);
}
