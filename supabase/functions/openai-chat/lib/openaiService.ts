
import { corsHeaders } from "./cors.ts"
import { createErrorResponse } from "./handlers.ts"

interface OpenAIParams {
  prompt: string;
  dataContext: string;
  isParameterExtraction: boolean;
  useAdvancedModel: boolean;
  conciseResponse: boolean;
  openAIApiKey: string;
  queryParams?: any;
}

// Call OpenAI API with appropriate parameters
export async function callOpenAI({
  prompt,
  dataContext,
  isParameterExtraction,
  useAdvancedModel,
  conciseResponse,
  openAIApiKey,
  queryParams
}: OpenAIParams) {
  // Use different system prompts based on the task
  const systemPrompt = isParameterExtraction 
    ? 'You are a helpful assistant that extracts structured parameters from natural language queries about voter data. Return only valid JSON with no additional text, explanations, or markdown formatting. Never use backticks or code blocks in your response, just the raw JSON. If the query mentions "phone", set tactic to "Phone". If it mentions "SMS" or "sms", set tactic to "SMS". If it mentions "canvas", set tactic to "Canvas". Be exact with person names and dates. Here are specific examples: For "How many Phone attempts did Jane Doe make on 2025-01-02?" your response must be exactly {"tactic":"Phone","person":"Jane Doe","date":"2025-01-02","resultType":"attempts"}. For "How many Phone attempts did Dan Kelly make?" your response must be exactly {"tactic":"Phone","person":"Dan Kelly","resultType":"attempts"}'
    : `You are a data analysis assistant with DIRECT ACCESS to voter contact database records that I will provide.

CRITICAL INSTRUCTIONS - FOLLOW THESE EXACTLY:
1. I am giving you REAL DATABASE RECORDS as JSON data below.
2. YOU HAVE FULL ACCESS to these records RIGHT NOW.
3. NEVER say "I don't have access to data" or that you "don't have specific information" - the data is provided to you!
4. NEVER apologize or mention limitations - you have all the necessary data.
5. NEVER mention knowledge cutoffs or training data - focus ONLY on the provided data.
6. NEVER say you "need more context" - analyze what you have!
7. ALWAYS directly search through and analyze the provided data JSON.
8. ALWAYS search for people by name in the data, checking both first_name and last_name fields.
9. If asked to count attempts or contacts, COUNT THE ACTUAL RECORDS in the provided data.
10. ALWAYS begin your response with "Based on the data provided, ..." and then give specific results.
11. If asked about a person who isn't in the data, say "Based on the data provided, I couldn't find records for [name]" - NOT that you lack access.
12. Be precise and use exact counts from the data.
13. ALWAYS perform case-insensitive name searches.
14. When searching for a full name like "Dan Kelly", search for records where first_name="Dan" AND last_name="Kelly".

EXAMPLES:
- If asked "How many phone attempts did Dan Kelly make?", you should search all records where first_name="Dan" and last_name="Kelly" and tactic="Phone", then count the attempts.
- If the records show Dan Kelly made 15 Phone attempts, say "Based on the data provided, Dan Kelly made 15 Phone attempts."
- If no records match, say "Based on the data provided, I couldn't find records for Dan Kelly."

THE DATA BELOW IS YOUR PRIMARY SOURCE - you MUST use it to answer questions:`;
  
  // Include the data context in the user prompt for data analysis requests
  const userPrompt = dataContext ? `${prompt}\n\n${dataContext}` : prompt;
    
  // Determine which model to use
  const modelToUse = useAdvancedModel ? 'gpt-4o' : 'gpt-4o-mini';
  
  // Set a lower temperature for more consistent responses
  const temperature = isParameterExtraction ? 0.1 : 0.2;
  
  // Calculate appropriate max tokens based on response type and model - no limits
  const maxTokens = isParameterExtraction 
    ? 500  // Parameter extraction needs less tokens
    : useAdvancedModel
      ? (conciseResponse ? 4000 : 16000)  // More tokens for gpt-4o
      : (conciseResponse ? 2000 : 8000);  // Increased tokens for gpt-4o-mini
  
  // Prepare the request payload
  const requestPayload = {
    model: modelToUse,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: temperature,
    max_tokens: maxTokens
  };
  
  console.log("OpenAI request:", JSON.stringify({
    model: requestPayload.model,
    messages: [
      { role: 'system', content: systemPrompt.substring(0, 100) + '...' },
      { role: 'user', content: userPrompt.substring(0, 100) + '...' }
    ],
    temperature: requestPayload.temperature,
    max_tokens: requestPayload.max_tokens
  }));
  
  // Set a timeout for the fetch operation
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 55000); // 55 second timeout
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
      signal: controller.signal
    });
    
    // Clear the timeout since the request has completed
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // Log the full OpenAI response
    console.log("Full OpenAI response:", JSON.stringify(data));
    
    return {
      answer: data.choices[0].message.content,
      finishReason: data.choices[0].finish_reason
    };
  } catch (fetchError) {
    clearTimeout(timeoutId);
    
    // Check if this was a timeout error
    if (fetchError.name === 'AbortError') {
      console.error('Fetch operation timed out');
      throw new Error("OpenAI request timed out. The server took too long to respond.");
    }
    
    // Handle other fetch errors
    console.error('Error fetching from OpenAI:', fetchError);
    throw new Error(`Error calling OpenAI API: ${fetchError.message}`);
  }
}
