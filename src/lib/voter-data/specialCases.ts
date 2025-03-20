
/**
 * Special case handling is completely disabled
 * These functions are kept for backward compatibility but return false/empty values
 */
export function handleSpecialCase(query: string): boolean {
  // Always return false to completely disable special case handling
  return false;
}

/**
 * Creates a special case data response - completely disabled
 */
export function createSpecialResponse(): string {
  // Return empty message as this feature is disabled
  return "";
}

/**
 * Determine if the prompt is asking about a special case - completely disabled
 * This version is specifically for use in the OpenAI edge function
 */
export function isSpecialQuery(prompt: string): boolean {
  // Always return false to completely disable special case handling
  return false;
}
