
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
    
    // Sample voter contact data - This would be replaced with actual data from Google Sheets
    const sampleData = [
      {
        first_name: "John",
        last_name: "Smith",
        team: "Team A",
        tactic: "Phone",
        date: "2023-04-01",
        attempts: 25,
        contacts: 10,
        not_home: 8,
        bad_data: 7,
        support: 5,
        oppose: 3,
        undecided: 2,
        refusal: 0
      },
      {
        first_name: "Jane",
        last_name: "Doe",
        team: "Team B",
        tactic: "Canvas",
        date: "2023-04-02",
        attempts: 50,
        contacts: 25,
        not_home: 15,
        bad_data: 10,
        support: 15,
        oppose: 5,
        undecided: 5,
        refusal: 0
      },
      {
        first_name: "Alice",
        last_name: "Johnson",
        team: "Team A",
        tactic: "SMS",
        date: "2023-04-03",
        attempts: 75,
        contacts: 30,
        not_home: 0,
        bad_data: 45,
        support: 20,
        oppose: 5,
        undecided: 5,
        refusal: 0
      },
      {
        first_name: "Bob",
        last_name: "Brown",
        team: "Team C",
        tactic: "Phone",
        date: "2023-04-01",
        attempts: 30,
        contacts: 15,
        not_home: 10,
        bad_data: 5,
        support: 8,
        oppose: 4,
        undecided: 3,
        refusal: 0
      },
      {
        first_name: "Carol",
        last_name: "White",
        team: "Team B",
        tactic: "Canvas",
        date: "2023-04-03",
        attempts: 40,
        contacts: 20,
        not_home: 10,
        bad_data: 10,
        support: 12,
        oppose: 3,
        undecided: 5,
        refusal: 0
      }
    ];
    
    // Delete any existing data first to prevent conflicts
    const { error: deleteError } = await supabase
      .from('voter_contacts')
      .delete()
      .neq('id', 0); // This will delete all records
      
    if (deleteError) {
      console.error('Error deleting existing data:', deleteError);
    }
    
    // Insert data into Supabase
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
    
    // Fetch the inserted data to confirm it worked
    const { data: confirmData, error: confirmError } = await supabase
      .from('voter_contacts')
      .select('*');
      
    if (confirmError) {
      console.error('Error confirming data insertion:', confirmError);
    } else {
      console.log(`Successfully confirmed ${confirmData.length} records in the database`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Imported ${sampleData.length} records`,
        count: confirmData ? confirmData.length : null
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
