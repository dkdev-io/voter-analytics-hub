
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
    ? 'You are a helpful assistant that extracts structured parameters from natural language queries about voter data. Return only valid JSON with no additional text, explanations, or markdown formatting. Never use backticks or code blocks in your response, just the raw JSON. If the query mentions "phone", set tactic to "Phone". If it mentions "SMS" or "sms", set tactic to "SMS". If it mentions "canvas", set tactic to "Canvas". Be exact with person names and dates. Here are specific examples: For "How many Phone attempts did Jane Doe make on 2025-01-02?" your response must be exactly {"tactic":"Phone","person":"Jane Doe","date":"2025-01-02","resultType":"attempts"}'
    : `You are a data analysis assistant with DIRECT ACCESS to voter contact database records that I will provide.

THIS IS EXTREMELY IMPORTANT - FOLLOWS THESE RULES EXACTLY:
1. I am giving you ACTUAL DATABASE RECORDS in JSON format below.
2. YOU HAVE FULL ACCESS to these records RIGHT NOW.
3. NEVER state that you "don't have access to data" - the data is provided to you.
4. NEVER mention limitations, knowledge cutoffs, or ask for more information.
5. NEVER say "I don't have specific information about..." - look at the provided data instead.
6. NEVER use phrases like "As an AI" or refer to your training data.
7. IMMEDIATELY SEARCH through the provided data for relevant information.
8. If asked about a person (like "Dan Kelly"), SEARCH through the provided data JSON for records with that name.
9. If asked to count something, COUNT IT USING THE PROVIDED DATA. For example, if asked "How many phone calls did Dan Kelly make?", directly count those records.
10. ALWAYS begin your response with "Based on the data provided, ..."
11. Be factual and specific, providing exact numbers when the data shows them.
12. UNDER NO CIRCUMSTANCES ask for more context or claim you can't answer without more information.

These database records are arranged as JSON objects with properties like:
- first_name & last_name: The person's name
- tactic: "Phone", "SMS", or "Canvas"
- attempts: Number of contact attempts
- date: Date of the record

CRITICAL: The JSON data that follows this prompt IS YOUR DATA SOURCE. You have DIRECT ACCESS to it. ALWAYS use this data to answer questions and NEVER claim you lack access to it.

FOR "DAN KELLY" QUERIES: If someone asks about "Dan Kelly", SPECIFICALLY LOOK for records where first_name+last_name contains "Dan Kelly" - these records ARE in the data if they exist.`;
  
  // Include the data context in the user prompt for data analysis requests
  const userPrompt = dataContext ? `${prompt}\n\n${dataContext}` : prompt;
    
  // Determine which model to use
  const modelToUse = useAdvancedModel ? 'gpt-4o' : 'gpt-4o-mini';
  
  // Set a moderate temperature to avoid repetitive responses but still be accurate
  const temperature = isParameterExtraction ? 0.1 : 0.3;
  
  // Calculate appropriate max tokens based on response type and model
  const maxTokens = isParameterExtraction 
    ? 500  // Parameter extraction needs less tokens
    : useAdvancedModel
      ? (conciseResponse ? 2000 : 8000)  // More tokens for gpt-4o
      : (conciseResponse ? 1000 : 4000); // Increased tokens for gpt-4o-mini
  
  // For Dan Kelly queries, add special debugging information
  if (queryParams && queryParams.person && queryParams.person.toLowerCase().includes("dan kelly")) {
    console.log("Dan Kelly query detected - using enhanced prompt");
    // Lower temperature for more consistent answers 
    temperature = 0.1;
  }
  
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
