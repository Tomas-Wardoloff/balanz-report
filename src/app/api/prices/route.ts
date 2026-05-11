import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export async function POST(request: Request) {
  try {
    const { tickers } = await request.json();

    if (!tickers || !Array.isArray(tickers)) {
      return NextResponse.json({ error: 'Invalid tickers array' }, { status: 400 });
    }

    const pricesMap: Record<string, { price: number; currency: string }> = {};

    // Call quote for each ticker individually so one invalid ticker doesn't crash the whole batch
    await Promise.allSettled(
      tickers.map(async (ticker: string) => {
        try {
          const queryTicker = ticker.includes('.') ? ticker : `${ticker}.BA`;
          const quote = await yahooFinance.quote(queryTicker);
          
          if (quote && quote.regularMarketPrice && quote.currency) {
            pricesMap[ticker] = {
              price: quote.regularMarketPrice,
              currency: quote.currency
            };
          }
        } catch (err: any) {
          console.warn(`Could not fetch quote for ${ticker}:`, err.message || err);
        }
      })
    );

    return NextResponse.json(pricesMap);
  } catch (error) {
    console.error('Error fetching prices from Yahoo Finance:', error);
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 });
  }
}
