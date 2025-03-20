
import { corsHeaders } from "./cors.ts"

// Handle OPTIONS requests for CORS
export function handleOptionsRequest() {
  return new Response(null, { headers: corsHeaders });
}

// Create error response with proper formatting
export function createErrorResponse(message: string, status: number = 500) {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

// Create success response with proper formatting
export function createSuccessResponse(data: any) {
  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
