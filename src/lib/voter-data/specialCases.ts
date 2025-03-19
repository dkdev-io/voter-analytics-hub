
/**
 * Special case handler - completely disabled
 */
export function handleDanKellySpecialCase(query: string): boolean {
  // Always return false to completely disable special case handling
  return false;
}

/**
 * Creates a special case data response - completely disabled
 */
export function createDanKellyResponse(): string {
  // Return empty message as this feature is disabled
  return "";
}

/**
 * Determine if the prompt is asking about a special case - completely disabled
 * This version is specifically for use in the OpenAI edge function
 */
export function isDanKellyQuery(prompt: string): boolean {
  // Always return false to completely disable special case handling
  return false;
}
