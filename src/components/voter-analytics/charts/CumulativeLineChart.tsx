
import { useState } from 'react';
import { useCumulativeData } from './cumulative-chart/useCumulativeData';
import { CumulativeChartHeader } from './cumulative-chart/CumulativeChartHeader';
import { EmptyChartState } from './cumulative-chart/EmptyChartState';
import { LineChartContent } from './cumulative-chart/LineChartContent';
import { PrintChartButton } from './cumulative-chart/PrintChartButton';

interface CumulativeLineChartProps {
  data: Array<{
    date: string;
    attempts: number;
    contacts: number;
    issues: number;
  }>;
  onPrintChart?: () => void;
}

export const CumulativeLineChart: React.FC<CumulativeLineChartProps> = ({ 
  data, 
  onPrintChart 
}) => {
  const [showDailyData, setShowDailyData] = useState(false);
  
  const {
    processedData,
    maxDailyValue,
    maxCumulativeValue,
    hasData
  } = useCumulativeData(data);

  // If no data is available, show an empty state
  if (!hasData) {
    return <EmptyChartState />;
  }

  // Get the appropriate max value based on display mode
  const maxValue = showDailyData ? maxDailyValue : maxCumulativeValue;

  return (
    <div id="cumulative-line-chart" className="mt-8 h-full rounded-lg border border-gray-200 relative pb-5">
      <CumulativeChartHeader 
        showDailyData={showDailyData} 
        onToggleMode={setShowDailyData} 
      />
      
      <LineChartContent 
        data={processedData} 
        showDailyData={showDailyData} 
        maxValue={maxValue}
      />

      {/* Print Chart Button */}
      {onPrintChart && <PrintChartButton onClick={onPrintChart} />}
    </div>
  );
};
