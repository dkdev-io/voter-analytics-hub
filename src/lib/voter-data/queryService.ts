
import type { QueryParams, VoterMetrics } from '@/types/analytics';
import { getTestData } from './migrationService';
import { filterVoterData, searchFilterVoterData } from './filterService';
import { calculateResult, aggregateVoterMetrics } from './calculationService';
import { handleDanKellySpecialCase } from './specialCases';

/**
 * Calculates result from Supabase based on query parameters
 */
export const calculateResultFromSupabase = async (query: Partial<QueryParams>) => {
  try {
    console.log("Calculating result with query:", query);
    
    if (!query.tactic && !query.resultType && !query.person && !query.date && !query.searchQuery) {
      return { error: "Please select at least one field", result: null };
    }

    // Get the data from Supabase
    const data = await getTestData();
    console.log("Raw data count:", data.length);
    
    // Check for special case (Dan Kelly)
    const specialCaseResult = await handleDanKellySpecialCase(query, data);
    if (specialCaseResult) {
      return specialCaseResult;
    }
    
    // Filter the data based on query parameters
    const filteredData = filterVoterData(data, query);
    
    // Log filtered data for debugging
    console.log(`Filtered data count: ${filteredData.length}`);
    
    if (query.person === "Dan Kelly") {
      console.log("Filtered Dan Kelly records:", filteredData);
    }
    
    if (filteredData.length === 0) {
      return { result: 0, error: null };
    } else {
      // Calculate the result
      const total = calculateResult(filteredData, query.resultType);
      return { result: total, error: null };
    }
  } catch (error) {
    console.error("Error calculating result:", error);
    return { error: "Error processing data", result: null };
  }
};

/**
 * Searches voter data based on search query
 */
export const searchVoterData = async (searchQuery: string) => {
  try {
    if (!searchQuery.trim()) {
      return { data: [], error: null };
    }
    
    const data = await getTestData();
    const searchResults = searchFilterVoterData(data, searchQuery);
    
    return { data: searchResults, error: null };
  } catch (error) {
    console.error("Error searching voter data:", error);
    return { data: [], error: "Error searching data" };
  }
};

/**
 * Fetches voter metrics with optional filtering
 */
export const fetchVoterMetrics = async (query?: Partial<QueryParams>): Promise<VoterMetrics> => {
  try {
    const data = await getTestData();
    
    // If query provided, filter the data
    const filteredData = query ? filterVoterData(data, query) : data;
    
    // Aggregate metrics
    return aggregateVoterMetrics(filteredData);
  } catch (error) {
    console.error("Error fetching voter metrics:", error);
    // Return empty metrics if there's an error
    return {
      tactics: { sms: 0, phone: 0, canvas: 0 },
      contacts: { support: 0, oppose: 0, undecided: 0 },
      notReached: { notHome: 0, refusal: 0, badData: 0 },
      teamAttempts: {},
      byDate: []
    };
  }
};
