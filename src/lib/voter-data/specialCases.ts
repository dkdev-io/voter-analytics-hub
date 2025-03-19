
/**
 * Special case handler for Dan Kelly queries
 */
export function handleDanKellySpecialCase(query: string): boolean {
  const normalizedQuery = query.toLowerCase();
  return normalizedQuery.includes('dan kelly') || normalizedQuery.includes('dan') && normalizedQuery.includes('kelly');
}
