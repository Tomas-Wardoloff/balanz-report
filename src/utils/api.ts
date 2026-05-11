export async function fetchDolarRate(): Promise<number> {
  try {
    const response = await fetch('https://dolarapi.com/v1/dolares/bolsa');
    if (!response.ok) {
      throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();

    return data.venta;
  } catch (error) {
    console.error('Error obteniendo Dólar MEP:', error);
    throw error;
  }
}

export async function fetchCurrentPrices(
  tickers: string[]
): Promise<Record<string, { price: number; currency: string }>> {
  if (!tickers || tickers.length === 0) return {};

  try {
    const response = await fetch('/api/prices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tickers }),
    });

    if (!response.ok) {
      throw new Error(`Error fetching prices: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in fetchCurrentPrices:', error);
    return {};
  }
}
