
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

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
        <Alert variant="destructive" className="mb-4 hidden-print">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result !== null && !error && (
        <Card className="bg-white p-6 rounded-lg shadow-md hidden-print">
          <p className="text-xl font-medium text-gray-900 text-center">
            Result: {result.toLocaleString()}
          </p>
        </Card>
      )}
    </div>
  );
};
