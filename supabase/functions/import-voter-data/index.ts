
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
      return new Response(
        JSON.stringify({ success: true, message: `Data already exists (${count} records)` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Sample voter contact data - This would be replaced with actual data from Google Sheets
    const sampleData = [
      {
        first_name: "John",
        last_name: "Smith",
        team: "Team A",
        tactic: "Phone Banking",
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
        tactic: "Canvassing",
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
        tactic: "Texting",
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
        tactic: "Phone Banking",
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
        tactic: "Canvassing",
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
    
    // Insert data into Supabase
    const { error: insertError } = await supabase
      .from('voter_contacts')
      .insert(sampleData);
    
    if (insertError) {
      console.error('Error inserting data:', insertError);
      return new Response(
        JSON.stringify({ error: 'Error inserting data', details: insertError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    return new Response(
      JSON.stringify({ success: true, message: `Imported ${sampleData.length} records` }),
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
