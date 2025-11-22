/**
 * Generate URL-friendly slug from string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate unique slug by appending number if needed
 */
export async function generateUniqueSlug(
  baseText: string,
  checkUnique: (slug: string) => Promise<boolean>,
  maxAttempts: number = 10
): Promise<string> {
  let slug = generateSlug(baseText);
  let attempts = 0;

  while (attempts < maxAttempts) {
    const isUnique = await checkUnique(slug);
    if (isUnique) {
      return slug;
    }
    attempts++;
    slug = `${generateSlug(baseText)}-${attempts}`;
  }

  // Fallback: append timestamp
  return `${generateSlug(baseText)}-${Date.now()}`;
}

