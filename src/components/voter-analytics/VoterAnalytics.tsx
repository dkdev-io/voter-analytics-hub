
import React, { useState } from 'react';
import { useVoterAnalytics } from '@/hooks/use-voter-analytics';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { QuerySection } from './dashboard/QuerySection';
import { ResultsSection } from './dashboard/ResultsSection';
import { SearchSection } from './dashboard/SearchSection';
import { DashboardCharts } from './DashboardCharts';
import ErrorBoundary from '@/components/ErrorBoundary';

export const VoterAnalytics: React.FC = () => {
  const [showSearchPanel, setShowSearchPanel] = useState(true);
  
  const {
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
  } = useVoterAnalytics();

  const toggleSearchPanel = () => {
    setShowSearchPanel(!showSearchPanel);
  };

  // Wrapper function for refreshData to ensure it returns void
  const handleRefreshData = async () => {
    await refreshData();
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-6">
        <DashboardHeader 
          showSearchPanel={showSearchPanel}
          toggleSearchPanel={toggleSearchPanel}
          lastUpdated={dataLastUpdated}
          isDataMigrated={isDataMigrated}
          dataStats={dataStats}
          refreshData={handleRefreshData}
          importNewData={importNewData}
          handleCsvUploadSuccess={handleCsvUploadSuccess}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left column: Query builder and search */}
          {showSearchPanel && (
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="space-y-6">
                  <SearchSection 
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    isLoading={isLoading}
                    onSubmit={calculateResult}
                    setQuery={setQuery}
                  />
                  
                  <QuerySection 
                    query={query}
                    setQuery={setQuery}
                    setError={setError}
                    isLoading={isLoading}
                    isDataMigrated={isDataMigrated}
                    onSubmit={calculateResult}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Right column: Results and charts */}
          <div className={`${showSearchPanel ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <ResultsSection 
              error={error}
              result={result}
              query={query}
            />
            
            <div className="mt-6">
              <DashboardCharts 
                isLoading={isLoading}
                query={query}
                showFilteredData={showFilteredData}
                onToggleSearchPanel={toggleSearchPanel}
              />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};
