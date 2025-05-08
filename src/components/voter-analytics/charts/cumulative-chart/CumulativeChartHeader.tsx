
import React from 'react';
import { ChartModeToggle } from './ChartModeToggle';

interface CumulativeChartHeaderProps {
  showDailyData: boolean;
  onToggleMode: (checked: boolean) => void;
}

export const CumulativeChartHeader: React.FC<CumulativeChartHeaderProps> = ({
  showDailyData,
  onToggleMode,
}) => {
  return (
    <div className="flex justify-between items-center p-2">
      <h3 className="text-sm font-bold">{showDailyData ? "Daily Activity" : "Cumulative Progress"}</h3>
      <ChartModeToggle 
        showDailyData={showDailyData} 
        onToggle={onToggleMode} 
      />
    </div>
  );
};
