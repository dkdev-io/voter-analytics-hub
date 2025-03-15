
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
      
      <div className="grid grid-cols-1 gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start relative">
          {/* Section 1: Query Builder */}
          <QuerySection 
            query={query}
            setQuery={setQuery}
            setError={setError}
            isLoading={isLoading}
            isDataMigrated={isDataMigrated}
            onRefresh={handleRefreshData}
            onSubmit={calculateResult}
          />
          
          {/* Or divider */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm font-bold text-gray-500">
              Or
            </div>
          </div>
          
          {/* Section 2: Search Field */}
          <SearchSection 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isLoading={isLoading}
            onSubmit={calculateResult}
          />
        </div>
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
}
