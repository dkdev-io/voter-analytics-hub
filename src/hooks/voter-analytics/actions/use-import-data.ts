
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { importNewDataset } from "@/services/voter-analytics-service";

interface UseImportDataProps {
  setIsLoading: (loading: boolean) => void;
  setDataStats: (stats: any) => void;
  setDataLastUpdated: (date: Date | null) => void;
  refreshData: () => Promise<boolean>;
}

export const useImportData = ({
  setIsLoading,
  setDataStats,
  setDataLastUpdated,
  refreshData,
}: UseImportDataProps) => {
  const { toast } = useToast();

  const importNewData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await importNewDataset();

      if (result.success) {
        toast({
          title: "Data Import Successful",
          description: `Imported ${result.message}`,
          variant: "default",
        });

        setDataStats(result.stats);
        setDataLastUpdated(new Date());

        // Refresh the data after successful import
        await refreshData();
        return true;
      } else {
        toast({
          title: "Import Error",
          description: result.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      console.error("Error in data import:", err);
      toast({
        title: "Import Error",
        description: "Failed to import new dataset.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast, refreshData, setDataStats, setDataLastUpdated, setIsLoading]);

  return { importNewData };
};
