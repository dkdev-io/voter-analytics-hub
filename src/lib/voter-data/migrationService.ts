
import { supabase } from '@/integrations/supabase/client';

// Cache the test data to avoid repeated calls
let testDataCache: any[] | null = null;
let lastFetchTime = 0;
const CACHE_TIMEOUT = 30000; // 30 seconds

// Function to check Supabase connection and data availability
export const migrateTestDataToSupabase = async (forceRefresh = false): Promise<{ success: boolean; message: string }> => {
  try {
    console.log("Checking Supabase connection...");
    
    // Clear the cache if a refresh is forced
    if (forceRefresh) {
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
    
    // Use cached data if available and not expired
    if (testDataCache && now - lastFetchTime < CACHE_TIMEOUT) {
      console.log("Using cached test data");
      return testDataCache;
    }
    
    console.log("Fetching voter_contacts data from Supabase...");
    
    // Fetch data from the voter_contacts table
    const { data, error } = await supabase
      .from('voter_contacts')
      .select('*')
      .order('id', { ascending: true })
      .limit(50);
    
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
    
    // Generate fake data for testing if no data exists
    console.log("Still no data after import attempt");
    
    const fakeData = generateFakeData(50);
    console.log("Generated fake data for development:", fakeData.slice(0, 2));
    
    testDataCache = fakeData;
    lastFetchTime = now;
    return fakeData;
  } catch (error) {
    console.error("Error getting test data:", error);
    
    // Fallback to fake data in case of error
    const fakeData = generateFakeData(50);
    testDataCache = fakeData;
    lastFetchTime = Date.now();
    return fakeData;
  }
};

// Function to generate fake data for development
function generateFakeData(count: number): any[] {
  const teams = ["Team Alpha", "Team Beta", "Team Gamma", "Team Delta", "Team Tony"];
  const tactics = ["Phone", "SMS", "Canvas", "Email"];
  const firstNames = ["John", "Michael", "Sarah", "Emily", "David", "James", "Maria", "Lisa"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis"];
  const dates = ["2023-01-01", "2023-02-01", "2023-03-01", "2023-04-01", "2023-05-01", "2025-01-01"];
  
  const data = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const team = teams[Math.floor(Math.random() * teams.length)];
    const tactic = tactics[Math.floor(Math.random() * tactics.length)];
    const date = dates[Math.floor(Math.random() * dates.length)];
    
    // Ensure contacts + not_home + refusal + bad_data = attempts
    const attempts = 10 + Math.floor(Math.random() * 20); // 10-30 attempts
    const contacts = Math.floor(Math.random() * attempts);
    const notHomeMax = attempts - contacts;
    const notHome = Math.floor(Math.random() * notHomeMax);
    const badDataMax = attempts - contacts - notHome;
    const badData = Math.floor(Math.random() * badDataMax);
    const refusal = attempts - contacts - notHome - badData;
    
    // Distribute contacts among support, oppose, undecided
    const support = contacts > 0 ? Math.floor(Math.random() * contacts) : 0;
    const opposeMax = contacts - support;
    const oppose = opposeMax > 0 ? Math.floor(Math.random() * opposeMax) : 0;
    const undecided = contacts - support - oppose;
    
    data.push({
      id: i + 1,
      tactic,
      date,
      attempts,
      contacts,
      not_home: notHome,
      bad_data: badData,
      refusal,
      first_name: firstName,
      last_name: lastName,
      team,
      support,
      oppose,
      undecided,
      created_at: new Date().toISOString()
    });
  }
  
  return data;
}
