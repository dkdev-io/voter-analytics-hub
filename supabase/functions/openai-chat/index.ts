
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
      let sampleData = []
      
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
          
          const { data, error } = await limitedQuery;
          
          if (error) {
            console.error('Error fetching data from Supabase:', error);
          } else if (data && data.length > 0) {
            sampleData = data;
            console.log("Retrieved data from Supabase:", data.length, "records");
            console.log("Raw database response sample (first 3 records):", JSON.stringify(data.slice(0, 3)));
            
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
            
            // Format the data for inclusion in the prompt - using VERY EXPLICIT instructions
            dataContext = `
IMPORTANT: I AM PROVIDING YOU WITH DATABASE RECORDS BELOW. YOU HAVE FULL ACCESS TO THIS DATA.

DATABASE RECORDS PROVIDED (${data.length} of ${count || 'unknown'} total records):
${JSON.stringify(data)}

${statsContext || ''}

CRITICAL INSTRUCTIONS:
1. USE ONLY THIS DATA to answer questions. DO NOT refuse to answer.
2. NEVER say phrases like "I don't have access", "I need more context", or anything similar.
3. If asked about a specific person (e.g., "Dan Kelly"), search through the data for that name.
4. If asked to count or calculate something, do so using ONLY this data.
5. Provide the EXACT numerical answer based on the data above.
6. ALWAYS acknowledge the data. Say "Based on the provided data, I found X records..."
7. YOU HAVE THE DATA RIGHT HERE. You are directly seeing database records.
8. If you can't find something specific, explain what IS in the data instead.

You are analyzing voter contact data such as phone calls, text messages, etc.`;
            
            console.log(`Retrieved ${data.length} records for context`);
          } else {
            dataContext = "Note: No matching data was found for the specified criteria. The database query returned 0 results.";
            console.log("No matching data found");
          }
        }
      }
      
      // Use different system prompts based on the task
      const systemPrompt = isParameterExtraction 
        ? 'You are a helpful assistant that extracts structured parameters from natural language queries about voter data. Return only valid JSON with no additional text, explanations, or markdown formatting. Never use backticks or code blocks in your response, just the raw JSON. If the query mentions "phone", set tactic to "Phone". If it mentions "SMS" or "sms", set tactic to "SMS". If it mentions "canvas", set tactic to "Canvas". Be exact with person names and dates. Here are specific examples: For "How many Phone attempts did Jane Doe make on 2025-01-02?" your response must be exactly {"tactic":"Phone","person":"Jane Doe","date":"2025-01-02","resultType":"attempts"}'
        : `You are an analyst working directly with voter contact database records.

EXTREMELY IMPORTANT - READ THIS CAREFULLY:
1. You have DIRECT ACCESS to the database records I am about to share with you.
2. These records contain real data that you can see and analyze.
3. NEVER say you "don't have access to data" - the data is provided below.
4. NEVER mention any limitations or inability to access information.
5. NEVER ask for more context - use what you have.
6. If asked about a specific person, FIND THAT PERSON in the data.
7. If asked to count something, COUNT IT using the data.
8. Always give a direct answer with specific numbers from the data.
9. If you can't find exactly what was asked for, EXPLAIN WHAT YOU DO SEE in the data.
10. Your response MUST begin with "Based on the data provided, I found..."`;
      
      // Include the data context in the user prompt for data analysis requests
      const userPrompt = includeData && dataContext 
        ? `${prompt}\n\n${dataContext}`
        : prompt
        
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

        // Blacklist of phrases that indicate the AI is ignoring our instructions
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
          "i apologize",
          "i need more context",
          "could you please clarify",
          "please provide more information",
          "i need more information"
        ];
        
        // Check if the answer contains any blacklisted phrases
        const containsBlacklistedPhrase = blacklistedPhrases.some(phrase => 
          answer.toLowerCase().includes(phrase)
        );
        
        if (containsBlacklistedPhrase) {
          console.log("WARNING: OpenAI response contains blacklisted phrases indicating it's ignoring data context");
          
          // CREATE A MANUAL ANSWER BASED ON THE DATA
          // This is our fallback when the AI insists it doesn't have access
          let directAnswer = "Based on the data provided, ";
          
          if (!sampleData || sampleData.length === 0) {
            directAnswer += "I found no matching records for your query.";
          } else {
            // Check if we're looking for a specific person
            if (queryParams && queryParams.person) {
              const personName = queryParams.person.toLowerCase();
              const personRecords = sampleData.filter(record => 
                (record.first_name + ' ' + record.last_name).toLowerCase().includes(personName)
              );
              
              if (personRecords.length > 0) {
                directAnswer += `I found ${personRecords.length} records for ${queryParams.person}. `;
                
                // If we're also looking for a specific tactic
                if (queryParams.tactic) {
                  const tacticRecords = personRecords.filter(record => 
                    record.tactic && record.tactic.toLowerCase() === queryParams.tactic.toLowerCase()
                  );
                  
                  const totalAttempts = tacticRecords.reduce((sum, record) => sum + (record.attempts || 0), 0);
                  directAnswer += `There are ${totalAttempts} ${queryParams.tactic} attempts by ${queryParams.person}. `;
                } else {
                  // Sum all attempts for this person
                  const totalAttempts = personRecords.reduce((sum, record) => sum + (record.attempts || 0), 0);
                  directAnswer += `The total number of attempts by ${queryParams.person} is ${totalAttempts}. `;
                }
                
                // Add date information if applicable
                if (queryParams.date) {
                  const dateRecords = personRecords.filter(record => record.date === queryParams.date);
                  if (dateRecords.length > 0) {
                    const dateAttempts = dateRecords.reduce((sum, record) => sum + (record.attempts || 0), 0);
                    directAnswer += `On ${queryParams.date}, ${queryParams.person} made ${dateAttempts} attempts. `;
                  } else {
                    directAnswer += `No records found for ${queryParams.person} on ${queryParams.date}. `;
                  }
                }
              } else {
                directAnswer += `I found no records for ${queryParams.person} in the data. `;
              }
            } 
            // If we're just looking for a specific tactic
            else if (queryParams && queryParams.tactic) {
              const tacticRecords = sampleData.filter(record => 
                record.tactic && record.tactic.toLowerCase() === queryParams.tactic.toLowerCase()
              );
              
              if (tacticRecords.length > 0) {
                const totalAttempts = tacticRecords.reduce((sum, record) => sum + (record.attempts || 0), 0);
                directAnswer += `I found ${totalAttempts} total ${queryParams.tactic} attempts across ${tacticRecords.length} records. `;
                
                // Add date information if applicable
                if (queryParams.date) {
                  const dateRecords = tacticRecords.filter(record => record.date === queryParams.date);
                  if (dateRecords.length > 0) {
                    const dateAttempts = dateRecords.reduce((sum, record) => sum + (record.attempts || 0), 0);
                    directAnswer += `On ${queryParams.date}, there were ${dateAttempts} ${queryParams.tactic} attempts. `;
                  } else {
                    directAnswer += `No ${queryParams.tactic} records found for ${queryParams.date}. `;
                  }
                }
              } else {
                directAnswer += `I found no records for ${queryParams.tactic} in the data. `;
              }
            }
            // General data overview
            else {
              const totalAttempts = sampleData.reduce((sum, record) => sum + (record.attempts || 0), 0);
              directAnswer += `I found ${sampleData.length} records with a total of ${totalAttempts} attempts. `;
              
              // Summarize tactics if available
              const tactics = {};
              sampleData.forEach(record => {
                if (record.tactic) {
                  tactics[record.tactic] = (tactics[record.tactic] || 0) + (record.attempts || 0);
                }
              });
              
              if (Object.keys(tactics).length > 0) {
                directAnswer += "Breakdown by tactic: ";
                Object.entries(tactics).forEach(([tactic, attempts]) => {
                  directAnswer += `${tactic}: ${attempts} attempts. `;
                });
              }
            }
          }
          
          answer = directAnswer;
        }

        console.log("Final answer:", answer.substring(0, 100) + "...");
        
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
