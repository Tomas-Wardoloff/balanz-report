export const ASSET_TYPES = {
  CEDEAR: 'CEDEAR',
  ACCION: 'Acción',
  ON: 'Oblig. Negociable',
  BONO_PUBLICO: 'Bono Público',
  FCI: 'Fondo Común',
  OTRO: 'Otro',
} as const;

export type AssetType = (typeof ASSET_TYPES)[keyof typeof ASSET_TYPES];

const BONO_PUBLICO_KEYWORDS = [
  'REPUBLICA ARGENTINA',
  'NACION ARGENTINA',
  'PROVINCIA DE',
  'MUNICIPALIDAD',
  'BOPREAL',
  'LECAP',
  'LEBAC',
  'LETES',
  'BONO DEL TESORO',
  'BONAR',
  'GLOBAL',
  'DISCOUNT',
];

const ON_KEYWORDS = ['REG S', 'REGS', 'OBLIGACION NEGOCIABLE', ' ON ', ' ON$', 'SENIOR'];

export function getAssetType(especie: string, ticker: string): AssetType {
  const especieUpper = especie.toUpperCase().trim();
  const tickerUpper = ticker.toUpperCase().trim();

  // CEDEARs are always labeled explicitly
  if (especieUpper.startsWith('CEDEAR') || especieUpper.includes('CEDEAR')) {
    return ASSET_TYPES.CEDEAR;
  }

  if (
    especieUpper.includes('FONDO') ||
    especieUpper.includes(' FCI') ||
    especieUpper.includes('F.C.I')
  ) {
    return ASSET_TYPES.FCI;
  }

  if (BONO_PUBLICO_KEYWORDS.some((kw) => especieUpper.includes(kw))) {
    return ASSET_TYPES.BONO_PUBLICO;
  }

  const hasOnKeyword = ON_KEYWORDS.some((kw) => especieUpper.includes(kw));
  const looksLikeBond =
    /\d+[.,]\d+%/.test(especieUpper) &&
    (/\bV\s+\d{2}\//.test(especieUpper) || especieUpper.includes('VTO'));

  if (hasOnKeyword || looksLikeBond) {
    return ASSET_TYPES.ON;
  }

  if (tickerUpper.length <= 5) {
    return ASSET_TYPES.ACCION;
  }

  return ASSET_TYPES.OTRO;
}
