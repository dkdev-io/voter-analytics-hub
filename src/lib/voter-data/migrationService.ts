
import { supabase } from '../supabase';

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
    // Check if environment variables are missing
    const isMissingEnvVars = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (isMissingEnvVars) {
      console.warn('Using mock data due to missing Supabase environment variables');
      isMockDataLoaded = true;
      return true;
    }
    
    // Check if data already exists
    const { data, error } = await supabase
      .from('voter_contacts')
      .select('id')
      .order('id', { ascending: true });
      
    if (error) throw error;
    
    // If no data, insert test data
    if (data.length === 0) {
      // Insert test data into Supabase
      const { error: insertError } = await supabase
        .from('voter_contacts')
        .insert(mockVoterData);
        
      if (insertError) throw insertError;
      
      console.log('Test data migrated to Supabase');
    } else {
      console.log('Data already exists in Supabase');
    }
    
    return true;
  } catch (error) {
    console.error('Error in data migration:', error);
    throw error;
  }
};

// Function to get test data for mock mode
export const getTestData = () => {
  return mockVoterData;
};

// Check if we're using mock data
export const isUsingMockData = () => {
  return isMockDataLoaded || !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;
};
