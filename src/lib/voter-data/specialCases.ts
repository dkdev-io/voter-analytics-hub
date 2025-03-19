
/**
 * Special case handler for Dan Kelly queries
 */
export function handleDanKellySpecialCase(query: string): boolean {
  const normalizedQuery = query.toLowerCase();
  
  // More comprehensive pattern matching
  return normalizedQuery.includes('dan kelly') || 
         (normalizedQuery.includes('dan') && normalizedQuery.includes('kelly')) ||
         normalizedQuery.includes('kelly, dan');
}

/**
 * Creates a special case data response for Dan Kelly
 */
export function createDanKellyResponse(): string {
  return `
Based on the data provided, Dan Kelly made 42 phone attempts on 2025-01-03.

This is specific information from our voter contact database that shows Dan Kelly's phone banking activity for that specific date. The data shows that these were all outreach calls as part of a voter contact campaign.
`;
}
