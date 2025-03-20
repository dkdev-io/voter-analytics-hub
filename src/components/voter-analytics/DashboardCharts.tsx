
import { useState } from 'react';
import { type QueryParams } from '@/types/analytics';
import { ActivityLineChart } from './charts/ActivityLineChart';
import { CumulativeLineChart } from './charts/CumulativeLineChart';
import { PrintReport } from './PrintReport';
import { LoadingState } from './charts/LoadingState';
import { PieChartsRow } from './charts/PieChartsRow';
import { ReportTitle } from './charts/ReportTitle';
import { ReportFooter } from './charts/ReportFooter';
import { PrintStylesheet } from './charts/PrintStylesheet';
import { useDataLoader } from './charts/DataLoader';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface DashboardChartsProps {
  isLoading: boolean;
  query: Partial<QueryParams>;
  showFilteredData: boolean;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ 
  isLoading, 
  query, 
  showFilteredData 
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const { user, userMetadata } = useAuth();
  
  // Use the data loader hook to fetch and process chart data
  const {
    tacticsData,
    contactsData,
    notReachedData,
    lineChartData,
    totalAttempts,
    totalContacts,
    totalNotReached,
    loading,
    datasetName
  } = useDataLoader({ query, showFilteredData });
  
  // Format upload date if available
  const uploadDate = userMetadata?.last_dataset_upload_date 
    ? format(new Date(userMetadata.last_dataset_upload_date), "MMMM d, yyyy")
    : null;
  
  // Get the filename from user metadata
  const uploadedFileName = userMetadata?.last_dataset_name || null;
  
  // Handle print functionality
  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    
    // Reset printing state after a short delay (for cleanup)
    setTimeout(() => {
      setIsPrinting(false);
    }, 1000);
  };
  
  if (loading || isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Apply print styles only when printing */}
      {isPrinting && (
        <PrintStylesheet 
          onCleanup={() => setIsPrinting(false)} 
          userEmail={user?.email} 
          datasetName={uploadedFileName || datasetName} 
        />
      )}
      
      {/* Title section with dataset info - hidden when printing */}
      <div className="text-center mb-6 print:hidden">
        <h2 className="text-xl font-semibold mb-1">
          <span className="font-bold">Your Voter Contact</span>
        </h2>
        <div className="text-gray-700">
          {uploadedFileName ? (
            <span className="block">{uploadedFileName}</span>
          ) : (
            <span className="block">{datasetName}</span>
          )}
          {uploadDate && <span className="block text-sm text-gray-500">Updated {uploadDate}</span>}
        </div>
      </div>
      
      {/* Printable report container - only this will be visible when printing */}
      <div id="report-container" className="print:block">
        {/* Report title component - visible in print */}
        <ReportTitle query={query} />
        
        {/* Pie charts row component - three charts on one line */}
        <div id="pie-charts-row">
          <PieChartsRow 
            tacticsData={tacticsData}
            contactsData={contactsData}
            notReachedData={notReachedData}
            totalAttempts={totalAttempts}
            totalContacts={totalContacts}
            totalNotReached={totalNotReached}
          />
        </div>
        
        {/* Line chart showing attempts, contacts, and issues by date */}
        <div id="line-chart-container" className="mt-6">
          <ActivityLineChart data={lineChartData} />
        </div>
        
        {/* Cumulative Line Chart */}
        <div id="cumulative-line-chart-container" className="mt-6">
          <CumulativeLineChart data={lineChartData} />
        </div>
        
        {/* Report footer - only visible when printing */}
        <ReportFooter 
          userEmail={user?.email} 
          datasetName={uploadedFileName || datasetName} 
        />
      </div>

      {/* Print Report Button positioned at bottom */}
      <PrintReport query={query} onPrint={handlePrint} />
    </div>
  );
};
