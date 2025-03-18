
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
      dataSummary = null // Parameter for structured data summary
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
    console.log(`Concise response: ${conciseResponse}`)

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
          
          dataContext = `
Here is a summary of the voter contact data:

Total rows: ${dataSummary.totalRows}

Column statistics:
${JSON.stringify(dataSummary.columnStats, null, 2)}

Sample rows:
${JSON.stringify(dataSummary.sampleRows, null, 2)}

Based on this data summary, please answer the user's question. Focus on providing specific insights and numerical values from the data. If the data is insufficient to answer the question completely, acknowledge that limitation in your response.`
          
          console.log("Using structured data summary for context");
        } else {
          // Initialize Supabase client
          const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
          const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
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
          
          // Then get a sample of the data
          // Limit has to be reasonable for the prompt - we'll use aggregation for large datasets
          const { data: sampleData, error } = await query.limit(50);
          
          if (error) {
            console.error('Error fetching data from Supabase:', error);
          } else if (sampleData && sampleData.length > 0) {
            console.log("Retrieved data from Supabase:", sampleData.length, "records");
            
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
                  statsContext = `
Here are the aggregated statistics for the entire dataset (${count} records):

Tactic statistics:
${JSON.stringify(tacticStats.data, null, 2)}

Team statistics:
${JSON.stringify(teamStats.data, null, 2)}

Date statistics:
${JSON.stringify(dateStats.data, null, 2)}
`;
                }
              } catch (statsError) {
                console.error('Error fetching statistics:', statsError);
                // Continue with sample data only if stats fail
              }
            }
            
            // Format the data for inclusion in the prompt
            dataContext = `
Here is a sample of the relevant voter contact data (showing ${sampleData.length} out of ${count || 'unknown'} records):
${JSON.stringify(sampleData, null, 2)}

${statsContext}

Based on this data${count && count > 50 ? ' and the aggregated statistics' : ''}, please answer the user's question. If the data is insufficient to answer the question completely, acknowledge that limitation in your response.`
            
            console.log(`Retrieved ${sampleData.length} records for context`);
          } else {
            dataContext = "Note: No matching data was found for the specified criteria.";
            console.log("No matching data found");
          }
        }
      }
      
      // Use different system prompts based on the task
      const systemPrompt = isParameterExtraction 
        ? 'You are a helpful assistant that extracts structured parameters from natural language queries about voter data. Return only valid JSON with no additional text, explanations, or markdown formatting. Never use backticks or code blocks in your response, just the raw JSON. If the query mentions "phone", set tactic to "Phone". If it mentions "SMS" or "sms", set tactic to "SMS". If it mentions "canvas", set tactic to "Canvas". Be exact with person names and dates. Here are specific examples: For "How many Phone attempts did Jane Doe make on 2025-01-02?" your response must be exactly {"tactic":"Phone","person":"Jane Doe","date":"2025-01-02","resultType":"attempts"}'
        : conciseResponse 
          ? `You are a data analyst providing insights about voter contact data. Your responses should be concise, emphasizing key numbers and insights. Always directly answer the user's question with specific numbers from the data provided. Remember that you have access to the data shown in the context section - use it to provide accurate answers. Never say you don't have access to the data when it's provided to you. If the data provided doesn't contain the exact information requested, analyze what is available and provide the closest relevant insight.`
          : `You are a helpful assistant that analyzes voter contact data and provides clear, concise insights. Your responses should be insightful, data-driven, and focused on answering the user's specific question. Be precise in your analysis and use specific numbers from the data when applicable. Present your findings in a way that's easy to understand. Remember that you have access to the data shown in the context section - never say you don't have access to the data when it's provided to you.`
      
      // Include the data context in the user prompt for data analysis requests
      const userPrompt = includeData && dataContext 
        ? `${prompt}\n\n${dataContext}`
        : prompt
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: isParameterExtraction ? 0.1 : 0.7, // Lower temperature for more deterministic results in parameter extraction
          max_tokens: conciseResponse ? 150 : 500, // Less tokens for concise responses
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('OpenAI API Error:', error)
        return new Response(
          JSON.stringify({ error: `OpenAI API error: ${error.error?.message || 'Unknown error'}` }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const data = await response.json()
      const answer = data.choices[0].message.content

      // Log for debugging
      console.log("OpenAI answer:", answer.substring(0, 100) + "...")

      return new Response(
        JSON.stringify({ answer }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (openAIError) {
      console.error('Error calling OpenAI API:', openAIError)
      return new Response(
        JSON.stringify({ error: `Error calling OpenAI: ${openAIError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
  } catch (error) {
    console.error('Error in openai-chat function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
