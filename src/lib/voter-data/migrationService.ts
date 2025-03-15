
import { supabase } from '@/integrations/supabase/client';

// Function to migrate test data to Supabase
export const migrateTestDataToSupabase = async () => {
  try {
    console.log("Attempting to connect to Supabase...");
    
    // Check connection by counting records with detailed logging
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

// Function to get test data from Supabase with enhanced diagnostics
export const getTestData = async () => {
  try {
    console.log("Starting getTestData function...");
    
    // First, check if we have access to the table at all
    const { count, error: countError } = await supabase
      .from('voter_contacts')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error("Error checking data count:", countError);
      return [];
    }
    
    console.log(`Count check shows ${count} records in voter_contacts table`);
    
    if (count === 0) {
      console.log("No data found in table, attempting import...");
      await attemptDataImport();
    }
    
    // Query all records from the voter_contacts table
    const { data, error, status } = await supabase
      .from('voter_contacts')
      .select('*');
    
    if (error) {
      console.error("Error fetching data from Supabase:", error, "Status:", status);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log("No data returned after query");
      
      // Check again after importing
      if (count === 0) {
        const importResult = await attemptDataImport();
        console.log("Import attempt result:", importResult);
        
        // Try fetching one more time after import
        const { data: freshData, error: freshError } = await supabase
          .from('voter_contacts')
          .select('*');
          
        if (freshError) {
          console.error("Error fetching fresh data after import:", freshError);
          return [];
        }
        
        if (freshData && freshData.length > 0) {
          console.log(`Successfully retrieved ${freshData.length} records after import`);
          console.log("Sample data:", freshData.slice(0, 2)); // Log first two records
          return freshData;
        } else {
          console.log("Still no data after import attempt");
          return [];
        }
      }
      
      return [];
    }
    
    console.log(`Successfully retrieved ${data.length} records from voter_contacts table`);
    console.log("Sample data:", data.slice(0, 2)); // Log first two records
    return data;
  } catch (error) {
    console.error("Error in getTestData:", error);
    return [];
  }
};

// Helper function to attempt data import through edge function
const attemptDataImport = async () => {
  try {
    console.log("Calling import-voter-data edge function...");
    
    const { data: importData, error: importError } = await supabase.functions.invoke('import-voter-data');
    
    if (importError) {
      console.error("Error calling import function:", importError);
      return { success: false, message: `Error in import: ${importError.message}` };
    } 
    
    console.log("Import function response:", importData);
    return { success: true, message: "Import function executed" };
  } catch (importErr) {
    console.error("Exception during import attempt:", importErr);
    return { success: false, message: `Exception in import: ${importErr instanceof Error ? importErr.message : String(importErr)}` };
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
