
import { useState } from 'react';
import { DataMigrationAlert } from "../DataMigrationAlert";
import { QuerySection } from "./QuerySection";
import { SearchSection } from "./SearchSection";
import { DataImportButton } from "../DataImportButton";
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
  importNewData
}: DashboardHeaderProps) {
  const [showImportButton, setShowImportButton] = useState(true);
  const { toast } = useToast();
  
  const handleImport = async () => {
    const success = await importNewData();
    if (success) {
      setShowImportButton(false);
      toast({
        title: "Data Updated",
        description: "New dataset has been imported. Please refresh the metadata to see the changes.",
        variant: "default"
      });
      // Reset any selections
      setQuery({});
    }
    return success;
  };

  return (
    <div className="space-y-6 mt-4 mb-8">
      {!isDataMigrated && (
        <DataMigrationAlert />
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold">Voter Analytics Dashboard</h1>
        {showImportButton && (
          <DataImportButton onImport={handleImport} isLoading={isLoading} />
        )}
      </div>
      
      <div className="space-y-6">
        <QuerySection 
          query={query || {}} 
          setQuery={setQuery} 
          setError={setError} 
          isLoading={isLoading} 
          isDataMigrated={isDataMigrated}
          onRefresh={() => Promise.resolve()}
        />
        
        <SearchSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isLoading={isLoading}
          onSubmit={calculateResult}
        />
      </div>
    </div>
  );
}
