import { useState, useEffect } from 'react';
import { type QueryParams } from '@/types/analytics';
import { ActivityLineChart } from './charts/ActivityLineChart';
import { CumulativeLineChart } from './charts/CumulativeLineChart';
import { PrintReport } from './PrintReport';
import { LoadingState } from './charts/LoadingState';
import { PieChartsRow } from './charts/PieChartsRow';
import { ReportTitle } from './charts/ReportTitle';
import { ReportFooter } from './charts/ReportFooter';
import { PrintStylesheet } from './charts/PrintStylesheet';
import { PrintChart } from './charts/PrintChart';
import { useDataLoader } from './charts/DataLoader';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { useReportIssue } from '@/lib/issue-log/useReportIssue';
import { useToast } from '@/hooks/use-toast';

interface DashboardChartsProps {
  isLoading: boolean;
  query: Partial<QueryParams>;
  showFilteredData: boolean;
  onToggleSearchPanel?: () => void;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ 
  isLoading, 
  query, 
  showFilteredData,
  onToggleSearchPanel
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printingChart, setPrintingChart] = useState<string | null>(null);
  const { user, userMetadata } = useAuth();
  const { reportYAxisStretchIssue } = useReportIssue();
  const { toast } = useToast();
  
  useEffect(() => {
    const logYAxisIssue = async () => {
      const issue = await reportYAxisStretchIssue();
      if (issue) {
        toast({
          title: "Y-Axis Stretch Issue Logged",
          description: "The PrintChart Y-axis issue has been logged to the issue tracking system.",
          variant: "default"
        });
      }
    };
    
    logYAxisIssue();
  }, []);
  
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
  
  const uploadDate = userMetadata?.last_dataset_upload_date 
    ? format(new Date(userMetadata.last_dataset_upload_date), "MMMM d, yyyy")
    : null;
  
  const uploadedFileName = userMetadata?.last_dataset_name || null;
  
  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setIsPrinting(false);
      }, 1000);
    }, 100);
  };
  
  const handlePrintChart = (chartId: string) => {
    console.log(`Printing chart: ${chartId}`);
    setPrintingChart(chartId);
    
    setTimeout(() => {
      setPrintingChart(null);
    }, 3000);
  };
  
  if (loading || isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md dashboard-container">
      {isPrinting && !printingChart && (
        <PrintStylesheet 
          onCleanup={() => setIsPrinting(false)} 
          userEmail={user?.email} 
          datasetName={uploadedFileName || datasetName} 
        />
      )}
      
      {printingChart && (
        <PrintChart 
          query={query}
          userEmail={user?.email}
          datasetName={uploadedFileName || datasetName}
          chartId={printingChart}
          chartTitle={printingChart === 'activity-line-chart' ? 'Activity Over Time' : 'Cumulative Progress'}
          onCleanup={() => setPrintingChart(null)}
        />
      )}
      
      <div className="text-center mb-6 print-hidden">
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
      
      <div className="print-container">
        <ReportTitle query={query} />
        
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
        
        <div id="activity-line-chart" className="mt-6">
          <ActivityLineChart 
            data={lineChartData} 
            onPrintChart={() => handlePrintChart('activity-line-chart')} 
          />
        </div>
        
        <div id="cumulative-line-chart" className="mt-6">
          <CumulativeLineChart 
            data={lineChartData} 
            onPrintChart={() => handlePrintChart('cumulative-line-chart')} 
          />
        </div>
        
        <ReportFooter 
          userEmail={user?.email} 
          datasetName={uploadedFileName || datasetName} 
        />
      </div>
      
      <div className="print-hidden">
        <PrintReport 
          query={query} 
          onPrint={handlePrint} 
          onToggleSearchPanel={onToggleSearchPanel}
        />
      </div>
    </div>
  );
};
