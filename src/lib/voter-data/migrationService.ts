
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
      console.error("Connection error:", error);
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
    // Query all records from the voter_contacts table with more detailed error handling
    const { data, error, status } = await supabase
      .from('voter_contacts')
      .select('*');
    
    if (error) {
      console.error("Error fetching from Supabase:", error, "Status:", status);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log("No data found in voter_contacts table, would need to import from Google Sheets");
      
      // Try to force a data import by calling the edge function directly
      try {
        const { data: importData, error: importError } = await supabase.functions.invoke('import-voter-data');
        
        if (importError) {
          console.error("Error calling import function:", importError);
        } else {
          console.log("Import function response:", importData);
          
          // Try fetching data again after import attempt
          const { data: freshData, error: freshError } = await supabase
            .from('voter_contacts')
            .select('*');
            
          if (freshError) {
            console.error("Error fetching fresh data:", freshError);
          } else if (freshData && freshData.length > 0) {
            console.log(`Retrieved ${freshData.length} records after import`);
            return freshData;
          }
        }
      } catch (importErr) {
        console.error("Exception during import:", importErr);
      }
      
      return [];
    }
    
    console.log(`Retrieved ${data.length} records from voter_contacts table`);
    return data;
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
      console.error("Error inserting data:", error);
      return { success: false, message: `Error inserting data: ${error.message}` };
    }
    
    return { success: true, message: `Inserted ${data.length} records successfully.` };
  } catch (error) {
    console.error("Error in insertTestData:", error);
    return { success: false, message: `Failed to insert data: ${error instanceof Error ? error.message : String(error)}` };
  }
};
