
import { useState } from 'react';
import { DataMigrationAlert } from "../DataMigrationAlert";
import { useToast } from "@/hooks/use-toast";

interface DashboardHeaderProps {
  query: any;
  setQuery: (query: any) => void;
  error: string | null;
  setError: (error: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  isDataMigrated: boolean;
  calculateResult: () => void;
  importNewData: () => Promise<boolean>;
  refreshData?: () => Promise<void>;
}

export function DashboardHeader({
  query,
  setQuery,
  error,
  setError,
  searchQuery,
  setSearchQuery,
  isLoading,
  isDataMigrated,
  calculateResult,
  importNewData,
  refreshData
}: DashboardHeaderProps) {
  const { toast } = useToast();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  
  const handleRefresh = async () => {
    if (refreshData) {
      try {
        await refreshData();
        toast({
          title: "Data refreshed",
          description: "Your data has been refreshed successfully.",
        });
      } catch (error) {
        toast({
          title: "Refresh failed",
          description: "There was an error refreshing your data.",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleCSVUploadSuccess = async () => {
    toast({
      title: "CSV Upload Complete",
      description: "Your data has been successfully imported.",
    });
    
    if (refreshData) {
      await refreshData();
    }
  };
  
  return (
    <div className="space-y-6 mt-4 mb-8">
      {!isDataMigrated && (
        <DataMigrationAlert isDataMigrated={isDataMigrated} />
      )}
    </div>
  );
}
