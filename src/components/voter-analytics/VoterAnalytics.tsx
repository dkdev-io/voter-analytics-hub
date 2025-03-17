
import { useVoterAnalytics } from '@/hooks/use-voter-analytics';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { QuerySection } from './dashboard/QuerySection';
import { SearchSection } from './dashboard/SearchSection';
import { ResultsSection } from './dashboard/ResultsSection';
import { DashboardCharts } from './DashboardCharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from 'react';

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

  const [activeTab, setActiveTab] = useState<"metric" | "question">("metric");

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
        <Tabs 
          defaultValue="metric" 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as "metric" | "question")}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="metric">Pick a metric</TabsTrigger>
            <TabsTrigger value="question">Ask a question</TabsTrigger>
          </TabsList>

          <TabsContent value="metric" className="mt-0">
            <QuerySection 
              query={query}
              setQuery={setQuery}
              setError={setError}
              isLoading={isLoading}
              isDataMigrated={isDataMigrated}
              onRefresh={handleRefreshData}
              onSubmit={calculateResult}
            />
          </TabsContent>
          
          <TabsContent value="question" className="mt-0">
            <SearchSection 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isLoading={isLoading}
              onSubmit={calculateResult}
            />
          </TabsContent>
        </Tabs>
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
