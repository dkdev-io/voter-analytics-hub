
import React from 'react';

interface ResultsSectionProps {
  error: string | null;
  result: number | null;
  query?: any;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({ error, result, query }) => {
  if (!error && result === null) return null;
  
  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-red-600 font-medium text-center">
            {error}
          </div>
        </div>
      )}

      {result !== null && !error && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-xl font-medium text-gray-900 text-center">
            Result: {result}
          </p>
        </div>
      )}
    </div>
  );
};
