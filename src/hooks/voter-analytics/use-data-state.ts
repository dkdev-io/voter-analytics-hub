
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { initializeSupabaseConnection, importNewDataset } from '@/services/voter-analytics-service';

export const useDataState = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDataMigrated, setIsDataMigrated] = useState(false);
  const [dataStats, setDataStats] = useState<any>(null);
  const [dataLastUpdated, setDataLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  // Initial data migration and check
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        const migrateResult = await initializeSupabaseConnection();
        
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
            await importNewDataset();
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
    
    initialize();
  }, [toast]);

  return {
    isLoading,
    setIsLoading,
    isDataMigrated,
    dataStats,
    setDataStats,
    dataLastUpdated,
    setDataLastUpdated
  };
};
