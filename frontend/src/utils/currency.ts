/**
 * Format price as CLP currency string
 */
export function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format price with IVA breakdown
 */
export function formatPriceWithIVABreakdown(priceWithIVA: number): {
  basePrice: number;
  iva: number;
  total: number;
} {
  const basePrice = Math.round(priceWithIVA / 1.19);
  const iva = priceWithIVA - basePrice;
  return {
    basePrice,
    iva,
    total: priceWithIVA,
  };
}

