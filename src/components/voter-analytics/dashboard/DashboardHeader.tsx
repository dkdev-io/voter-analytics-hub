
import { useState } from 'react';
import { DataMigrationAlert } from "../DataMigrationAlert";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RefreshCw, Upload } from "lucide-react";
import { CSVUploadDialog } from "../CSVUploadDialog";

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Voter Analytics Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {lastUpdated ? (
              <>Last updated: {lastUpdated.toLocaleString()}</>
            ) : (
              <>No data loaded yet</>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => setIsUploadDialogOpen(true)}
          >
            <Upload className="h-4 w-4" />
            Upload CSV
          </Button>
        </div>
      </div>
      
      {!isDataMigrated && (
        <DataMigrationAlert isDataMigrated={isDataMigrated} />
      )}
      
      <CSVUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onSuccess={handleCSVUploadSuccess}
      />
    </div>
  );
}
