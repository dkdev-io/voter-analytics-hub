
import { useState } from "react";
import { useCalculateResult, useRefreshData, useImportData, useCsvUploadHandler } from "./actions";
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
  // We need to handle loading state internally in this hook since we can't modify the parent's state directly
  const [internalIsLoading, setInternalIsLoading] = useState(externalIsLoading);
  
  const setIsLoading = (loading: boolean) => {
    setInternalIsLoading(loading);
  };

  // Set up the specialized hooks
  const { refreshData } = useRefreshData({ 
    setIsLoading, 
    setDataLastUpdated 
  });

  const { importNewData } = useImportData({ 
    setIsLoading, 
    setDataStats, 
    setDataLastUpdated, 
    refreshData 
  });

  const { calculateResult } = useCalculateResult({
    query,
    setError,
    searchQuery,
    setIsLoading,
    setShowFilteredData,
  });

  const { handleCsvUploadSuccess } = useCsvUploadHandler({
    setDataLastUpdated,
    refreshData,
    setQuery,
    setError,
  });

  return {
    calculateResult,
    refreshData,
    importNewData,
    handleCsvUploadSuccess,
  };
};
