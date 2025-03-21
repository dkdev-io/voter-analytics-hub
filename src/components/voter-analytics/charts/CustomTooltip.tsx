
import React from 'react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const CustomPieTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }
  
  const data = payload[0].payload;
  const total = data.total || 1; // Avoid division by zero
  const percentage = ((data.value / total) * 100).toFixed(1);
  
  return (
    <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md text-xs">
      <p className="font-bold">{data.name}</p>
      <p>Value: {data.value.toLocaleString()}</p>
      <p>Percentage: {percentage}%</p>
    </div>
  );
};
