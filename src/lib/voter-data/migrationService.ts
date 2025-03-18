
// This file contains functions for importing and migrating voter data into Supabase
import { supabase } from '@/integrations/supabase/client';

// Type for voter contact data
export interface VoterContactRow {
  id?: number;
  first_name: string;
  last_name: string;
  team: string;
  date: string;
  tactic: string;
  attempts: number; 
  contacts: number;
  not_home: number;
  refusal: number;
  bad_data: number;
  support: number;
  oppose: number;
  undecided: number;
  user_id?: string | null;
}

// Return value for the migration function
interface MigrationResult {
  success: boolean;
  message: string;
}

// Function to get test voter data from Supabase
export const getTestData = async (): Promise<VoterContactRow[]> => {
  try {
    console.log("Fetching data from Supabase...");
    
    // Get the current user's ID
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    
    let query = supabase
      .from('voter_contacts')
      .select('*')
      .limit(1000);
      
    // If user is logged in, fetch only their data + any system data (null user_id)
    if (userId) {
      query = query.or(`user_id.eq.${userId},user_id.is.null`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching voter data from Supabase:", error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log("No data found in Supabase");
      return [];
    }
    
    console.log(`Retrieved ${data.length} records from Supabase`);
    console.log("Sample data:", data.slice(0, 2));
    
    return data as VoterContactRow[];
  } catch (error) {
    console.error("Error in getTestData:", error);
    return [];
  }
};

// Function to check Supabase connection and create/migrate data
export const migrateTestDataToSupabase = async (forceRefresh = false): Promise<MigrationResult> => {
  try {
    console.log("Checking Supabase connection...");
    
    // First, check if we can connect to Supabase
    const { data: testData, error: testError } = await supabase
      .from('voter_contacts')
      .select('*')
      .limit(1);
    
    if (testError && testError.code !== 'PGRST116') {
      // If it's not just an empty result error
      console.error("Supabase connection test failed:", testError);
      return { 
        success: false, 
        message: `Failed to connect to Supabase: ${testError.message}` 
      };
    }
    
    console.log("Supabase connection successful");
    
    // Get the current user's ID
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    
    // Check if we have data in the table
    const { count, error: countError } = await supabase
      .from('voter_contacts')
      .select('*', { count: 'exact', head: true })
      // If user is logged in, check for their data or system data
      .or(userId ? `user_id.eq.${userId},user_id.is.null` : 'user_id.is.null');
    
    if (countError) {
      console.error("Error checking data count:", countError);
      return { 
        success: false, 
        message: `Error checking data: ${countError.message}` 
      };
    }
    
    if (count && count > 0 && !forceRefresh) {
      console.log(`Found ${count} existing records, no need to migrate`);
      return { 
        success: true, 
        message: `Connected to Supabase. Found ${count} existing records.` 
      };
    } else {
      console.log("No data found or force refresh requested, would need to import data");
      return { 
        success: true, 
        message: "Connected to Supabase, but no data found. Use the CSV upload or data import features." 
      };
    }
  } catch (error: any) {
    console.error("Error in migrateTestDataToSupabase:", error);
    return { 
      success: false, 
      message: `Error connecting to Supabase: ${error.message}` 
    };
  }
};
