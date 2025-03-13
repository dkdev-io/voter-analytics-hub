
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

export const VoterAnalytics = () => {
  const [query, setQuery] = useState<Partial<QueryParams>>({});
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataMigrated, setIsDataMigrated] = useState(false);
  const { toast } = useToast();

  // Initial data migration check
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        console.log("Initializing data migration...");
        // Check if data exists in Supabase
        await migrateTestDataToSupabase();
        console.log("Data migration completed successfully");
        
        toast({
          title: "Data Connection",
          description: "Connected to Supabase voter contact database.",
          variant: "default"
        });
        setIsDataMigrated(true);
      } catch (err) {
        console.error("Error in data connection:", err);
        toast({
          title: "Error",
          description: "Failed to connect to Supabase database.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeData();
  }, [toast]);

  const calculateResult = async () => {
    if (!query.tactic && !query.resultType && !query.person && !query.date) {
      setError("Please select at least one field");
      setResult(null);
      return;
    }

    try {
      setIsLoading(true);
      console.log("Calculating result for query:", query);
      
      const { result: calculatedResult, error: calculationError } = await calculateResultFromSupabase(query);
      
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
    } catch (e) {
      console.error("Error calculating result:", e);
      setError("Unknown error");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2 text-center">Dashboard</h1>
      <p className="text-lg text-gray-700 mb-8 text-center italic">
        The first user friendly tool to help campaigns analyze their voter contact data.
      </p>
      
      <DataMigrationAlert isDataMigrated={isDataMigrated} />
      
      <QueryBuilder 
        query={query}
        setQuery={setQuery}
        setError={setError}
        isLoading={isLoading}
        isDataMigrated={isDataMigrated}
      />

      <ResultDisplay 
        error={error}
        result={result}
        isLoading={isLoading}
        query={query}
        calculateResult={calculateResult}
      />
    </div>
  );
};
