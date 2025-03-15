
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
    calculateResult
  } = useVoterAnalytics();

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8">
      <DashboardHeader isDataMigrated={isDataMigrated} />
      
      <div className="grid grid-cols-1 gap-8">
        {/* Section 1: Query Builder */}
        <QuerySection 
          query={query}
          setQuery={setQuery}
          setError={setError}
          isLoading={isLoading}
          isDataMigrated={isDataMigrated}
        />
        
        {/* Section 2: Search Field */}
        <SearchSection 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isLoading={isLoading}
          onSubmit={calculateResult}
        />
        
        {/* Section 3: Dashboard Charts */}
        <DashboardCharts 
          isLoading={isLoading} 
          query={query}
          showFilteredData={showFilteredData}
        />
      </div>

      {/* Results Display */}
      <ResultsSection error={error} result={result} />
    </div>
  );
};
