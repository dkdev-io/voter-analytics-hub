
import { useState, useEffect } from 'react';
import { QueryBuilder } from './QueryBuilder';
import { ResultDisplay } from './ResultDisplay';
import { DataMigrationAlert } from './DataMigrationAlert';
import { type QueryParams } from '@/types/analytics';
import { useToast } from "@/hooks/use-toast";
import { 
  migrateTestDataToSupabase, 
  calculateResultFromSupabase 
} from '@/lib/voter-data';
import { supabase } from '@/integrations/supabase/client';
import { SearchField } from './SearchField';
import { DashboardCharts } from './DashboardCharts';

export const VoterAnalytics = () => {
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

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2 text-center">Dashboard</h1>
      <p className="text-lg text-gray-700 mb-8 text-center italic">
        The first user friendly tool to help campaigns analyze their voter contact data.
      </p>
      
      <DataMigrationAlert isDataMigrated={isDataMigrated} />
      
      <div className="grid grid-cols-1 gap-8">
        {/* Section 1: Query Builder */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Build Your Query</h2>
          <QueryBuilder 
            query={query}
            setQuery={setQuery}
            setError={setError}
            isLoading={isLoading}
            isDataMigrated={isDataMigrated}
          />
        </div>
        
        {/* Section 2: Search Field */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Search Records</h2>
          <SearchField 
            value={searchQuery}
            onChange={setSearchQuery}
            isLoading={isLoading}
            onSubmit={calculateResult}
          />
        </div>
        
        {/* Section 3: Dashboard Charts */}
        <DashboardCharts 
          isLoading={isLoading} 
          query={query}
          showFilteredData={showFilteredData}
        />
      </div>

      {/* Move ResultDisplay here but remove the Submit button since it's now in SearchField */}
      <div className="space-y-6">
        {error && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-red-600 font-medium text-center">
              {error}
            </div>
          </div>
        )}

        {result !== null && !error && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-xl font-medium text-gray-900 text-center">
              Result: {result}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
