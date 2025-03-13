
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { type QueryParams } from '@/types/analytics';

interface ResultDisplayProps {
  error: string | null;
  result: number | null;
  isLoading: boolean;
  query: Partial<QueryParams>;
  calculateResult: () => Promise<void>;
}

export const ResultDisplay = ({ 
  error, 
  result, 
  isLoading, 
  query,
  calculateResult 
}: ResultDisplayProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-center mt-6">
        <Button 
          onClick={calculateResult}
          className="px-6 py-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit
            </>
          )}
        </Button>
      </div>

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
