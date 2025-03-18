
import { useQueryState } from './voter-analytics/use-query-state';
import { useDataState } from './voter-analytics/use-data-state';
import { useAnalyticsActions } from './voter-analytics/use-analytics-actions';

export const useVoterAnalytics = () => {
  // Query and result state management
  const {
    query, 
    setQuery,
    error,
    setError, 
    result,
    searchQuery,
    setSearchQuery,
    showFilteredData,
    setShowFilteredData,
  } = useQueryState();

  // Data loading and status state
  const {
    isLoading,
    isDataMigrated,
    dataStats,
    dataLastUpdated,
    setDataLastUpdated,
    setDataStats
  } = useDataState();

  // Actions for data operations
  const {
    calculateResult,
    importNewData,
    refreshData,
    handleCsvUploadSuccess
  } = useAnalyticsActions({
    query,
    setQuery,
    error,
    setError,
    result,
    searchQuery,
    isLoading,
    setShowFilteredData,
    setDataStats,
    setDataLastUpdated
  });

  return {
    // Query state
    query,
    setQuery,
    error,
    setError,
    result,
    searchQuery,
    setSearchQuery,
    showFilteredData,
    
    // Loading state
    isLoading,
    isDataMigrated,
    
    // Data state
    dataStats,
    dataLastUpdated,
    
    // Actions
    calculateResult,
    importNewData,
    refreshData,
    handleCsvUploadSuccess
  };
};
