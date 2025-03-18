
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
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Analytics {showFilteredData ? '(Filtered Results)' : '(Overall)'}</h2>
        <PrintReport query={query} onPrint={handlePrint} />
      </div>
      
      <div id="report-container">
        {/* Report title component */}
        <ReportTitle query={query} />
        
        {/* Pie charts row component */}
        <PieChartsRow 
          tacticsData={tacticsData}
          contactsData={contactsData}
          notReachedData={notReachedData}
          totalAttempts={totalAttempts}
          totalContacts={totalContacts}
          totalNotReached={totalNotReached}
        />
        
        {/* Line chart showing attempts, contacts, and issues by date */}
        <div id="line-chart-container">
          <ActivityLineChart data={lineChartData} />
        </div>
      </div>
    </div>
  );
};
