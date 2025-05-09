
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

// Fetch data context either from structured summary or by querying DB
export async function fetchDataContext(dataSummary: any, req: Request, queryParams: any) {
  let dataContext = "";
  let sampleData = [];
  
  // If we have a structured data summary, use that instead of querying the database
  if (dataSummary) {
    console.log("Using provided data summary instead of querying database");
    
    // Format the data summary for better comprehension by the AI
    const formattedColumnStats = JSON.stringify(dataSummary.columnStats, null, 2);
    const formattedSampleRows = JSON.stringify(dataSummary.sampleRows, null, 2);
    
    dataContext = `
VOTER CONTACT DATABASE SUMMARY:

Total records: ${dataSummary.totalRows}

Column information:
${formattedColumnStats}

Sample records:
${formattedSampleRows}

IMPORTANT DATABASE STRUCTURE:
- Records contain fields like: first_name, last_name, team, date, tactic, attempts, contacts, support, oppose, undecided, etc.
- When searching for a person like "Dan Kelly", you MUST find records where first_name="Dan" AND last_name="Kelly".
- For counting attempts, contacts, etc., always look at the appropriate numeric fields in the matching records.
- NEVER say you "don't have access to data" or need "more context" - all the data you need is provided above.

ALWAYS perform your analysis using ONLY the data provided above.`;
    
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
      
      // Enhanced person name handling
      if (queryParams.person) {
        const personName = queryParams.person.trim();
        // Split the name to check first and last name separately
        const nameParts = personName.split(' ');
        
        if (nameParts.length > 1) {
          // Extract first and last name for more precise querying
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ');
          
          console.log(`Looking for person with first_name="${firstName}" and last_name="${lastName}"`);
          
          // Try exact match first, then fallback to partial match
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
    
    // Get all matching records - no arbitrary limits
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
            // Format statistics for better AI understanding
            statsContext = `
AGGREGATED STATISTICS FOR THE ENTIRE DATASET (${count} total records):

Tactic statistics (attempts by tactic):
${JSON.stringify(tacticStats.data, null, 2)}

Team statistics (results by team):
${JSON.stringify(teamStats.data, null, 2)}

Date statistics (results by date):
${JSON.stringify(dateStats.data, null, 2)}
`;
          }
        } catch (statsError) {
          console.error('Error fetching statistics:', statsError);
          // Continue with sample data only if stats fail
        }
      }
      
      // Format the data for inclusion in the prompt with explicit instructions
      dataContext = `
VOTER CONTACT DATABASE RECORDS [${data.length} records]:

${JSON.stringify(data, null, 2)}

${statsContext}

CRITICAL INSTRUCTIONS FOR DATA ANALYSIS:
1. The above JSON contains REAL voter contact records from the database. USE THIS DATA to answer all questions.
2. EACH RECORD contains fields: first_name, last_name, team, date, tactic, attempts, contacts, support, oppose, undecided, etc.
3. When looking for a person like "Dan Kelly", FIND RECORDS where first_name="Dan" AND last_name="Kelly".
4. For questions like "How many phone attempts did Dan Kelly make?", COUNT the attempts field in records where first_name="Dan" AND last_name="Kelly" AND tactic="Phone".
5. ALWAYS begin responses with "Based on the data provided, ..."
6. NEVER say "I don't have access to data" or "I don't have information" - the complete data is provided above.
7. DO NOT ASK for more context - all the data you need is in the JSON above.

THE QUESTION IS ABOUT THIS EXACT DATA - ANALYZE IT DIRECTLY.`;
      
      console.log(`Retrieved ${data.length} records for context`);
    } else {
      dataContext = "Note: No matching data was found for the specified criteria. The database query returned 0 results.";
      console.log("No matching data found");
    }
  }
  
  return { dataContext, sampleData };
}
