
import { useState } from 'react';
import { type QueryParams } from '@/types/analytics';
import { ActivityLineChart } from './charts/ActivityLineChart';
import { PrintReport } from './PrintReport';
import { LoadingState } from './charts/LoadingState';
import { PieChartsRow } from './charts/PieChartsRow';
import { ReportTitle } from './charts/ReportTitle';
import { PrintStylesheet } from './charts/PrintStylesheet';
import { useDataLoader } from './charts/DataLoader';

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
  
  // Use the data loader hook to fetch and process chart data
  const {
    tacticsData,
    contactsData,
    notReachedData,
    lineChartData,
    totalAttempts,
    totalContacts,
    totalNotReached,
    loading
  } = useDataLoader({ query, showFilteredData });
  
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
      {isPrinting && <PrintStylesheet onCleanup={() => setIsPrinting(false)} />}
      
      {/* This div is specifically marked to be hidden during printing */}
      <div className="flex justify-between items-center mb-4 hidden-print">
        <h2 className="text-xl font-semibold">Analytics {showFilteredData ? '(Filtered Results)' : '(Overall)'}</h2>
        <PrintReport query={query} onPrint={handlePrint} />
      </div>
      
      {/* Report container - only this will be visible when printing */}
      <div id="report-container" className="print:block print:mt-0">
        {/* Report title component - always render but only visible in print */}
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
        <div id="line-chart-container" className="mt-6 print:mt-8">
          <ActivityLineChart data={lineChartData} />
        </div>
      </div>
    </div>
  );
};
