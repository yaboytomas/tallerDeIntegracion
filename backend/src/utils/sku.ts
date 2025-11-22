/**
 * Generate SKU (Stock Keeping Unit)
 */
export function generateSKU(prefix: string = 'JSP', length: number = 8): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 2 + (length - prefix.length - timestamp.length)).toUpperCase();
  return `${prefix}-${random}${timestamp.slice(-4)}`;
}

/**
 * Validate SKU format
 */
export function validateSKU(sku: string): boolean {
  // Allow alphanumeric with hyphens, 3-20 characters
  return /^[A-Z0-9-]{3,20}$/i.test(sku);
}

