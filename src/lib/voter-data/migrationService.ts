import { supabase } from '@/integrations/supabase/client';

// This service is now only checking if data exists in Supabase
// Mock data is no longer used since we have real data in Supabase
export const migrateTestDataToSupabase = async () => {
  try {
    console.log("Starting data migration process...");
    
    // Check if data already exists in Supabase to avoid duplicate imports
    const { count, error: countError } = await supabase
      .from('voter_contacts')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error("Error checking existing data:", countError);
      throw new Error("Failed to check existing data in Supabase");
    }

    console.log("Current record count in voter_contacts:", count);
    
    if (count && count > 0) {
      console.log("Data already exists in Supabase, skipping migration");
      return { success: true, message: "Data already exists" };
    }

    // If no data exists, proceed with migration
    console.log("No data found, proceeding with migration...");
    
    // Check if data already exists in Supabase
    const { data, error } = await supabase
      .from('voter_contacts')
      .select('id')
      .limit(1);
      
    if (error) {
      console.error('Error checking data:', error);
      throw new Error("Failed to check data in Supabase");
    }
    
    // Return true if we have data
    return data && data.length > 0;
  } catch (error) {
    console.error('Error in data connection check:', error);
    throw new Error("Migration failed");
  }
};

// These functions are kept for backward compatibility
// but now just return empty mock data since we're using real data
export const getTestData = () => {
  return [];
};

export const isUsingMockData = () => {
  return false;
};
