
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { refreshSupabaseData } from "@/services/voter-analytics-service";

interface UseRefreshDataProps {
  setIsLoading: (loading: boolean) => void;
  setDataLastUpdated: (date: Date | null) => void;
}

export const useRefreshData = ({
  setIsLoading,
  setDataLastUpdated,
}: UseRefreshDataProps) => {
  const { toast } = useToast();

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await refreshSupabaseData();

      if (result.success) {
        toast({
          title: "Data Refresh",
          description: "Successfully refreshed connection to Supabase.",
          variant: "default",
        });

        setDataLastUpdated(new Date());
        return true;
      } else {
        toast({
          title: "Refresh Error",
          description: "Failed to refresh connection: " + result.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
      toast({
        title: "Refresh Error",
        description: "Failed to refresh data.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast, setDataLastUpdated, setIsLoading]);

  return { refreshData };
};
