/**
 * Format amount in Naira with proper number formatting
 * @param amount - The amount to format
 * @param showDecimals - Whether to show decimal places (default: true)
 * @returns Formatted amount string with ₦ prefix
 */
export function formatAmount(amount: number, showDecimals: boolean = true): string {
  if (showDecimals) {
    return `₦${amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }
  return `₦${amount.toLocaleString('en-US', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  })}`;
}

/**
 * Format amount without currency symbol (for calculations or displays where symbol is separate)
 * @param amount - The amount to format
 * @param showDecimals - Whether to show decimal places (default: true)
 * @returns Formatted amount string without currency symbol
 */
export function formatAmountOnly(amount: number, showDecimals: boolean = true): string {
  if (showDecimals) {
    return amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  }
  return amount.toLocaleString('en-US', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  });
}

/**
 * Format a number string for input display (with thousand separators)
 * @param value - The input value (can be a string or number)
 * @returns Formatted string with thousand separators
 */
export function formatNumberInput(value: string | number): string {
  if (!value && value !== 0) return '';
  
  // Remove all non-digit characters except decimal point
  const numericString = String(value).replace(/[^\d.]/g, '');
  
  // Split by decimal point
  const parts = numericString.split('.');
  const integerPart = parts[0] || '';
  const decimalPart = parts[1] || '';
  
  // Format integer part with thousand separators
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Limit decimal part to 2 digits
  const formattedDecimal = decimalPart.slice(0, 2);
  
  // Combine parts
  if (formattedDecimal) {
    return `${formattedInteger}.${formattedDecimal}`;
  }
  return formattedInteger;
}

/**
 * Parse a formatted number string back to a numeric value
 * @param value - The formatted string value
 * @returns Numeric value or NaN if invalid
 */
export function parseFormattedNumber(value: string): number {
  if (!value) return NaN;
  
  // Remove all non-digit characters except decimal point
  const numericString = value.replace(/[^\d.]/g, '');
  
  const parsed = parseFloat(numericString);
  return isNaN(parsed) ? NaN : parsed;
}
