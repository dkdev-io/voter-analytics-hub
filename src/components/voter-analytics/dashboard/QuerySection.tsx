
import { QueryBuilder } from "../QueryBuilder";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface QuerySectionProps {
  query: any;
  setQuery: (query: any) => void;
  setError: (error: string | null) => void;
  isLoading: boolean;
  isDataMigrated: boolean;
  onRefresh?: () => Promise<void>;
  onSubmit?: () => void;
}

export function QuerySection({
  query,
  setQuery,
  setError,
  isLoading,
  isDataMigrated,
  onRefresh,
  onSubmit
}: QuerySectionProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-600 mb-2">
        Select parameters to filter your voter data.
      </p>
      
      <QueryBuilder
        query={query || {}} // Ensure query is never undefined
        setQuery={setQuery}
        setError={setError}
        isLoading={isLoading}
        isDataMigrated={isDataMigrated}
        onRefresh={onRefresh}
      />
      
      <div className="mt-6">
        <Button 
          onClick={onSubmit}
          disabled={isLoading}
          variant="default"
          className="w-full"
          size="sm"
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
              Get Results
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
