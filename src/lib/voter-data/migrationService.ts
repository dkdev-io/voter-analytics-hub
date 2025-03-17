import { supabase } from '@/integrations/supabase/client';

// Cache the test data to avoid repeated calls
let testDataCache: any[] | null = null;
let lastFetchTime = 0;
const CACHE_TIMEOUT = 5000; // 5 seconds - reduced from 10s to ensure fresh data

// Function to check Supabase connection and data availability
export const migrateTestDataToSupabase = async (forceRefresh = false): Promise<{ success: boolean; message: string }> => {
  try {
    console.log("Checking Supabase connection...");
    
    // Clear the cache if a refresh is forced
    if (forceRefresh) {
      console.log("Force refresh requested, clearing cache");
      testDataCache = null;
      lastFetchTime = 0;
    }
    
    // Attempt to connect to Supabase by querying the voter_contacts table
    const { data, error } = await supabase
      .from('voter_contacts')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error("Supabase connection error:", error);
      return { 
        success: false, 
        message: error.message 
      };
    }
    
    // Check if there's data in the voter_contacts table
    const { count, error: countError } = await supabase
      .from('voter_contacts')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error("Error checking voter_contacts count:", countError);
      return { 
        success: true, 
        message: "Connected to Supabase, but couldn't check data count: " + countError.message
      };
    }
    
    if (!count || count === 0) {
      console.log("No data found in voter_contacts table");
      return { 
        success: true, 
        message: "Connected to Supabase, but no data found in voter_contacts table." 
      };
    }
    
    console.log(`Found ${count} records in voter_contacts table`);
    return { 
      success: true, 
      message: `Connected to Supabase, found ${count} records in voter_contacts table.` 
    };
  } catch (error) {
    console.error("Error checking Supabase connection:", error);
    return { 
      success: false, 
      message: "Failed to connect to Supabase: " + String(error) 
    };
  }
};

// Function to get test data from Supabase or generate fake data if needed
export const getTestData = async (): Promise<any[]> => {
  try {
    const now = Date.now();
    
    // Always clear cache when requested - ensures we get fresh data
    testDataCache = null;
    lastFetchTime = 0;
    
    // Use cached data if available and not expired
    if (testDataCache && now - lastFetchTime < CACHE_TIMEOUT) {
      console.log("Using cached test data");
      return testDataCache;
    }
    
    console.log("Fetching voter_contacts data from Supabase...");
    
    // Fetch ALL data from the voter_contacts table, not just a limited set
    const { data, error } = await supabase
      .from('voter_contacts')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      console.error("Error fetching data from Supabase:", error);
      throw error;
    }
    
    // If data exists, use it
    if (data && data.length > 0) {
      console.log(`Fetched ${data.length} records from voter_contacts`);
      testDataCache = data;
      lastFetchTime = now;
      return data;
    }
    
    // We no longer generate fake data as a fallback
    // This ensures that only uploaded data appears in the UI
    console.log("No data found in Supabase, returning empty array");
    testDataCache = [];
    lastFetchTime = now;
    return [];
  } catch (error) {
    console.error("Error getting test data:", error);
    
    // Return empty array instead of fake data
    console.log("Error occurred, returning empty array");
    testDataCache = [];
    lastFetchTime = now;
    return [];
  }
};

// For development use only - don't use this in production
function generateFakeData(count: number): any[] {
  // This function is kept for reference but we're not using it anymore
  // ... keep existing code
}
