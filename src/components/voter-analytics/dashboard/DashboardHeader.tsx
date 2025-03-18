
import { useState } from 'react';
import { DataMigrationAlert } from "../DataMigrationAlert";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { FileUp, RefreshCw } from "lucide-react";
import { DataImportButton } from "../DataImportButton";
import { CSVUploadDialog } from "../CSVUploadDialog";

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
    
    // Refresh data
    if (refreshData) {
      await refreshData();
    }
  };
  
  return (
    <div className="space-y-6 mt-4 mb-8">
      {!isDataMigrated && (
        <DataMigrationAlert isDataMigrated={isDataMigrated} />
      )}
      
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        
        <DataImportButton 
          onImport={importNewData} 
          isLoading={isLoading} 
        />
        
        <Button 
          variant="default"
          size="sm"
          onClick={() => setIsUploadDialogOpen(true)}
        >
          <FileUp className="h-4 w-4 mr-2" />
          Upload CSV
        </Button>
      </div>
      
      <CSVUploadDialog 
        open={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onSuccess={handleCSVUploadSuccess}
      />
    </div>
  );
}
