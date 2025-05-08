
import { AlertTriangle } from 'lucide-react';

export function InstructionsAlert() {
  return (
    <div className="rounded-md border p-3 bg-amber-50 border-amber-200 text-amber-800 mb-4">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">Please map your CSV fields to our database fields</p>
          <p className="text-xs mt-1">Fields marked with * are required</p>
        </div>
      </div>
    </div>
  );
}
