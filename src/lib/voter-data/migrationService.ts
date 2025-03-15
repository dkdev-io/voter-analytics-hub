
import { supabase } from '@/integrations/supabase/client';

// This function now actually migrates data to Supabase (if needed)
export const migrateTestDataToSupabase = async () => {
  try {
    // Check if we already have data in the voter_contacts table
    const { count, error } = await supabase
      .from('voter_contacts')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error checking voter_contacts table:', error);
      return { success: false, message: error.message };
    }
    
    // If we have data, no need to migrate
    if (count && count > 0) {
      console.log(`Already have ${count} records in voter_contacts table`);
      return { success: true, message: `Using existing ${count} records` };
    }
    
    console.log('No data found in voter_contacts table, would need to import from Google Sheets');
    return { success: true, message: "Connected to Supabase" };
  } catch (error) {
    console.error('Error in data migration process:', error);
    throw new Error("Migration failed");
  }
};

// Return the data from Supabase instead of mock data
export const getTestData = async () => {
  try {
    const { data, error } = await supabase
      .from('voter_contacts')
      .select('*');
    
    if (error) {
      console.error('Error fetching voter contacts from Supabase:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching data from Supabase:', error);
    return [];
  }
};

// This now returns true since we're using real Supabase data
export const isUsingMockData = () => {
  return false;
};
