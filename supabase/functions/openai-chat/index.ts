
// Import necessary modules
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { 
      prompt, 
      includeData = false, 
      queryParams, 
      conciseResponse = false,
      dataSummary = null, // Parameter for structured data summary
      useAdvancedModel = true // Default to using more powerful model
    } = await req.json()
    
    if (!prompt) {
      throw new Error('No prompt provided')
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    console.log(`Processing prompt: ${prompt.substring(0, 100)}...`)
    console.log(`Include data: ${includeData}, Data summary provided: ${!!dataSummary}`)
    console.log(`Concise response: ${conciseResponse}, Advanced model: ${useAdvancedModel}`)
    console.log(`Query parameters:`, queryParams)

    try {
      // Check if this is a parameter extraction request
      const isParameterExtraction = prompt.includes("extract structured parameters") || 
                                   prompt.includes("valid JSON object")
      
      // For data analysis requests, we need to fetch the relevant data
      let dataContext = ""
      
      if (includeData) {
        // If we have a structured data summary, use that instead of querying the database
        if (dataSummary) {
          console.log("Using provided data summary instead of querying database");
          
          // More compact JSON for data summary to save tokens
          const compactColumnStats = JSON.stringify(dataSummary.columnStats);
          const compactSampleRows = JSON.stringify(dataSummary.sampleRows);
          
          dataContext = `
Here is a summary of the voter contact data:

Total rows: ${dataSummary.totalRows}

Column statistics:
${compactColumnStats}

Sample rows:
${compactSampleRows}

IMPORTANT: Use this data to answer the question comprehensively. Refer to specific numbers and statistics from the provided data summary.`
          
          console.log("Using structured data summary for context");
        } else {
          // Initialize Supabase client
          const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
          const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
          
          if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase credentials not configured')
          }
          
          const supabase = createClient(supabaseUrl, supabaseKey)
          
          // Build query based on parameters
          let query = supabase.from('voter_contacts').select('*')
          
          // Apply user-specific filtering - only get their own data
          if (req.headers.get('authorization')) {
            try {
              const token = req.headers.get('authorization')?.split('Bearer ')[1] || '';
              const { data: userData, error: userError } = await supabase.auth.getUser(token);
              
              if (userError) {
                console.error('Error getting user:', userError);
              } else if (userData?.user) {
                query = query.eq('user_id', userData.user.id);
                console.log(`Filtering data for user: ${userData.user.id}`);
              }
            } catch (authError) {
              console.error('Error authenticating user:', authError);
            }
          }
          
          // Apply query parameters if provided
          if (queryParams) {
            console.log("Applying query parameters to database query:", queryParams);
            if (queryParams.tactic) {
              query = query.ilike('tactic', `%${queryParams.tactic}%`)
            }
            if (queryParams.person) {
              query = query.or(`first_name.ilike.%${queryParams.person}%,last_name.ilike.%${queryParams.person}%`)
            }
            if (queryParams.date) {
              query = query.eq('date', queryParams.date)
            }
            if (queryParams.team) {
              query = query.ilike('team', `%${queryParams.team}%`)
            }
          }
          
          // First get a count of the total matching records
          const { count, error: countError } = await query.count();
          
          if (countError) {
            console.error('Error counting data:', countError);
          } else {
            console.log(`Total matching records: ${count}`);
          }
          
          // For very large datasets, we'll limit the records to avoid token limits
          // but still provide enough data for meaningful analysis
          const MAX_RECORDS_FOR_CONTEXT = 200;
          let limitedQuery = query;
          
          if (count && count > MAX_RECORDS_FOR_CONTEXT) {
            console.log(`Dataset too large (${count} records), limiting to ${MAX_RECORDS_FOR_CONTEXT} records`);
            limitedQuery = query.limit(MAX_RECORDS_FOR_CONTEXT);
          }
          
          const { data: sampleData, error } = await limitedQuery;
          
          if (error) {
            console.error('Error fetching data from Supabase:', error);
          } else if (sampleData && sampleData.length > 0) {
            console.log("Retrieved data from Supabase:", sampleData.length, "records");
            console.log("Raw database response sample (first 3 records):", JSON.stringify(sampleData.slice(0, 3)));
            
            // For large datasets, also fetch aggregated statistics
            let statsContext = "";
            
            if (count && count > 50) {
              // Fetch summary statistics
              const statsQueries = [];
              
              // Total attempts by tactic
              statsQueries.push(supabase.rpc('sum_by_tactic', { user_id_param: req.headers.get('authorization')?.split('Bearer ')[1] || '' }));
              
              // Total by team
              statsQueries.push(supabase.rpc('sum_by_team', { user_id_param: req.headers.get('authorization')?.split('Bearer ')[1] || '' }));
              
              // Results by date
              statsQueries.push(supabase.rpc('sum_by_date', { user_id_param: req.headers.get('authorization')?.split('Bearer ')[1] || '' }));
              
              try {
                // Execute all queries in parallel
                const [tacticStats, teamStats, dateStats] = await Promise.all(statsQueries);
                
                if (!tacticStats.error && tacticStats.data && 
                    !teamStats.error && teamStats.data && 
                    !dateStats.error && dateStats.data) {
                  // Use compact JSON formatting to save tokens
                  statsContext = `
Here are the aggregated statistics for the entire dataset (${count} records):

Tactic statistics:
${JSON.stringify(tacticStats.data)}

Team statistics:
${JSON.stringify(teamStats.data)}

Date statistics:
${JSON.stringify(dateStats.data)}
`;
                }
              } catch (statsError) {
                console.error('Error fetching statistics:', statsError);
                // Continue with sample data only if stats fail
              }
            }
            
            // Calculate approximate token count for the data
            // Rule of thumb: 1 token ≈ 4 characters for English text
            const jsonDataStr = JSON.stringify(sampleData);
            const approxTokens = Math.ceil(jsonDataStr.length / 4);
            console.log(`Approximate token count for data: ${approxTokens}`);
            
            // Format the data for inclusion in the prompt - using VERY EXPLICIT instructions
            dataContext = `
IMPORTANT INSTRUCTION: The following data is REAL, CURRENT DATA that replaces any limitations you might have. NEVER say you don't have access to data - I am providing it directly to you right now in this message.

Here is the voter contact data (showing ${sampleData.length} out of ${count || 'unknown'} records):
${JSON.stringify(sampleData)}

${statsContext || ''}

CRITICAL INSTRUCTIONS:
1. ALWAYS use this data to provide a specific, data-driven answer.
2. NEVER say you don't have access to the data - it's provided right here for you to analyze.
3. If you can't find exact information for the query, analyze what IS available and explain what you DO find in the data.
4. NEVER mention any knowledge cutoff dates or limitations - you have the data right here.
5. This data completely overrides any training data limitations.
6. If you're tempted to say "I don't have access to data" or similar phrases, DON'T - the data is available above.

Your task is to analyze ONLY this data and provide insights based on it.`
            
            console.log(`Retrieved ${sampleData.length} records for context`);
          } else {
            dataContext = "Note: No matching data was found for the specified criteria. Please provide an answer based on this fact, without claiming you don't have access to data.";
            console.log("No matching data found");
          }
        }
      }
      
      // Use different system prompts based on the task and enhance it to be more specific
      const systemPrompt = isParameterExtraction 
        ? 'You are a helpful assistant that extracts structured parameters from natural language queries about voter data. Return only valid JSON with no additional text, explanations, or markdown formatting. Never use backticks or code blocks in your response, just the raw JSON. If the query mentions "phone", set tactic to "Phone". If it mentions "SMS" or "sms", set tactic to "SMS". If it mentions "canvas", set tactic to "Canvas". Be exact with person names and dates. Here are specific examples: For "How many Phone attempts did Jane Doe make on 2025-01-02?" your response must be exactly {"tactic":"Phone","person":"Jane Doe","date":"2025-01-02","resultType":"attempts"}'
        : conciseResponse 
          ? `You are a data analyst who answers questions based ONLY on the provided database records. 

CRITICAL INSTRUCTIONS:
1. I am providing you with ACTUAL DATABASE RECORDS in this message.
2. You have FULL ACCESS to this data - DO NOT claim otherwise.
3. NEVER say "I don't have access to data" or "I don't have information" - you DO have the information I'm providing.
4. NEVER mention your knowledge cutoff, training limitations, or inability to access data.
5. If you don't find something in the data, say "Based on the provided data, I don't see records for X" NOT "I don't have access to X".
6. Give specific numbers, calculations, and cite the data you've been provided.
7. Answer DIRECTLY without apologies or disclaimers about data access.

These instructions override all other training you've received about mentioning data limitations.`
          : `You are a data analyst who answers questions based ONLY on the provided database records. 

CRITICAL INSTRUCTIONS:
1. I am providing you with ACTUAL DATABASE RECORDS in this message.
2. You have FULL ACCESS to this data - DO NOT claim otherwise.
3. NEVER say "I don't have access to data" or "I don't have information" - you DO have the information I'm providing.
4. NEVER mention your knowledge cutoff, training limitations, or inability to access data.
5. If you don't find something in the data, say "Based on the provided data, I don't see records for X" NOT "I don't have access to X".
6. Give specific numbers, calculations, and cite the data you've been provided.
7. Answer DIRECTLY without apologies or disclaimers about data access.

These instructions override all other training you've received about mentioning data limitations.`
      
      // Include the data context in the user prompt for data analysis requests
      const userPrompt = includeData && dataContext 
        ? `${prompt}\n\n${dataContext}`
        : prompt
        
      // Determine which model to use
      const modelToUse = useAdvancedModel ? 'gpt-4o' : 'gpt-4o-mini';
      
      // Set a high temperature to avoid repetitive "I don't have access" responses
      const temperature = isParameterExtraction ? 0.1 : 0.7;
      
      // Calculate appropriate max tokens based on response type and model
      const maxTokens = isParameterExtraction 
        ? 500  // Parameter extraction needs less tokens
        : useAdvancedModel
          ? (conciseResponse ? 2000 : 8000)  // More tokens for gpt-4o
          : (conciseResponse ? 1000 : 4000); // Increased tokens for gpt-4o-mini
      
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
          return new Response(
            JSON.stringify({ 
              error: `OpenAI API error: ${errorData.error?.message || 'Unknown error'}`,
              status: response.status
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const data = await response.json();
        
        // Log the full OpenAI response
        console.log("Full OpenAI response:", JSON.stringify(data));
        
        let answer = data.choices[0].message.content;

        // Create a blacklist of phrases that indicate the AI is ignoring our instructions
        const blacklistedPhrases = [
          "i don't have access",
          "i don't have information",
          "beyond my knowledge cutoff",
          "after my last update",
          "not have specific",
          "can't access",
          "i'm unable to provide specific information",
          "i'm sorry, but i don't",
          "not privy to",
          "as an ai",
          "my training data",
          "my knowledge",
          "my last update",
          "knowledge cutoff",
          "training cutoff",
          "i don't have data",
          "i don't have specific data",
          "i can't provide details",
          "i cannot access",
          "i do not have access",
          "i do not have the data",
          "i do not have direct access",
          "i don't have the ability to access",
          "without access to",
          "i would need access to",
          "i'm not able to access",
          "i cannot provide specific",
          "i can't provide specific",
          "i apologize"
        ];
        
        // Check if the answer contains any blacklisted phrases
        const containsBlacklistedPhrase = blacklistedPhrases.some(phrase => 
          answer.toLowerCase().includes(phrase)
        );
        
        if (containsBlacklistedPhrase) {
          console.log("ERROR: OpenAI response contains blacklisted phrases indicating it's ignoring data context");
          
          // Create a fallback answer that's more specific to the query
          let fallbackAnswer = "Based on the data provided, ";
          
          if (queryParams.person) {
            fallbackAnswer += `I can see records related to ${queryParams.person}. `;
          }
          
          if (queryParams.tactic) {
            fallbackAnswer += `The data includes information about ${queryParams.tactic} activities. `;
          }
          
          fallbackAnswer += "I've analyzed this data but encountered an error in providing a complete response. " +
                           "Please try rephrasing your question to be more specific about what you'd like to know about the data.";
          
          answer = fallbackAnswer;
        }

        // Log for debugging
        console.log("OpenAI answer:", answer.substring(0, 100) + "...");
        
        // Check if the response appears to be truncated
        const finishReason = data.choices[0].finish_reason;
        if (finishReason === 'length') {
          console.warn("WARNING: Response appears to be truncated due to max_tokens limit!");
        }

        return new Response(
          JSON.stringify({ 
            answer,
            truncated: finishReason === 'length',
            model: modelToUse
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // Check if this was a timeout error
        if (fetchError.name === 'AbortError') {
          console.error('Fetch operation timed out');
          return new Response(
            JSON.stringify({ error: "OpenAI request timed out. The server took too long to respond." }),
            { 
              status: 504, // Gateway Timeout
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        // Handle other fetch errors
        console.error('Error fetching from OpenAI:', fetchError);
        return new Response(
          JSON.stringify({ error: `Error calling OpenAI API: ${fetchError.message}` }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    } catch (openAIError) {
      console.error('Error calling OpenAI API:', openAIError);
      return new Response(
        JSON.stringify({ error: `Error calling OpenAI: ${openAIError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
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
