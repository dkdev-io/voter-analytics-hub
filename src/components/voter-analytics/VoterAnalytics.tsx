
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
    <div className="max-w-7xl mx-auto p-4 space-y-6">
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
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Welcome to Dashboard</h2>
        </div>
        
        <Tabs 
          defaultValue="metric" 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as "metric" | "question")}
          className="w-full"
        >
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button 
              onClick={() => setActiveTab("metric")}
              className={`py-3 px-4 text-center rounded-md transition-colors ${
                activeTab === "metric" 
                  ? "bg-primary text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Pick a metric
            </button>
            <button 
              onClick={() => setActiveTab("question")}
              className={`py-3 px-4 text-center rounded-md transition-colors ${
                activeTab === "question" 
                  ? "bg-primary text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Ask a question
            </button>
          </div>

          <div className="mt-6">
            {activeTab === "metric" ? (
              <QuerySection 
                query={query}
                setQuery={setQuery}
                setError={setError}
                isLoading={isLoading}
                isDataMigrated={isDataMigrated}
                onRefresh={handleRefreshData}
                onSubmit={calculateResult}
              />
            ) : (
              <SearchSection 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isLoading={isLoading}
                onSubmit={calculateResult}
              />
            )}
          </div>
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
