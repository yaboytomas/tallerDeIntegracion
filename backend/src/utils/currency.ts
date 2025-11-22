/**
 * Currency formatting utilities for Chilean Pesos (CLP)
 */

const IVA_RATE = 0.19; // 19% IVA

/**
 * Calculate price with IVA included
 */
export function calculatePriceWithIVA(price: number): number {
  return Math.round(price * (1 + IVA_RATE));
}

/**
 * Calculate price without IVA (from IVA-included price)
 */
export function calculatePriceWithoutIVA(priceWithIVA: number): number {
  return Math.round(priceWithIVA / (1 + IVA_RATE));
}

/**
 * Get IVA amount from price with IVA
 */
export function getIVAAmount(priceWithIVA: number): number {
  return Math.round(priceWithIVA - calculatePriceWithoutIVA(priceWithIVA));
}

/**
 * Format price as CLP currency string
 * Example: 15000 -> "$15.000"
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
export function formatPriceWithIVABreakdown(price: number): {
  basePrice: number;
  iva: number;
  total: number;
  formatted: {
    basePrice: string;
    iva: string;
    total: string;
  };
} {
  const basePrice = calculatePriceWithoutIVA(price);
  const iva = getIVAAmount(price);
  const total = price;

  return {
    basePrice,
    iva,
    total,
    formatted: {
      basePrice: formatCLP(basePrice),
      iva: formatCLP(iva),
      total: formatCLP(total),
    },
  };
}

