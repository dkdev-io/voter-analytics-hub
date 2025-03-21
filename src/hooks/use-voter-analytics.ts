
import { useQueryState } from './voter-analytics/use-query-state';
import { useDataState } from './voter-analytics/use-data-state';
import { useAnalyticsActions } from './voter-analytics/use-analytics-actions';
import { type QueryParams } from '@/types/analytics';
import { useErrorLogger } from './useErrorLogger';
import { useEffect } from 'react';

export const useVoterAnalytics = () => {
  const { logError } = useErrorLogger();

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
    setDataStats,
    connectionError,
    retryConnection
  } = useDataState();

  // Log any connection errors to help with debugging
  useEffect(() => {
    if (connectionError) {
      logError(connectionError, 'Supabase Connection', {
        lastAttempt: dataLastUpdated ? dataLastUpdated.toISOString() : 'never',
        dashboard: 'voter-analytics'
      });
    }
  }, [connectionError, dataLastUpdated, logError]);

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
    setShowFilteredData,
    
    // Loading state
    isLoading,
    isDataMigrated,
    
    // Data state
    dataStats,
    dataLastUpdated,
    
    // Supabase connection state
    connectionError,
    retryConnection,
    
    // Actions
    calculateResult,
    importNewData,
    refreshData,
    handleCsvUploadSuccess
  };
};
