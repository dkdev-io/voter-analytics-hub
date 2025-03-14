
import type { QueryParams } from '@/types/analytics';
import { getTestData } from './migrationService';

export const calculateResultFromSupabase = async (query: Partial<QueryParams>) => {
  try {
    console.log("Calculating result with query:", query);
    
    if (!query.tactic && !query.resultType && !query.person && !query.date) {
      return { error: "Please select at least one field", result: null };
    }

    // Get the mock data
    const data = getTestData();
    console.log("Using mock data:", data);
    
    // Filter the data based on query parameters
    const filteredData = data.filter(item => {
      // Apply tactic filter
      if (query.tactic && query.tactic !== 'All' && item.tactic !== query.tactic) {
        return false;
      }
      
      // Apply date filter
      if (query.date && query.date !== 'All' && item.date !== query.date) {
        return false;
      }
      
      // Apply team filter
      if (query.team && query.team !== 'All' && item.team !== query.team) {
        return false;
      }
      
      // Apply person filter
      if (query.person && query.person !== 'All') {
        const fullName = `${item.first_name} ${item.last_name}`;
        if (fullName !== query.person) {
          return false;
        }
      }
      
      return true;
    });
    
    console.log("Filtered data:", filteredData);
    
    // Map the display result type to the actual property name in the data
    let resultType = query.resultType ? 
      query.resultType.toLowerCase().replace(/ /g, "_") : 
      "attempts";
    
    // Special handling for specific property names
    if (resultType === "not_home") {
      resultType = "not_home";
    } else if (resultType === "bad_data") {
      resultType = "bad_data";
    }
    
    if (filteredData.length === 0) {
      return { result: 0, error: null };
    } else {
      const total = filteredData.reduce((sum, item) => {
        return sum + (item[resultType as keyof typeof item] as number || 0);
      }, 0);
      
      return { result: total, error: null };
    }
  } catch (error) {
    console.error("Error calculating result:", error);
    return { error: "Error processing data", result: null };
  }
};
