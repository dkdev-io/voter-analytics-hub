
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database } from "lucide-react";

interface DataMigrationAlertProps {
  isDataMigrated: boolean;
}

export const DataMigrationAlert = ({ isDataMigrated }: DataMigrationAlertProps) => {
  if (isDataMigrated) {
    return null;
  }
  
  return (
    <div className="flex justify-center mb-6">
      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="text-blue-700 flex items-center">
          <Database className="mr-2 h-4 w-4" />
          Connecting to Supabase database...
        </AlertDescription>
      </Alert>
    </div>
  );
};
