import React, { useState } from "react";
import { useVoterAnalytics } from "@/hooks/use-voter-analytics";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { QuerySection } from "./dashboard/QuerySection";
import { ResultsSection } from "./dashboard/ResultsSection";
import { SearchSection } from "./dashboard/SearchSection";
import { DashboardCharts } from "./DashboardCharts";
import { AIInsightsPanel } from "./ai-insights/AIInsightsPanel";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";

export const VoterAnalytics: React.FC = () => {
	const [showSearchPanel, setShowSearchPanel] = useState(true);
	const [showInsightsPanel, setShowInsightsPanel] = useState(true);

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
		handleCsvUploadSuccess,
	} = useVoterAnalytics();

	const toggleSearchPanel = () => {
		setShowSearchPanel(!showSearchPanel);
	};

	const toggleInsightsPanel = () => {
		setShowInsightsPanel(!showInsightsPanel);
	};

	// Wrapper function for refreshData to ensure it returns void
	const handleRefreshData = async () => {
		await refreshData();
	};

	return (
		<ErrorBoundary>
			<div className="container mx-auto px-4 py-6">
				<DashboardHeader
					lastUpdated={dataLastUpdated}
					isDataMigrated={isDataMigrated}
					dataStats={dataStats}
					refreshData={handleRefreshData}
					importNewData={importNewData}
					handleCsvUploadSuccess={handleCsvUploadSuccess}
				/>

				<div className="flex justify-between items-center mb-4">
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={toggleSearchPanel}
							className="h-8"
						>
							{showSearchPanel ? 'Hide' : 'Show'} Search
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={toggleInsightsPanel}
							className="h-8 flex items-center gap-1"
						>
							<Sparkles className="h-3 w-3" />
							{showInsightsPanel ? 'Hide' : 'Show'} AI Insights
						</Button>
					</div>
				</div>

				<div className={`grid grid-cols-1 gap-6 mt-6 ${
					showSearchPanel && showInsightsPanel 
						? 'lg:grid-cols-4' 
						: showSearchPanel || showInsightsPanel 
							? 'lg:grid-cols-3' 
							: 'lg:grid-cols-1'
				}`}>
					{/* Left column: Query builder and search */}
					{showSearchPanel && (
						<div className="lg:col-span-1">
							<div className="dark:bg-slate-800 bg-white p-6 rounded-lg shadow-md">
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

					{/* Middle column: Results and charts */}
					<div className={`${
						showSearchPanel && showInsightsPanel 
							? 'lg:col-span-2' 
							: showSearchPanel || showInsightsPanel 
								? 'lg:col-span-2' 
								: 'lg:col-span-1'
					}`}>
						<ResultsSection error={error} result={result} query={query} />

						<div className="mt-6">
							<DashboardCharts
								isLoading={false}
								query={query}
								showFilteredData={showFilteredData}
								onToggleSearchPanel={toggleSearchPanel}
							/>
						</div>
					</div>

					{/* Right column: AI Insights */}
					{showInsightsPanel && (
						<div className="lg:col-span-1">
							<AIInsightsPanel
								queryParams={query}
								isVisible={showInsightsPanel}
								autoRefresh={true}
								refreshInterval={30000}
							/>
						</div>
					)}
				</div>
			</div>
		</ErrorBoundary>
	);
};
