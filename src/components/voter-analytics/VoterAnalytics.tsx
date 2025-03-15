
import { useVoterAnalytics } from '@/hooks/use-voter-analytics';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { QuerySection } from './dashboard/QuerySection';
import { SearchSection } from './dashboard/SearchSection';
import { ResultsSection } from './dashboard/ResultsSection';
import { DashboardCharts } from './DashboardCharts';

export const VoterAnalytics = () => {
  const {
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
    calculateResult,
    importNewData,
    refreshData
  } = useVoterAnalytics();

  // Create a wrapper function that discards the boolean return value
  const handleRefreshData = async () => {
    await refreshData();
    // No return value, which makes this Promise<void>
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8">
      <DashboardHeader 
        query={query}
        setQuery={setQuery}
        error={error}
        setError={setError}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isLoading={isLoading}
        isDataMigrated={isDataMigrated}
        calculateResult={calculateResult}
        importNewData={importNewData}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Section 1: Query Builder */}
        <QuerySection 
          query={query}
          setQuery={setQuery}
          setError={setError}
          isLoading={isLoading}
          isDataMigrated={isDataMigrated}
          onRefresh={handleRefreshData}
        />
        
        {/* Section 2: Search Field */}
        <SearchSection 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
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
      
      {/* Results Display */}
      <ResultsSection error={error} result={result} />
    </div>
  );
};
