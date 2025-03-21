
import { useState, useEffect } from 'react';
import { useVoterAnalytics } from '@/hooks/use-voter-analytics';
import { DataMigrationAlert } from './DataMigrationAlert';
import { QueryBuilder } from './QueryBuilder';
import { SearchSection } from './dashboard/SearchSection';
import { ResultsSection } from './dashboard/ResultsSection';
import { DashboardCharts } from './DashboardCharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataInsightsPanel } from './data-insights/DataInsightsPanel';

export const VoterAnalyticsWithErrorHandling = () => {
  const {
    query,
    setQuery,
    error,
    result,
    searchQuery,
    setSearchQuery,
    showFilteredData,
    setShowFilteredData,
    isLoading,
    isDataMigrated,
    connectionError,
    retryConnection,
    calculateResult
  } = useVoterAnalytics();

  const [dataTab, setDataTab] = useState<string>('charts');
  const [showSearchPanel, setShowSearchPanel] = useState<boolean>(false);

  const toggleSearchPanel = () => {
    setShowSearchPanel(!showSearchPanel);
  };

  // Effect to auto-calculate when search tab changes
  useEffect(() => {
    // Only auto-calculate if we have a valid query with at least one parameter
    const hasQueryParams = Boolean(query.person || query.tactic || query.date || query.team);
    if (hasQueryParams && !isLoading) {
      calculateResult();
    }
  }, [dataTab]);

  return (
    <div className="flex flex-col gap-6 mt-4">
      <DataMigrationAlert 
        isDataMigrated={isDataMigrated} 
        connectionError={connectionError}
        isLoading={isLoading}
        retryConnection={retryConnection}
      />
      
      {connectionError ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-medium mb-4">Dashboard Unavailable</h3>
          <p className="text-gray-600 mb-6">
            We're having trouble connecting to the database. Please try again later or use the retry button above.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <QueryBuilder
                query={query}
                setQuery={setQuery}
                isLoading={isLoading}
              />
            </div>
            <div className="md:col-span-2">
              <div className="flex flex-col gap-6">
                <SearchSection
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  isLoading={isLoading}
                  onSubmit={calculateResult}
                  setQuery={setQuery}
                  setShowFilteredData={setShowFilteredData}
                />
                <ResultsSection error={error} result={result} />
              </div>
            </div>
          </div>

          <Tabs value={dataTab} onValueChange={setDataTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-[300px] mx-auto mb-4">
              <TabsTrigger value="charts">Charts & Trends</TabsTrigger>
              <TabsTrigger value="insights">Data Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="charts" className="mt-0">
              <DashboardCharts
                isLoading={isLoading}
                query={query}
                showFilteredData={showFilteredData}
                onToggleSearchPanel={toggleSearchPanel}
              />
            </TabsContent>

            <TabsContent value="insights" className="mt-0">
              <DataInsightsPanel query={query} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};
