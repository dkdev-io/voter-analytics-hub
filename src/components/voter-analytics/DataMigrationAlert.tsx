
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Database, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataMigrationAlertProps {
  isDataMigrated: boolean;
  connectionError: string | null;
  isLoading: boolean;
  retryConnection?: () => Promise<void>;
}

export const DataMigrationAlert = ({ 
  isDataMigrated, 
  connectionError,
  isLoading,
  retryConnection
}: DataMigrationAlertProps) => {
  // No error, no migration needed, or migration complete - don't show anything
  if (isDataMigrated && !connectionError) {
    return null;
  }
  
  return (
    <div className="flex justify-center mb-6">
      {connectionError ? (
        <Alert className="bg-red-50 border-red-200 max-w-2xl">
          <AlertTitle className="text-red-700 flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Supabase Connection Error
          </AlertTitle>
          <AlertDescription className="text-red-600 mt-2">
            <p className="mb-3">{connectionError}</p>
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={retryConnection}
                disabled={isLoading}
                className="bg-white hover:bg-red-50"
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...</>
                ) : (
                  <><RefreshCw className="mr-2 h-4 w-4" /> Retry Connection</>
                )}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-700 flex items-center">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Database className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Connecting to Supabase database..." : "Initializing Supabase connection..."}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
