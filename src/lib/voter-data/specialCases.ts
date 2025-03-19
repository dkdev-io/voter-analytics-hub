
/**
 * Special case handler for Dan Kelly queries - currently disabled to allow for user dataset upload
 */
export function handleDanKellySpecialCase(query: string): boolean {
  // Return false to disable special case handling
  return false;
}

/**
 * Creates a special case data response for Dan Kelly - currently disabled
 */
export function createDanKellyResponse(): string {
  // Return empty message as this feature is disabled
  return "";
}

/**
 * Determine if the prompt is asking about Dan Kelly - currently disabled
 * This version is specifically for use in the OpenAI edge function
 */
export function isDanKellyQuery(prompt: string): boolean {
  // Return false to disable special case handling
  return false;
}
