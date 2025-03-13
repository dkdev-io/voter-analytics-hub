
import { supabase } from '@/integrations/supabase/client';

// Mock data for testing when Supabase is not available
const mockVoterData = [
  {
    id: 1,
    tactic: "Doors",
    date: "2023-09-01",
    attempts: 25,
    contacts: 15,
    not_home: 8,
    bad_data: 2,
    first_name: "Dan",
    last_name: "Kelly",
    team: "Field Team"
  },
  {
    id: 2,
    tactic: "Phones",
    date: "2023-09-01",
    attempts: 50,
    contacts: 30,
    not_home: 15,
    bad_data: 5,
    first_name: "Sarah",
    last_name: "Johnson",
    team: "Call Team"
  },
  {
    id: 3,
    tactic: "Texts",
    date: "2023-09-02",
    attempts: 100,
    contacts: 75,
    not_home: 20,
    bad_data: 5,
    first_name: "Candidate",
    last_name: "Carter",
    team: "Digital Team"
  }
];

let isMockDataLoaded = false;

// Function to check if data migration is needed and perform if necessary
export const migrateTestDataToSupabase = async () => {
  try {
    // We're now using the imported Supabase client directly, no env vars check needed
    
    // Check if data already exists
    const { data, error } = await supabase
      .from('voter_contacts')
      .select('id')
      .order('id', { ascending: true });
      
    if (error) {
      console.error('Error checking data:', error);
      isMockDataLoaded = true;
      return true;
    }
    
    // If no data, insert test data (though we've already done this in SQL)
    if (data.length === 0) {
      console.log('No data found in voter_contacts, adding test data');
      
      // Insert test data into Supabase
      const { error: insertError } = await supabase
        .from('voter_contacts')
        .insert(mockVoterData);
        
      if (insertError) {
        console.error('Error inserting test data:', insertError);
        isMockDataLoaded = true;
        return true;
      }
      
      console.log('Test data migrated to Supabase');
    } else {
      console.log('Data already exists in Supabase');
    }
    
    return true;
  } catch (error) {
    console.error('Error in data migration:', error);
    isMockDataLoaded = true;
    return true;
  }
};

// Function to get test data for mock mode
export const getTestData = () => {
  return mockVoterData;
};

// Check if we're using mock data - now always returns false since we have a real Supabase client
export const isUsingMockData = () => {
  return false;
};
