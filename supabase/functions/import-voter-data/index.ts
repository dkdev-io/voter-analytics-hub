
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    // Get the Supabase URL and key from environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    console.log("Starting import-voter-data function with URL:", supabaseUrl);
    
    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Check if we already have data
    const { count, error: countError } = await supabase
      .from('voter_contacts')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error checking existing data:', countError);
      return new Response(
        JSON.stringify({ error: 'Error checking existing data', details: countError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    console.log(`Found ${count} existing records in voter_contacts table`);
    
    // If we already have data, return success without importing
    if (count && count > 0) {
      // Do a sanity check query to make sure data is actually accessible
      const { data: testData, error: testError } = await supabase
        .from('voter_contacts')
        .select('*')
        .limit(5);
      
      if (testError) {
        console.error('Error fetching test data:', testError);
      } else {
        console.log(`Successfully fetched ${testData.length} test records`);
        console.log('Sample record:', testData[0]);
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Data already exists (${count} records)`,
          sample: testData || []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Generate more sample data for testing - more variety
    const sampleData = [];
    const teams = ["Team A", "Team B", "Team C", "Team D"];
    const tactics = ["Phone", "Canvas", "SMS", "Email"];
    const firstNames = ["John", "Jane", "Alice", "Bob", "Carol", "David", "Eva", "Frank"];
    const lastNames = ["Smith", "Doe", "Johnson", "Brown", "White", "Miller", "Wilson", "Taylor"];
    const dates = ["2023-04-01", "2023-04-02", "2023-04-03", "2023-04-04", "2023-04-05"];
    
    // Generate 50 records with diverse data
    for (let i = 0; i < 50; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const team = teams[Math.floor(Math.random() * teams.length)];
      const tactic = tactics[Math.floor(Math.random() * tactics.length)];
      const date = dates[Math.floor(Math.random() * dates.length)];
      
      const attempts = Math.floor(Math.random() * 100) + 1;
      const contacts = Math.floor(Math.random() * attempts) + 1;
      const notHome = Math.floor(Math.random() * (attempts - contacts));
      const badData = attempts - contacts - notHome;
      const support = Math.floor(Math.random() * contacts);
      const oppose = Math.floor(Math.random() * (contacts - support));
      const undecided = contacts - support - oppose;
      
      sampleData.push({
        first_name: firstName,
        last_name: lastName,
        team: team,
        tactic: tactic,
        date: date,
        attempts: attempts,
        contacts: contacts,
        not_home: notHome,
        bad_data: badData,
        support: support,
        oppose: oppose,
        undecided: undecided,
        refusal: 0
      });
    }
    
    console.log(`Generated ${sampleData.length} sample records for import`);
    
    // Delete any existing data first to prevent conflicts
    console.log("Clearing existing data before import...");
    const { error: deleteError } = await supabase
      .from('voter_contacts')
      .delete()
      .neq('id', 0); // This will delete all records
      
    if (deleteError) {
      console.error('Error deleting existing data:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Error deleting existing data', details: deleteError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    // Insert data into Supabase
    console.log("Inserting sample data...");
    const { data, error: insertError } = await supabase
      .from('voter_contacts')
      .insert(sampleData)
      .select();
    
    if (insertError) {
      console.error('Error inserting data:', insertError);
      return new Response(
        JSON.stringify({ error: 'Error inserting data', details: insertError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    console.log(`Successfully inserted ${data.length} records`);
    
    // Fetch the inserted data to confirm it worked
    const { data: confirmData, error: confirmError } = await supabase
      .from('voter_contacts')
      .select('*');
      
    if (confirmError) {
      console.error('Error confirming data insertion:', confirmError);
    } else {
      console.log(`Successfully confirmed ${confirmData.length} records in the database`);
      console.log('Sample of confirmed data:', confirmData.slice(0, 2));
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Imported ${sampleData.length} records`,
        count: confirmData ? confirmData.length : null,
        sample: data.slice(0, 3) // Include sample of the imported data in response
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Unexpected error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
