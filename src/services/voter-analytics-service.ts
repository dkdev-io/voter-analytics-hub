
import { type QueryParams } from '@/types/analytics';
import { 
  migrateTestDataToSupabase, 
  calculateResultFromSupabase 
} from '@/lib/voter-data';
import { supabase } from '@/integrations/supabase/client';

/**
 * Checks Supabase connection and migrates test data if needed
 */
export const initializeSupabaseConnection = async () => {
  console.log("Initializing Supabase connection...");
  
  // First, check Supabase connection
  const migrateResult = await migrateTestDataToSupabase();
  
  // Return the result of the migration
  return migrateResult;
};

/**
 * Calculate result based on query parameters
 */
export const calculateQueryResult = async (query: Partial<QueryParams>) => {
  console.log("Starting calculation with query:", query);
  
  // Make sure we have a valid query with at least one parameter
  const hasSearchParameters = query.tactic || query.resultType || query.person || query.date || query.team;
  const hasSearchQuery = query.searchQuery && query.searchQuery.trim() !== '';
  
  if (!hasSearchParameters && !hasSearchQuery) {
    console.log("No query parameters provided");
    return { error: "Please select at least one field or enter a search term", result: null };
  }

  try {
    console.log("Calculating result for query:", query);
    
    const { result: calculatedResult, error: calculationError } = await calculateResultFromSupabase(query);
    
    console.log("Calculation result:", calculatedResult, "Error:", calculationError);
    
    if (calculationError) {
      return { error: calculationError, result: null };
    }
    
    return { error: null, result: calculatedResult };
  } catch (e) {
    console.error("Error calculating result:", e);
    return { error: "Unknown error", result: null };
  }
};

/**
 * Refresh data from Supabase
 */
export const refreshSupabaseData = async () => {
  console.log("Refreshing data from Supabase...");
  
  try {
    // Get current data count to confirm refresh
    const { count: beforeCount, error: countError } = await supabase
      .from('voter_contacts')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error("Error getting data count:", countError);
    } else {
      console.log(`Current record count before refresh: ${beforeCount || 0}`);
    }
    
    // Force refresh by clearing cache
    const migrateResult = await migrateTestDataToSupabase(true); // Pass true to force refresh
    
    if (migrateResult.success) {
      // Get new data count to confirm refresh worked
      const { count: afterCount, error: countError2 } = await supabase
        .from('voter_contacts')
        .select('*', { count: 'exact', head: true });
        
      if (countError2) {
        console.error("Error getting data count after refresh:", countError2);
      } else {
        console.log(`Record count after refresh: ${afterCount || 0}`);
      }
      
      return { success: true, message: migrateResult.message };
    } else {
      return { success: false, message: migrateResult.message };
    }
  } catch (err) {
    console.error("Error refreshing data:", err);
    return { success: false, message: "Failed to refresh data." };
  }
};

/**
 * Import new data from Google Sheet
 */
export const importNewDataset = async () => {
  console.log("Importing new dataset from Google Sheet...");
  
  try {
    const { data, error } = await supabase.functions.invoke('import-voter-data-from-sheet');
    
    if (error) {
      console.error("Error importing data:", error);
      return { success: false, message: error.message, stats: null };
    }
    
    console.log("Import result:", data);
    
    if (data.success) {
      return { success: true, message: data.message, stats: data.stats };
    } else {
      return { success: false, message: data.error || "Unknown error during import", stats: null };
    }
  } catch (err) {
    console.error("Error in data import:", err);
    return { success: false, message: "Failed to import new dataset.", stats: null };
  }
};
