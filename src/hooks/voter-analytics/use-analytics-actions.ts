import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  calculateQueryResult,
  refreshSupabaseData,
  importNewDataset,
} from "@/services/voter-analytics-service";
import { type QueryParams } from "@/types/analytics";

interface UseAnalyticsActionsProps {
  query: Partial<QueryParams>;
  setQuery: (query: Partial<QueryParams>) => void;
  error: string | null;
  setError: (error: string | null) => void;
  result: number | null;
  searchQuery: string;
  isLoading: boolean;
  setShowFilteredData: (show: boolean) => void;
  setDataStats: (stats: any) => void;
  setDataLastUpdated: (date: Date | null) => void;
}

export const useAnalyticsActions = ({
  query,
  setQuery,
  error,
  setError,
  result,
  searchQuery,
  isLoading: externalIsLoading,
  setShowFilteredData,
  setDataStats,
  setDataLastUpdated,
}: UseAnalyticsActionsProps) => {
  const { toast } = useToast();

  // We need to handle loading state internally in this hook since we can't modify the parent's state directly
  let isLoading = externalIsLoading;
  const setIsLoading = (loading: boolean) => {
    isLoading = loading;
  };

  const calculateResult = async () => {
    // console.log("Starting calculateResult with query:", query, "searchQuery:", searchQuery);

    // Check if we have any query parameters to use
    if (
      !query.tactic &&
      !query.resultType &&
      !query.person &&
      !query.date &&
      !query.team &&
      !query.searchQuery
    ) {
      setError(
        "Please select at least one filter criteria or enter a search term",
      );
      return;
    }

    try {
      setIsLoading(true);

      // Update the query with searchQuery if provided and not already set
      const updatedQuery = {
        ...query,
        searchQuery: query.searchQuery || searchQuery,
      };

      // console.log("Calculating result with updatedQuery:", updatedQuery);

      const { result: calculatedResult, error: calculationError } =
        await calculateQueryResult(updatedQuery);

      if (calculationError) {
        setError(calculationError);
        toast({
          title: "Query Error",
          description: calculationError,
          variant: "destructive",
        });
        return;
      }

      if (calculatedResult === 0) {
        setError(null);
        toast({
          title: "No Data Found",
          description: "No records match your search criteria. Result is 0.",
          variant: "default",
        });
      } else {
        setError(null);
        toast({
          title: "Query Complete",
          description: `Found result: ${calculatedResult}`,
          variant: "default",
        });
      }

      // Show filtered data in charts
      setShowFilteredData(true);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await refreshSupabaseData();

      if (result.success) {
        toast({
          title: "Data Refresh",
          description: "Successfully refreshed connection to Supabase.",
          variant: "default",
        });

        setDataLastUpdated(new Date());
        return true;
      } else {
        toast({
          title: "Refresh Error",
          description: "Failed to refresh connection: " + result.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
      toast({
        title: "Refresh Error",
        description: "Failed to refresh data.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast, setDataLastUpdated, setIsLoading]);

  const importNewData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await importNewDataset();

      if (result.success) {
        toast({
          title: "Data Import Successful",
          description: `Imported ${result.message}`,
          variant: "default",
        });

        setDataStats(result.stats);
        setDataLastUpdated(new Date());

        // Refresh the data after successful import
        await refreshData();
        return true;
      } else {
        toast({
          title: "Import Error",
          description: result.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      console.error("Error in data import:", err);
      toast({
        title: "Import Error",
        description: "Failed to import new dataset.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast, refreshData, setDataStats, setDataLastUpdated, setIsLoading]);

  // Function to handle successful CSV upload
  const handleCsvUploadSuccess = useCallback(async () => {
    // console.log("CSV upload success, refreshing data...");
    setDataLastUpdated(new Date());

    // Clear any cached data and force a complete refresh of all metadata
    const success = await refreshData();

    if (success) {
      toast({
        title: "Data Refreshed",
        description: "Successfully refreshed data after CSV upload.",
        variant: "default",
      });

      // Clear the query state to avoid showing stale results
      setQuery({});
      setError(null);
    }
  }, [refreshData, toast, setQuery, setError, setDataLastUpdated]);

  return {
    calculateResult,
    refreshData,
    importNewData,
    handleCsvUploadSuccess,
  };
};
