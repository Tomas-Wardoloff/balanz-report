import * as XLSX from 'xlsx';
import { RawOrder } from '../types';

function parseNumber(value: number | string): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  // Handle comma as decimal separator if it's a string
  const stringVal = String(value).replace(/\./g, '').replace(/,/g, '.');
  return parseFloat(stringVal) || 0;
}

export async function parseExcelFile(file: File): Promise<RawOrder[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to JSON, assuming the first row is the header
        const rawData = XLSX.utils.sheet_to_json<any>(sheet, { defval: '' });

        // Normalize the data
        const orders: RawOrder[] = rawData
          .map((row) => {
            // Find keys that might have leading/trailing spaces
            const getVal = (keyStr: string) => {
              const key = Object.keys(row).find((k) => k.trim() === keyStr);
              return key ? row[key] : '';
            };

            return {
              Especie: getVal('Especie'),
              'Num Boleto': getVal('Num Boleto'),
              Ticker: getVal('Ticker'),
              Tipo: getVal('Tipo').toUpperCase(),
              Concertacion: getVal('Concertacion'),
              Liquidacion: getVal('Liquidacion'),
              Cantidad: parseNumber(getVal('Cantidad')),
              Precio: parseNumber(getVal('Precio')),
              Bruto: parseNumber(getVal('Bruto')),
              'Costos Mercado': parseNumber(getVal('Costos Mercado')),
              Arancel: parseNumber(getVal('Arancel')),
              Neto: parseNumber(getVal('Neto')),
              Moneda: getVal('Moneda'),
            };
          })
          .filter((order) => order.Ticker && order.Cantidad > 0);

        resolve(orders);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
}
