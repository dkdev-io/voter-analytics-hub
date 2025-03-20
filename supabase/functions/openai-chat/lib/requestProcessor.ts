
import { corsHeaders } from "./cors.ts"
import { createErrorResponse, createSuccessResponse } from "./handlers.ts"
import { fetchDataContext } from "./dataRetrieval.ts"
import { callOpenAI } from "./openaiService.ts"
import { validateResponse } from "./responseValidator.ts"

// Main request processing logic
export async function processRequest(req: Request) {
  try {
    const { 
      prompt, 
      includeData = false, 
      queryParams, 
      conciseResponse = false,
      dataSummary = null, 
      useAdvancedModel = true
    } = await req.json()
    
    if (!prompt) {
      throw new Error('No prompt provided');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Processing prompt: ${prompt.substring(0, 100)}...`);
    console.log(`Include data: ${includeData}, Data summary provided: ${!!dataSummary}`);
    console.log(`Concise response: ${conciseResponse}, Advanced model: ${useAdvancedModel}`);
    console.log(`Query parameters:`, queryParams);

    try {
      // Check if this is a parameter extraction request
      const isParameterExtraction = prompt.includes("extract structured parameters") || 
                                   prompt.includes("valid JSON object");
      
      // For data analysis requests, we need to fetch the relevant data
      let dataContext = "";
      let sampleData = [];
      
      if (includeData) {
        // Get data context (either from structured summary or by querying DB)
        const dataResult = await fetchDataContext(dataSummary, req, queryParams);
        dataContext = dataResult.dataContext;
        sampleData = dataResult.sampleData;
        
        console.log(`Retrieved ${sampleData.length} data records for validation`);
      }
      
      // Call OpenAI API
      const aiResponse = await callOpenAI({
        prompt,
        dataContext,
        isParameterExtraction,
        useAdvancedModel,
        conciseResponse,
        openAIApiKey,
        queryParams
      });
      
      // Validate and possibly fix the response using our direct data generation
      // Pass sample data and query parameters to enable fallback answer generation
      const { answer, finishReason } = await validateResponse(
        aiResponse, 
        sampleData, 
        prompt, 
        queryParams
      );
      
      // Return the final response
      return createSuccessResponse({ 
        answer,
        truncated: finishReason === 'length',
        model: useAdvancedModel ? 'gpt-4o' : 'gpt-4o-mini'
      });
    } catch (openAIError) {
      console.error('Error calling OpenAI API:', openAIError);
      return createErrorResponse(`Error calling OpenAI: ${openAIError.message}`);
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return createErrorResponse(error.message);
  }
}
