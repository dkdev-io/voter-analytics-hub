
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface ProcessingStepProps {
  progress: number;
}

export function ProcessingStep({ progress }: ProcessingStepProps) {
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
    </div>
  );
}
