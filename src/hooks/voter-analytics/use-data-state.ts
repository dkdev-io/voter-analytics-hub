
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { initializeSupabaseConnection, importNewDataset } from '@/services/voter-analytics-service';
import { supabase } from '@/integrations/supabase/client';

export const useDataState = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDataMigrated, setIsDataMigrated] = useState(false);
  const [dataStats, setDataStats] = useState<any>(null);
  const [dataLastUpdated, setDataLastUpdated] = useState<Date | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const { toast } = useToast();

  // Function to retry the Supabase connection
  const retryConnection = useCallback(async () => {
    setIsLoading(true);
    setConnectionError(null);
    setConnectionAttempts(prev => prev + 1);
    
    try {
      // Test the Supabase connection with a simple query
      const { error: pingError } = await supabase.from('voter_contacts').select('id', { count: 'exact', head: true });
      
      if (pingError) {
        throw new Error(`Supabase connection error: ${pingError.message}`);
      }
      
      // If ping succeeded, try the full initialization
      const migrateResult = await initializeSupabaseConnection();
      
      if (migrateResult.success) {
        toast({
          title: "Supabase Connection Restored",
          description: migrateResult.message,
          variant: "default"
        });
        
        setIsDataMigrated(true);
        setDataLastUpdated(new Date());
        
        // If we're connected but no data found, try to import data
        if (migrateResult.message.includes("no data found")) {
          console.log("No data found in Supabase, attempting to import...");
          await importNewDataset();
        }
      } else {
        setConnectionError(`Failed to initialize Supabase: ${migrateResult.message}`);
        toast({
          title: "Connection Error",
          description: `Failed to connect to Supabase: ${migrateResult.message}`,
          variant: "destructive"
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Error in data initialization:", err);
      setConnectionError(errorMessage);
      toast({
        title: "Supabase Connection Error",
        description: `Failed to connect to Supabase: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Initial data migration and check
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        // First check if Supabase is available with a simple ping
        const { error: pingError } = await supabase.from('voter_contacts').select('id', { count: 'exact', head: true });
        
        if (pingError) {
          throw new Error(`Supabase connection error: ${pingError.message}`);
        }
        
        const migrateResult = await initializeSupabaseConnection();
        
        if (migrateResult.success) {
          toast({
            title: "Supabase Connection",
            description: migrateResult.message,
            variant: "default"
          });
          
          setIsDataMigrated(true);
          setDataLastUpdated(new Date());
          setConnectionError(null);
          
          // If we're connected but no data found, try to import data
          if (migrateResult.message.includes("no data found")) {
            console.log("No data found in Supabase, attempting to import...");
            await importNewDataset();
          }
        } else {
          setConnectionError(`Failed to initialize Supabase: ${migrateResult.message}`);
          toast({
            title: "Connection Warning",
            description: "Failed to connect to Supabase: " + migrateResult.message,
            variant: "destructive"
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("Error in data initialization:", err);
        setConnectionError(errorMessage);
        toast({
          title: "Supabase Connection Error",
          description: `Failed to connect to Supabase: ${errorMessage}`,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, [toast, connectionAttempts]);

  return {
    isLoading,
    setIsLoading,
    isDataMigrated,
    dataStats,
    setDataStats,
    dataLastUpdated,
    setDataLastUpdated,
    connectionError,
    retryConnection
  };
};
