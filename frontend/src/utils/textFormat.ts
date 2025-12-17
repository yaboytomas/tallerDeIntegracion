/**
 * Converts newlines (\n) to HTML <br> tags for proper display
 */
export function nl2br(text: string): string {
  if (!text) return '';
  return text.replace(/\n/g, '<br>');
}

/**
 * Preserves newlines and converts them to HTML for display with dangerouslySetInnerHTML
 */
export function formatTextWithNewlines(text: string): string {
  if (!text) return '';
  
  // Replace newlines with <br> tags
  let formatted = text.replace(/\n/g, '<br>');
  
  // Also handle carriage returns
  formatted = formatted.replace(/\r\n/g, '<br>');
  formatted = formatted.replace(/\r/g, '<br>');
  
  return formatted;
}

