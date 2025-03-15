
import { useState, useEffect } from 'react';
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
          
          // Try to call our edge function to import data if needed
          try {
            const { data, error } = await supabase.functions.invoke('import-voter-data');
            
            if (error) {
              console.error("Error calling import-voter-data function:", error);
            } else {
              console.log("Import function result:", data);
              if (data.success) {
                toast({
                  title: "Data Import",
                  description: data.message,
                  variant: "default"
                });
              }
            }
          } catch (funcError) {
            console.error("Error invoking Edge Function:", funcError);
          }
          
          setIsDataMigrated(true);
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
    calculateResult
  };
};
