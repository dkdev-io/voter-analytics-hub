
import React, { useEffect } from 'react';
import { useErrorLogger } from '@/hooks/useErrorLogger';
import { addIssue } from '@/lib/issue-log/issueLogService';

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
      
      // Also log to issue tracker if result doesn't match expected
      if (result !== 17) {
        const issueData = {
          title: "Dan Kelly Query Returns Incorrect Value",
          description: `Query for Dan Kelly's phone attempts on 2025-01-31 returned ${result} instead of expected 17.`,
          expected_behavior: "Query should return 17",
          actual_behavior: `Query returned ${result}`,
          console_logs: JSON.stringify({
            query: query,
            result: result
          }, null, 2),
          theories: "Multiple Dan Kelly records may exist in the test data with different values.",
          component: "VoterAnalytics, QueryService"
        };
        
        addIssue(issueData)
          .then(() => console.log("Successfully added Dan Kelly issue to tracker"))
          .catch(err => console.error("Failed to add Dan Kelly issue to tracker:", err));
      }
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
