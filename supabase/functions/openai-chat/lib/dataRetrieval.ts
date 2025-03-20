
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

// Fetch data context either from structured summary or by querying DB
export async function fetchDataContext(dataSummary: any, req: Request, queryParams: any) {
  let dataContext = "";
  let sampleData = [];
  
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

IMPORTANT: Use this data to answer the question comprehensively. Refer to specific numbers and statistics from the provided data summary.`;
    
    console.log("Using structured data summary for context");
  } else {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Build query based on parameters
    let query = supabase.from('voter_contacts').select('*');
    
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
      
      // For any person queries, use more structured name matching
      if (queryParams.person) {
        const personName = queryParams.person.trim();
        // Split the name to check first and last name separately
        const nameParts = personName.split(' ');
        
        if (nameParts.length > 1) {
          // Extract first and last name
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ');
          
          console.log(`Looking for person with first_name=${firstName} and last_name=${lastName}`);
          
          // Try to match both first and last name exactly first
          query = query.or(`and(first_name.ilike.${firstName},last_name.ilike.${lastName}),and(first_name.ilike.%${firstName}%,last_name.ilike.%${lastName}%)`);
        } else {
          // Single name part - search in both first and last name
          query = query.or(`first_name.ilike.%${personName}%,last_name.ilike.%${personName}%`);
        }
      }
      
      if (queryParams.tactic) {
        query = query.ilike('tactic', `%${queryParams.tactic}%`);
      }
      
      if (queryParams.date) {
        query = query.eq('date', queryParams.date);
      }
      
      if (queryParams.team && queryParams.team !== 'All') {
        query = query.ilike('team', `%${queryParams.team}%`);
      }
    }
    
    // First get a count of the total matching records
    const { count, error: countError } = await query.count();
    
    if (countError) {
      console.error('Error counting data:', countError);
    } else {
      console.log(`Total matching records: ${count || 0}`);
    }
    
    // No limits on data size - retrieve all records for better context
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching data from Supabase:', error);
    } else if (data && data.length > 0) {
      sampleData = data;
      console.log("Retrieved data from Supabase:", data.length, "records");
      console.log("Raw database response sample (first 3 records):", JSON.stringify(data.slice(0, 3)));
      
      // For large datasets, also fetch aggregated statistics
      let statsContext = "";
      
      if (count && count > 20) {
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
IMPORTANT STATISTICS FOR THE ENTIRE DATASET (${count} total records):

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
YOU HAVE ACCESS TO THE FOLLOWING DATABASE RECORDS:

DATABASE RECORDS (${data.length} of ${count || 'unknown'} total records):
${JSON.stringify(data)}

${statsContext || ''}

EXTREMELY IMPORTANT INSTRUCTIONS:
1. The above data shows voter contact records. ANSWER ANY QUESTIONS USING ONLY THIS DATA.
2. YOU MUST NEVER refuse to answer or claim you don't have access to data. This data is RIGHT HERE.
3. NEVER say phrases like "I don't have access", "I'd need access", "my knowledge is limited", or similar.
4. If the user asks about a person, search through the data for that name. For full names like "Dan Kelly", search for records where first_name="Dan" AND last_name="Kelly".
5. If asked to count something (like "How many phone attempts"), COUNT IT using the data above.
6. If the data doesn't contain what was asked for, simply say "Based on the data provided, I couldn't find records for [X]."
7. ALWAYS begin your response with "Based on the data provided..."
8. The data contains records with fields like first_name, last_name, tactic (Phone/SMS/Canvas), attempts, etc.
9. A "Phone attempt" refers to the "attempts" field in records where "tactic" is "Phone".
10. These are REAL DATABASE RECORDS that you can directly analyze right now.
11. DO NOT ask for more context - all the data you need is above.
12. I expect you to COUNT records and CALCULATE totals from the data provided.

YOU ARE ANALYZING REAL VOTER CONTACT DATA FROM THE DATABASE SHOWN ABOVE.`;
      
      console.log(`Retrieved ${data.length} records for context`);
    } else {
      dataContext = "Note: No matching data was found for the specified criteria. The database query returned 0 results.";
      console.log("No matching data found");
    }
  }
  
  return { dataContext, sampleData };
}
