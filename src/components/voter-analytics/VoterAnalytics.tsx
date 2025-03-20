
import { useVoterAnalytics } from '@/hooks/use-voter-analytics';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { QuerySection } from './dashboard/QuerySection';
import { SearchSection } from './dashboard/SearchSection';
import { ResultsSection } from './dashboard/ResultsSection';
import { DashboardCharts } from './DashboardCharts';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    refreshData,
    dataStats
  } = useVoterAnalytics();

  const [activeTab, setActiveTab] = useState<"metric" | "question">("metric");
  const [isSearchVisible, setIsSearchVisible] = useState(true);

  // Create a wrapper function that discards the boolean return value
  const handleRefreshData = async () => {
    await refreshData();
    // No return value, which makes this Promise<void>
  };

  // Check if data was uploaded by user
  const hasUserUploadedData = dataStats && dataStats.source === 'csv-upload';

  const toggleSearchPanel = () => {
    setIsSearchVisible(!isSearchVisible);
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
      
      <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 h-full min-h-[80vh] overflow-hidden">
        {/* Toggle Button - positioned based on visibility */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleSearchPanel}
          className={`absolute top-2 z-10 p-1 h-8 w-8 hidden-print ${isSearchVisible ? 'right-2' : 'left-2'}`}
          aria-label={isSearchVisible ? "Hide search options" : "Show search options"}
        >
          {isSearchVisible ? (
            <>
              <span className="sr-only md:not-sr-only md:mr-1 text-xs">Dashboard</span>
              <ChevronLeft className="h-5 w-5" />
            </>
          ) : (
            <>
              <ChevronRight className="h-5 w-5" />
              <span className="sr-only md:not-sr-only md:ml-1 text-xs">Search</span>
            </>
          )}
        </Button>
        
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full"
        >
          {/* Left Panel - Search Options */}
          {isSearchVisible && (
            <>
              <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="p-4 border-r border-gray-200">
                <div className="h-full flex flex-col">
                  <div className="text-lg font-semibold mb-4">Search Options</div>
                  
                  <div className="mb-4">
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
                  </div>
                  
                  <div className="flex-grow overflow-y-auto">
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
                        setQuery={setQuery} 
                      />
                    )}
                  </div>
                  
                  {hasUserUploadedData && (
                    <div className="mt-auto pt-4 text-xs text-gray-500 border-t border-gray-200">
                      <p>
                        Working with uploaded dataset.{" "}
                        <Link to="/connect-data" className="text-blue-600 hover:text-blue-800 underline">
                          Replace dataset
                        </Link>
                      </p>
                    </div>
                  )}
                </div>
              </ResizablePanel>
              
              {/* Resizable Handle */}
              <ResizableHandle withHandle />
            </>
          )}
          
          {/* Right Panel - Results */}
          <ResizablePanel 
            defaultSize={isSearchVisible ? 75 : 100} 
            className="p-4 overflow-y-auto"
          >
            <div className="space-y-6">
              {/* Results Display */}
              <ResultsSection error={error} result={result} query={query} />
              
              {/* Dashboard Charts */}
              <DashboardCharts 
                isLoading={isLoading} 
                query={query}
                showFilteredData={showFilteredData}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
