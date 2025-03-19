
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
      useAdvancedModel = false // New parameter to toggle more powerful model
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
            
            // Format the data for inclusion in the prompt - using compact JSON to save tokens
            dataContext = `
Here is a sample of the relevant voter contact data (showing ${sampleData.length} out of ${count || 'unknown'} records):
${JSON.stringify(sampleData)}

${statsContext}

IMPORTANT: You MUST use the data above to provide a specific, data-driven answer to the user's question. DO NOT say you don't have access to the data - it's provided right here for you to analyze. If you can't find exact information for the query, analyze what IS available and provide the closest relevant insight.`
            
            console.log(`Retrieved ${sampleData.length} records for context`);
          } else {
            dataContext = "Note: No matching data was found for the specified criteria. Please provide an answer based on this fact, without claiming you don't have access to data.";
            console.log("No matching data found");
          }
        }
      }
      
      // Use different system prompts based on the task
      const systemPrompt = isParameterExtraction 
        ? 'You are a helpful assistant that extracts structured parameters from natural language queries about voter data. Return only valid JSON with no additional text, explanations, or markdown formatting. Never use backticks or code blocks in your response, just the raw JSON. If the query mentions "phone", set tactic to "Phone". If it mentions "SMS" or "sms", set tactic to "SMS". If it mentions "canvas", set tactic to "Canvas". Be exact with person names and dates. Here are specific examples: For "How many Phone attempts did Jane Doe make on 2025-01-02?" your response must be exactly {"tactic":"Phone","person":"Jane Doe","date":"2025-01-02","resultType":"attempts"}'
        : conciseResponse 
          ? `You are a data analyst providing insights about voter contact data. Your responses should be concise, emphasizing key numbers and insights. Always directly answer the user's question with specific numbers from the data provided. NEVER say you don't have access to the data - it's provided in the context of this message. You have full access to analyze the voter contact data shown. If the exact data requested isn't available, analyze what IS available and provide the closest relevant insight. Focus on being helpful and data-driven.`
          : `You are a helpful assistant that analyzes voter contact data and provides clear, concise insights. Your responses should be insightful, data-driven, and focused on answering the user's specific question. Be precise in your analysis and use specific numbers from the data when applicable. Present your findings in a way that's easy to understand. NEVER say you don't have access to the data - it's provided in the context of this message and you have full access to analyze it. If the exact data requested isn't available, analyze what IS available and provide the closest relevant insight.`
      
      // Include the data context in the user prompt for data analysis requests
      const userPrompt = includeData && dataContext 
        ? `${prompt}\n\n${dataContext}`
        : prompt
        
      // Determine which model to use based on complexity
      const modelToUse = useAdvancedModel ? 'gpt-4o' : 'gpt-4o-mini';
      
      // Calculate appropriate max tokens based on response type and model
      // gpt-4o-mini has 128K context window, gpt-4o has 128K context window
      // We'll use higher values for more complex analyses
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
        temperature: isParameterExtraction ? 0.1 : 0.7,
        max_tokens: maxTokens
      };
      
      console.log("OpenAI request:", JSON.stringify({
        model: requestPayload.model,
        messages: [
          { role: 'system', content: systemPrompt.substring(0, 100) + '...' },
          { role: 'user', content: prompt.substring(0, 100) + '...' }
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
        
        // Added: Log the full OpenAI response
        console.log("Full OpenAI response:", JSON.stringify(data));
        
        const answer = data.choices[0].message.content;

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
