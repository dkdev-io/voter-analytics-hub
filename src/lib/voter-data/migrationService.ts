
import { supabase } from '@/integrations/supabase/client';

// Function to migrate test data to Supabase
export const migrateTestDataToSupabase = async () => {
  try {
    // Check connection by counting records
    const { count, error } = await supabase
      .from('voter_contacts')
      .select('*', { count: 'exact', head: true });
    
    console.log(`Found ${count} records in voter_contacts table`);
    
    if (error) {
      return { success: false, message: `Error connecting to Supabase: ${error.message}` };
    }
    
    return { 
      success: true, 
      message: count === 0 ? 
        "Connected to Supabase successfully, but no data found. Will import data." : 
        `Connected to Supabase successfully. Found ${count} records.` 
    };
  } catch (error) {
    console.error("Error in migrateTestDataToSupabase:", error);
    return { success: false, message: `Failed to connect to Supabase: ${error instanceof Error ? error.message : String(error)}` };
  }
};

// Function to get test data from Supabase
export const getTestData = async () => {
  try {
    // Query all records from the voter_contacts table
    const { data, error } = await supabase
      .from('voter_contacts')
      .select('*');
    
    if (error) {
      console.error("Error fetching from Supabase:", error);
      return [];
    }
    
    console.log(`Retrieved ${data.length} records from voter_contacts table`);
    
    if (data.length === 0) {
      console.log("No data found in voter_contacts table, would need to import from Google Sheets");
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getTestData:", error);
    return [];
  }
};

// Function to insert test data into Supabase
export const insertTestData = async (testData: any[]) => {
  try {
    // Insert the data into Supabase
    const { data, error } = await supabase
      .from('voter_contacts')
      .insert(testData)
      .select();
    
    if (error) {
      return { success: false, message: `Error inserting data: ${error.message}` };
    }
    
    return { success: true, message: `Inserted ${data.length} records successfully.` };
  } catch (error) {
    console.error("Error in insertTestData:", error);
    return { success: false, message: `Failed to insert data: ${error instanceof Error ? error.message : String(error)}` };
  }
};
