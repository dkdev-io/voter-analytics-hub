
import { Alert, AlertDescription } from "@/components/ui/alert";
import { type QueryParams } from '@/types/analytics';

interface ResultDisplayProps {
  error: string | null;
  result: number | null;
  isLoading: boolean;
  query: Partial<QueryParams>;
}

export const ResultDisplay = ({ 
  error, 
  result, 
  isLoading
}: ResultDisplayProps) => {
  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="text-red-600">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {result !== null && !error && (
        <p className="text-xl font-medium text-gray-900 mt-4 text-center">
          Result: {result}
        </p>
      )}
    </div>
  );
};
