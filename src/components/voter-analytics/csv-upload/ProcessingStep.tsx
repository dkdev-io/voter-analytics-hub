
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface ProcessingStepProps {
  progress: number;
  validationStats?: {
    total: number;
    valid: number;
    invalid: number;
    reasons: Record<string, number>;
  } | null;
}

export function ProcessingStep({ progress, validationStats }: ProcessingStepProps) {
  return (
    <div className="py-10 text-center">
      <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
      <h3 className="mt-4 text-lg font-medium">Processing your data</h3>
      <p className="text-sm text-gray-500 mt-1">
        Please don't close this window.
      </p>
      
      <div className="mt-6 w-full">
        <Progress value={progress} className="h-2" />
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {progress}% complete
      </p>
      
      {validationStats && validationStats.invalid > 0 && progress > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-left">
          <p className="text-sm font-medium text-yellow-800">
            Import Status:
          </p>
          <ul className="text-xs text-yellow-700 mt-1 list-disc list-inside">
            <li>Total records: {validationStats.total}</li>
            <li>Valid records: {validationStats.valid}</li>
            <li>Skipped records: {validationStats.invalid}</li>
          </ul>
          {Object.keys(validationStats.reasons).length > 0 && (
            <>
              <p className="text-xs font-medium text-yellow-800 mt-2">
                Reasons for skipped records:
              </p>
              <ul className="text-xs text-yellow-700 mt-1 list-disc list-inside">
                {Object.entries(validationStats.reasons).map(([reason, count]) => (
                  <li key={reason}>{reason}: {count} records</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
