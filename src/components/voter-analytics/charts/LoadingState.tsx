
import React from 'react';

export const LoadingState: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-gray-100 rounded overflow-hidden">
            <div className="w-full h-full animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]" style={{ animationDuration: '1.5s' }}></div>
          </div>
        ))}
      </div>
      <div className="mt-6 h-72 rounded overflow-hidden">
        <div className="w-full h-full animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]" style={{ animationDuration: '1.5s' }}></div>
      </div>
    </div>
  );
};
