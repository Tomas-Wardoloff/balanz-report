export interface RawOrder {
  Especie: string;
  "Num Boleto": string | number;
  Ticker: string;
  Tipo: string;
  Concertacion: string;
  Liquidacion: string;
  Cantidad: number;
  Precio: number | string;
  Bruto: number | string;
  "Costos Mercado": number | string;
  Arancel: number | string;
  Neto: number | string;
  Moneda: string;
}

export interface Position {
  ticker: string;
  sector: string;
  quantity: number;
  averagePrice: number; // in USD
  investedValueUSD: number;
}
