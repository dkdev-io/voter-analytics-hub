
import React from 'react';

export const EmptyChartState: React.FC = () => {
  return (
    <div className="mt-8 h-full rounded-lg border border-gray-200 relative flex items-center justify-center">
      <h3 className="text-sm font-bold p-2 text-center absolute top-0 left-0 right-0">Cumulative Progress</h3>
      <p className="text-gray-500 text-center">No data available for the selected filters.</p>
    </div>
  );
};
