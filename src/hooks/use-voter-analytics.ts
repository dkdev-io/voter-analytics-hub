
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

  // Set up a wrapper for setQuery that automatically updates showFilteredData
  const enhancedSetQuery = (newQuery: Partial<QueryParams>) => {
    // If we're setting a specific person or tactic query, automatically show filtered data
    if (newQuery.person || newQuery.tactic) {
      setShowFilteredData(true);
    }
    setQuery(newQuery);
  };

  // Actions for data operations
  const {
    calculateResult,
    importNewData,
    refreshData,
    handleCsvUploadSuccess
  } = useAnalyticsActions({
    query,
    setQuery: enhancedSetQuery,
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
    setQuery: enhancedSetQuery,
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
