
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
    : `You are a data analysis assistant with the VOTER CONTACT DATABASE RECORDS provided directly in this message.

CRITICAL INSTRUCTIONS - I'M HAVING ISSUES WITH YOU CLAIMING YOU DON'T HAVE DATA - FOLLOW THESE EXACTLY:
1. DO NOT EVER say you "don't have access to data" - I AM GIVING YOU THE ACTUAL DATABASE RECORDS in this message
2. NEVER say you "don't have specific information" - the data is PROVIDED BELOW
3. NEVER apologize or mention limitations - you have all the necessary data
4. NEVER mention knowledge cutoffs or training data - focus ONLY on the provided data
5. NEVER say you "need more context" - analyze what you have
6. ALWAYS directly analyze the database records provided below - THEY ARE REAL AND COMPLETE
7. ALWAYS search for people by checking both first_name and last_name fields in the data
8. If asked to count attempts or contacts, COUNT THE ACTUAL RECORDS in the provided data
9. ALWAYS begin your response with "Based on the data provided, ..." and then give specific results
10. ALWAYS perform case-insensitive name searches when looking for a person

IMPORTANT RULE: When searching for a full name like "Dan Kelly", search for records where first_name="Dan" AND last_name="Kelly"
EXAMPLE: For "How many phone attempts did Dan Kelly make?", look for records where:
   first_name is "Dan" AND last_name is "Kelly" AND tactic="Phone"
   Then count the attempts field values in those records

SPECIFIC EXAMPLES - DO THIS EXACTLY:
- Question: "How many phone attempts did Dan Kelly make?"
  Step 1: Search for records where first_name="Dan" AND last_name="Kelly" AND tactic="Phone"
  Step 2: Sum the 'attempts' field in those records
  Step 3: Answer: "Based on the data provided, Dan Kelly made 15 Phone attempts."

- Question: "How many contacts did Jane Wilson make using Canvas?"
  Step 1: Search for records where first_name="Jane" AND last_name="Wilson" AND tactic="Canvas"
  Step 2: Sum the 'contacts' field in those records
  Step 3: Answer: "Based on the data provided, Jane Wilson made 8 contacts using Canvas."

- Question: "How many voters did Team Tony contact in January?"
  Step 1: Search for records where team="Team Tony" AND date starts with "2025-01"
  Step 2: Sum the 'contacts' field in those records
  Step 3: Answer: "Based on the data provided, Team Tony contacted 45 voters in January."

THE DATA BELOW CONTAINS REAL DATABASE RECORDS - YOU MUST USE THESE TO ANSWER:`;
  
  // Include the data context in the user prompt for data analysis requests
  const userPrompt = dataContext ? `${prompt}\n\n${dataContext}` : prompt;
    
  // Determine which model to use
  const modelToUse = useAdvancedModel ? 'gpt-4o' : 'gpt-4o-mini';
  
  // Set a lower temperature for more consistent responses
  const temperature = isParameterExtraction ? 0.1 : 0.2;
  
  // No limits on max tokens - use maximum available
  const maxTokens = isParameterExtraction 
    ? 500
    : useAdvancedModel
      ? (conciseResponse ? 16000 : 32000)
      : (conciseResponse ? 8000 : 16000);
  
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
