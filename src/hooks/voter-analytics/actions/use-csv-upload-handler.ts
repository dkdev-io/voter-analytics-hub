
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseCsvUploadHandlerProps {
  setDataLastUpdated: (date: Date | null) => void;
  refreshData: () => Promise<boolean>;
  setQuery: (query: any) => void;
  setError: (error: string | null) => void;
}

export const useCsvUploadHandler = ({
  setDataLastUpdated,
  refreshData,
  setQuery,
  setError,
}: UseCsvUploadHandlerProps) => {
  const { toast } = useToast();

  const handleCsvUploadSuccess = useCallback(async () => {
    setDataLastUpdated(new Date());

    // Clear any cached data and force a complete refresh of all metadata
    const success = await refreshData();

    if (success) {
      toast({
        title: "Data Refreshed",
        description: "Successfully refreshed data after CSV upload.",
        variant: "default",
      });

      // Clear the query state to avoid showing stale results
      setQuery({});
      setError(null);
    }
  }, [refreshData, toast, setQuery, setError, setDataLastUpdated]);

  return { handleCsvUploadSuccess };
};
