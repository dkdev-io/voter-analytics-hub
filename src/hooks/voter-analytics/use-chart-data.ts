
import { useState, useEffect } from "react";
import { type VoterMetrics, type QueryParams, CHART_COLORS } from "@/types/analytics";
import { fetchVoterMetrics } from "@/lib/voter-data";

interface UseChartDataProps {
  query: Partial<QueryParams>;
  showFilteredData: boolean;
}

export const useChartData = ({ query, showFilteredData }: UseChartDataProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<VoterMetrics | null>(null);
  const [debugInfo, setDebugInfo] = useState({
    debugNotHome: null as number | null,
    debugRawRows: [] as any[]
  });

  useEffect(() => {
    console.log("Chart data hook triggered with query:", query, "showFiltered:", showFilteredData);
  }, [query, showFilteredData]);

  useEffect(() => {
    let isMounted = true;
    
    const loadMetricsData = async () => {
      try {
        setIsLoading(true);
        const shouldFilter = showFilteredData || query.person || query.tactic;
        console.log("Loading metrics with filter:", shouldFilter ? "yes" : "no");
        
        // Debug raw data
        let rawData: any[] = [];
        try {
          const { getTestData } = await import("@/lib/voter-data");
          rawData = await getTestData();
          console.log("[DEBUG] Raw Supabase data sample (first 5):", rawData.slice(0, 5));
          
          // Debug: Check specific fields in the data
          const notHomeSum = rawData.reduce((sum, r) => sum + (Number(r.not_home) || 0), 0);
          const badDataSum = rawData.reduce((sum, r) => sum + (Number(r.bad_data) || 0), 0);
          const refusalSum = rawData.reduce((sum, r) => sum + (Number(r.refusal) || 0), 0);
          const attemptsSum = rawData.reduce((sum, r) => sum + (Number(r.attempts) || 0), 0);
          
          console.log("[DEBUG] Sum of attempts in all records:", attemptsSum);
          console.log("[DEBUG] Sum of not_home in all records:", notHomeSum);
          console.log("[DEBUG] Sum of bad_data in all records:", badDataSum);
          console.log("[DEBUG] Sum of refusal in all records:", refusalSum);
          
          if (isMounted) {
            setDebugInfo({
              debugNotHome: notHomeSum,
              debugRawRows: rawData.slice(0, 5)
            });
          }
        } catch (e) {
          console.error("[DEBUG] Could not log raw Supabase data", e);
        }

        // Fetch metrics with optional filtering
        const fetchedMetrics = await fetchVoterMetrics(
          shouldFilter ? query : undefined,
        );
        
        console.log("[DEBUG] Fetched metrics:", fetchedMetrics);
        console.log("[DEBUG] Fetched date data:", fetchedMetrics.byDate);
        
        if (isMounted) {
          setMetrics(fetchedMetrics);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading chart data:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadMetricsData();
    
    return () => {
      isMounted = false;
    };
  }, [query, showFilteredData]);

  return {
    isLoading,
    metrics,
    debugInfo,
  };
};
