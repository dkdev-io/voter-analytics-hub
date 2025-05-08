
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { calculateQueryResult } from "@/services/voter-analytics-service";
import { type QueryParams } from "@/types/analytics";

interface UseCalculateResultProps {
  query: Partial<QueryParams>;
  setError: (error: string | null) => void;
  searchQuery: string;
  setIsLoading: (loading: boolean) => void;
  setShowFilteredData: (show: boolean) => void;
}

export const useCalculateResult = ({
  query,
  setError,
  searchQuery,
  setIsLoading,
  setShowFilteredData,
}: UseCalculateResultProps) => {
  const { toast } = useToast();

  const calculateResult = useCallback(async () => {
    // Check if we have any query parameters to use
    if (
      !query.tactic &&
      !query.resultType &&
      !query.person &&
      !query.date &&
      !query.team &&
      !query.searchQuery
    ) {
      setError(
        "Please select at least one filter criteria or enter a search term",
      );
      return;
    }

    try {
      setIsLoading(true);

      // Update the query with searchQuery if provided and not already set
      const updatedQuery = {
        ...query,
        searchQuery: query.searchQuery || searchQuery,
      };

      const { result: calculatedResult, error: calculationError } =
        await calculateQueryResult(updatedQuery);

      if (calculationError) {
        setError(calculationError);
        toast({
          title: "Query Error",
          description: calculationError,
          variant: "destructive",
        });
        return;
      }

      if (calculatedResult === 0) {
        setError(null);
        toast({
          title: "No Data Found",
          description: "No records match your search criteria. Result is 0.",
          variant: "default",
        });
      } else {
        setError(null);
        toast({
          title: "Query Complete",
          description: `Found result: ${calculatedResult}`,
          variant: "default",
        });
      }

      // Show filtered data in charts
      setShowFilteredData(true);
    } finally {
      setIsLoading(false);
    }
  }, [query, searchQuery, setError, setIsLoading, setShowFilteredData, toast]);

  return { calculateResult };
};
