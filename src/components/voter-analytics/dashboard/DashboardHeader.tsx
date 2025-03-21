
import { useState } from 'react';
import { DataMigrationAlert } from "../DataMigrationAlert";
import { useToast } from "@/hooks/use-toast";

interface DashboardHeaderProps {
  lastUpdated: Date;
  isDataMigrated: boolean;
  dataStats: any;
  refreshData: () => Promise<void>;
  importNewData: () => Promise<boolean>;
  handleCsvUploadSuccess: () => Promise<void>;
}

export function DashboardHeader({
  lastUpdated,
  isDataMigrated,
  dataStats,
  refreshData,
  importNewData,
  handleCsvUploadSuccess
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
    
    if (handleCsvUploadSuccess) {
      await handleCsvUploadSuccess();
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
