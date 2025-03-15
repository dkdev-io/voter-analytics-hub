
import React from 'react';

export const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = payload[0].payload.total || 
                 (typeof data.value === 'number' ? data.value : 0);
    
    return (
      <div className="bg-white p-2 border border-gray-200 shadow-md rounded text-xs">
        <p className="font-semibold">{payload[0].name}</p>
        <p style={{ color: payload[0].payload.color }}>
          Value: {payload[0].value}
        </p>
        {total > 0 && (
          <p>
            Percentage: {((payload[0].value / total) * 100).toFixed(1)}%
          </p>
        )}
      </div>
    );
  }

  return null;
};
