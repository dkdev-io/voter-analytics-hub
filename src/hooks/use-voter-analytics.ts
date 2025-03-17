
import { useState, useEffect, useCallback } from 'react';
import { type QueryParams } from '@/types/analytics';
import { useToast } from "@/hooks/use-toast";
import { 
  migrateTestDataToSupabase, 
  calculateResultFromSupabase 
} from '@/lib/voter-data';
import { supabase } from '@/integrations/supabase/client';

export const useVoterAnalytics = () => {
  const [query, setQuery] = useState<Partial<QueryParams>>({});
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataMigrated, setIsDataMigrated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilteredData, setShowFilteredData] = useState(false);
  const [dataStats, setDataStats] = useState<any>(null);
  const [dataLastUpdated, setDataLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  // Initial data migration and check
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        console.log("Initializing Supabase connection...");
        
        // First, check Supabase connection
        const migrateResult = await migrateTestDataToSupabase();
        
        if (migrateResult.success) {
          toast({
            title: "Supabase Connection",
            description: migrateResult.message,
            variant: "default"
          });
          
          setIsDataMigrated(true);
          setDataLastUpdated(new Date());
          
          // If we're connected but no data found, try to import data
          if (migrateResult.message.includes("no data found")) {
            console.log("No data found in Supabase, attempting to import...");
            await importNewData();
          }
        } else {
          toast({
            title: "Error",
            description: "Failed to connect to Supabase: " + migrateResult.message,
            variant: "destructive"
          });
        }
      } catch (err) {
        console.error("Error in data initialization:", err);
        toast({
          title: "Error",
          description: "Failed to initialize Supabase connection.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeData();
  }, [toast]);

  const calculateResult = async () => {
    if (!query.tactic && !query.resultType && !query.person && !query.date && !searchQuery) {
      setError("Please select at least one field or enter a search term");
      setResult(null);
      return;
    }

    try {
      setIsLoading(true);
      
      // Update the query with searchQuery if provided
      const updatedQuery = {
        ...query,
        searchQuery: searchQuery
      };
      
      console.log("Calculating result for query:", updatedQuery);
      
      const { result: calculatedResult, error: calculationError } = await calculateResultFromSupabase(updatedQuery);
      
      console.log("Calculation result:", calculatedResult, "Error:", calculationError);
      
      if (calculationError) {
        setError(calculationError);
        setResult(null);
        return;
      }
      
      if (calculatedResult === 0) {
        setResult(0);
        setError(null);
        toast({
          title: "No data found",
          description: "No matching data for these criteria. Result set to 0.",
          variant: "default"
        });
      } else {
        setResult(calculatedResult);
        setError(null);
      }
      
      // Update the query state with the searchQuery
      setQuery(updatedQuery);
      
      // Show filtered data in charts
      setShowFilteredData(true);
    } catch (e) {
      console.error("Error calculating result:", e);
      setError("Unknown error");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("Refreshing data from Supabase...");
      
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
        
        toast({
          title: "Data Refresh",
          description: "Successfully refreshed connection to Supabase.",
          variant: "default"
        });
        
        setDataLastUpdated(new Date());
        return true;
      } else {
        toast({
          title: "Refresh Error",
          description: "Failed to refresh connection: " + migrateResult.message,
          variant: "destructive"
        });
        return false;
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
      toast({
        title: "Refresh Error",
        description: "Failed to refresh data.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const importNewData = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("Importing new dataset from Google Sheet...");
      
      const { data, error } = await supabase.functions.invoke('import-voter-data-from-sheet');
      
      if (error) {
        console.error("Error importing data:", error);
        toast({
          title: "Import Error",
          description: "Failed to import new dataset: " + error.message,
          variant: "destructive"
        });
        return false;
      }
      
      console.log("Import result:", data);
      
      if (data.success) {
        toast({
          title: "Data Import Successful",
          description: `Imported ${data.message}`,
          variant: "default"
        });
        
        setDataStats(data.stats);
        setDataLastUpdated(new Date());
        
        // Refresh the data after successful import
        await refreshData();
        return true;
      } else {
        toast({
          title: "Import Error",
          description: data.error || "Unknown error during import",
          variant: "destructive"
        });
        return false;
      }
    } catch (err) {
      console.error("Error in data import:", err);
      toast({
        title: "Import Error",
        description: "Failed to import new dataset.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast, refreshData]);

  // Function to handle successful CSV upload
  const handleCsvUploadSuccess = useCallback(async () => {
    console.log("CSV upload success, refreshing data...");
    setDataLastUpdated(new Date());
    
    // Clear any cached data and force a complete refresh of all metadata
    const success = await refreshData();
    
    if (success) {
      toast({
        title: "Data Refreshed",
        description: "Successfully refreshed data after CSV upload.",
        variant: "default"
      });
      
      // Clear the query state to avoid showing stale results
      setQuery({});
      setResult(null);
    }
  }, [refreshData, toast]);

  return {
    query,
    setQuery,
    error,
    setError,
    result,
    isLoading,
    isDataMigrated,
    searchQuery,
    setSearchQuery,
    showFilteredData,
    calculateResult,
    importNewData,
    refreshData,
    dataStats,
    dataLastUpdated,
    handleCsvUploadSuccess
  };
};
