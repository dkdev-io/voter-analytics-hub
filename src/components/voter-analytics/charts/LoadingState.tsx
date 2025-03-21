
import React from 'react';

export const LoadingState: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-gray-100 animate-pulse rounded"></div>
        ))}
      </div>
      <div className="mt-6 h-72 bg-gray-100 animate-pulse rounded"></div>
    </div>
  );
};
