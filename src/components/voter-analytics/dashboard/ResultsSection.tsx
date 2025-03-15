
import React, { useEffect } from 'react';
import { useErrorLogger } from '@/hooks/useErrorLogger';

interface ResultsSectionProps {
  error: string | null;
  result: number | null;
  query?: any;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({ error, result, query }) => {
  const { logDataIssue } = useErrorLogger();
  
  // Log Dan Kelly result for debugging
  useEffect(() => {
    const isDanKellyQuery = 
      query?.person === "Dan Kelly" && 
      query?.date === "2025-01-31" && 
      query?.tactic === "Phone";
      
    if (isDanKellyQuery && result !== null) {
      // Log the result for debugging
      logDataIssue("Dan Kelly Query Result", {
        query,
        result,
        expected: 17,
        timestamp: new Date().toISOString()
      }).catch(err => console.error("Failed to log Dan Kelly result:", err));
    }
  }, [result, query, logDataIssue]);

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
          {query?.person === "Dan Kelly" && 
           query?.date === "2025-01-31" && 
           query?.tactic === "Phone" && 
           result !== 17 && (
            <p className="text-sm text-amber-600 mt-2 text-center">
              Note: Debugging issue with Dan Kelly's data (expected: 17)
            </p>
          )}
        </div>
      )}
    </div>
  );
};
