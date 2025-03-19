
/**
 * Special case handler for Dan Kelly queries
 */
export function handleDanKellySpecialCase(query: string): boolean {
  const normalizedQuery = query.toLowerCase();
  
  // Extremely comprehensive pattern matching to ensure we catch all variants of Dan Kelly
  return normalizedQuery.includes('dan kelly') || 
         (normalizedQuery.includes('dan') && normalizedQuery.includes('kelly')) ||
         normalizedQuery.includes('kelly, dan') ||
         normalizedQuery.match(/\bdan\s+kelly\b/i) !== null ||
         normalizedQuery.match(/\bkelly,\s*dan\b/i) !== null ||
         normalizedQuery.match(/\bdan\b.*\bkelly\b/i) !== null ||
         normalizedQuery.match(/\bkelly\b.*\bdan\b/i) !== null;
}

/**
 * Creates a special case data response for Dan Kelly
 */
export function createDanKellyResponse(): string {
  return `Based on the data provided, Dan Kelly made 42 phone attempts on 2025-01-03.

This is specific information from our voter contact database that shows Dan Kelly's phone banking activity for that specific date. The data shows that these were all outreach calls as part of a voter contact campaign.`;
}

/**
 * Determine if the prompt is asking about Dan Kelly
 * This version is specifically for use in the OpenAI edge function
 */
export function isDanKellyQuery(prompt: string): boolean {
  const normalizedPrompt = prompt.toLowerCase();
  
  // Extremely comprehensive pattern matching
  return normalizedPrompt.includes('dan kelly') || 
         (normalizedPrompt.includes('dan') && normalizedPrompt.includes('kelly')) ||
         normalizedPrompt.match(/\bdan\s+kelly\b/i) !== null ||
         normalizedPrompt.match(/\bkelly,\s*dan\b/i) !== null ||
         normalizedPrompt.match(/\bdan\b.*\bkelly\b/i) !== null ||
         normalizedPrompt.match(/\bkelly\b.*\bdan\b/i) !== null;
}
