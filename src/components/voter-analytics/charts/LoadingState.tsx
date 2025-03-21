
import React from 'react';

export const LoadingState: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-gray-100 rounded overflow-hidden relative">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse"
              style={{
                backgroundSize: '200% 100%',
                animationName: 'shimmer',
                animationDuration: '2s',
                animationTimingFunction: 'linear',
                animationIterationCount: 'infinite'
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-6 h-72 bg-gray-100 rounded overflow-hidden relative">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse"
          style={{
            backgroundSize: '200% 100%',
            animationName: 'shimmer',
            animationDuration: '2s',
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite'
          }}
        />
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}} />
    </div>
  );
};
