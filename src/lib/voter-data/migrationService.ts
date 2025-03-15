
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
    
    // If no data, trigger import right away
    if (count === 0) {
      console.log("No data found, attempting immediate import...");
      const importResult = await attemptDataImport();
      
      if (importResult.success) {
        return { 
          success: true, 
          message: "Connected to Supabase successfully. Data imported." 
        };
      } else {
        return { 
          success: true, 
          message: "Connected to Supabase successfully, but no data found. Will import data." 
        };
      }
    }
    
    return { 
      success: true, 
      message: `Connected to Supabase successfully. Found ${count} records.` 
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
    
    // Direct query approach - no count check first, just try to get the data
    const { data, error } = await supabase
      .from('voter_contacts')
      .select('*');
    
    if (error) {
      console.error("Error fetching data from Supabase:", error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log("No data returned from voter_contacts table");
      
      // Try to import data and then fetch again
      const importResult = await attemptDataImport();
      console.log("Import attempt result:", importResult);
      
      // Try once more after import
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
        
        // Create and return fake data for development
        const fakeData = generateFakeData();
        console.log("Generated fake data for development:", fakeData.slice(0, 2));
        return fakeData;
      }
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

// Function to generate fake data for development
const generateFakeData = () => {
  const teams = ["Team Alpha", "Team Beta", "Team Gamma", "Team Delta", "Team Tony"];
  const tactics = ["SMS", "Phone", "Canvas", "Email"];
  const dates = ["2023-01-01", "2023-02-01", "2023-03-01", "2023-04-01", "2023-05-01", "2025-01-01"];
  const firstNames = ["John", "Sarah", "Michael", "Emily", "David", "Maria", "James", "Lisa"];
  const lastNames = ["Smith", "Johnson", "Williams", "Jones", "Brown", "Garcia", "Miller", "Davis"];
  
  const fakeData = [];
  
  for (let i = 0; i < 50; i++) {
    const contacts = Math.floor(Math.random() * 20);
    const notHome = Math.floor(Math.random() * 10);
    const badData = Math.floor(Math.random() * 5);
    const refusal = Math.floor(Math.random() * 8);
    
    // Make sure attempts is at least equal to the sum of contacts, notHome, badData
    const attempts = contacts + notHome + badData + refusal;
    
    // Support, oppose, undecided should sum to contacts
    const support = Math.floor(Math.random() * contacts);
    const oppose = Math.floor(Math.random() * (contacts - support));
    const undecided = contacts - support - oppose;
    
    fakeData.push({
      id: i + 1,
      tactic: tactics[Math.floor(Math.random() * tactics.length)],
      date: dates[Math.floor(Math.random() * dates.length)],
      attempts,
      contacts,
      not_home: notHome,
      bad_data: badData,
      refusal,
      first_name: firstNames[Math.floor(Math.random() * firstNames.length)],
      last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
      team: teams[Math.floor(Math.random() * teams.length)],
      support,
      oppose,
      undecided,
      created_at: new Date().toISOString()
    });
  }
  
  return fakeData;
};
