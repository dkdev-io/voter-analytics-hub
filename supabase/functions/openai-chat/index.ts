
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { corsHeaders } from "./lib/cors.ts"
import { handleOptionsRequest } from "./lib/handlers.ts"
import { processRequest } from "./lib/requestProcessor.ts"

// Main server function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    // Process the main request
    return await processRequest(req);
  } catch (error) {
    console.error('Error in openai-chat function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
