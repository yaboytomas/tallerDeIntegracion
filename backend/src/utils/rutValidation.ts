/**
 * Validates and formats Chilean RUT (Rol Único Tributario)
 * Format: XX.XXX.XXX-X
 */

export interface RUTValidationResult {
  isValid: boolean;
  formatted?: string;
  error?: string;
}

/**
 * Validates RUT format and check digit
 */
export function validateRUT(rut: string): RUTValidationResult {
  // Remove dots, dashes, and spaces
  const cleanRUT = rut.replace(/[.\-\s]/g, '').toUpperCase();

  // Check format (8-9 digits + check digit)
  if (!/^\d{8,9}[0-9K]$/.test(cleanRUT)) {
    return {
      isValid: false,
      error: 'RUT debe tener 8 o 9 dígitos seguidos de un dígito verificador',
    };
  }

  const body = cleanRUT.slice(0, -1);
  const checkDigit = cleanRUT.slice(-1);

  // Calculate check digit
  let sum = 0;
  let multiplier = 2;

  // Multiply from right to left
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = sum % 11;
  let calculatedCheckDigit: string;

  if (remainder === 0) {
    calculatedCheckDigit = '0';
  } else if (remainder === 1) {
    calculatedCheckDigit = 'K';
  } else {
    calculatedCheckDigit = (11 - remainder).toString();
  }

  if (calculatedCheckDigit !== checkDigit) {
    return {
      isValid: false,
      error: 'Dígito verificador inválido',
    };
  }

  // Format RUT: XX.XXX.XXX-X
  const formatted = formatRUT(cleanRUT);

  return {
    isValid: true,
    formatted,
  };
}

/**
 * Formats RUT string to XX.XXX.XXX-X format
 */
export function formatRUT(rut: string): string {
  const cleanRUT = rut.replace(/[.\-\s]/g, '').toUpperCase();
  const body = cleanRUT.slice(0, -1);
  const checkDigit = cleanRUT.slice(-1);

  // Add dots every 3 digits from right
  let formatted = '';
  let count = 0;

  for (let i = body.length - 1; i >= 0; i--) {
    formatted = body[i] + formatted;
    count++;
    if (count === 3 && i > 0) {
      formatted = '.' + formatted;
      count = 0;
    }
  }

  return `${formatted}-${checkDigit}`;
}

/**
 * Normalizes RUT to database format (without dots/dashes)
 */
export function normalizeRUT(rut: string): string {
  return rut.replace(/[.\-\s]/g, '').toUpperCase();
}

