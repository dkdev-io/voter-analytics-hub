
import { type QueryParams } from "@/types/analytics";
import { useChartData } from "@/hooks/voter-analytics/use-chart-data";
import { useFormattedChartData } from "@/hooks/voter-analytics/use-formatted-chart-data";
import { useDatasetName } from "@/hooks/voter-analytics/use-dataset-name";

interface UseDataLoaderProps {
  query: Partial<QueryParams>;
  showFilteredData: boolean;
}

export const useDataLoader = ({
  query,
  showFilteredData,
}: UseDataLoaderProps) => {
  // Fetch raw chart data
  const { metrics, isLoading, debugInfo } = useChartData({ 
    query, 
    showFilteredData 
  });
  
  // Format the chart data
  const {
    tacticsData,
    contactsData,
    notReachedData,
    lineChartData,
    totalAttempts,
    totalContacts,
    totalNotReached,
  } = useFormattedChartData({ 
    metrics, 
    isLoading 
  });
  
  // Generate dataset name
  const { datasetName } = useDatasetName({ query });

  return {
    tacticsData,
    contactsData,
    notReachedData,
    lineChartData,
    totalAttempts,
    totalContacts,
    totalNotReached,
    loading: isLoading,
    datasetName,
    debugNotHome: debugInfo.debugNotHome,
    debugRawRows: debugInfo.debugRawRows
  };
};
