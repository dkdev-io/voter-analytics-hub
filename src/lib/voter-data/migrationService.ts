
import { supabase } from '@/integrations/supabase/client';

// This service is now only checking if data exists in Supabase
// Mock data is no longer used since we have real data in Supabase
export const migrateTestDataToSupabase = async () => {
  try {
    // Check if data already exists in Supabase
    const { data, error } = await supabase
      .from('voter_contacts')
      .select('id')
      .limit(1);
      
    if (error) {
      console.error('Error checking data:', error);
      return false;
    }
    
    // Return true if we have data
    return data && data.length > 0;
  } catch (error) {
    console.error('Error in data connection check:', error);
    return false;
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
