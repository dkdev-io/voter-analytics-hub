
import { supabase } from '@/integrations/supabase/client';
import { isUsingMockData, getTestData } from './migrationService';
import type { QueryParams } from '@/types/analytics';

// Function to calculate result based on query parameters
export const calculateResultFromSupabase = async (query: Partial<QueryParams>) => {
  try {
    if (!query.tactic && !query.resultType && !query.person && !query.date) {
      return { error: "Please select at least one field", result: null };
    }

    // Handle mock data if Supabase connection is not available
    if (isUsingMockData()) {
      return calculateResultFromMockData(query);
    }

    // Start building the Supabase query
    let supabaseQuery = supabase.from('voter_contacts').select('*');
    
    // Add filters based on query parameters
    if (query.tactic && query.tactic !== 'All') {
      supabaseQuery = supabaseQuery.eq('tactic', query.tactic);
    }
    
    if (query.date && query.date !== 'All') {
      supabaseQuery = supabaseQuery.eq('date', query.date);
    }
    
    if (query.person && query.person !== 'All') {
      let firstName, lastName;
      
      if (query.person === "Candidate Carter") {
        firstName = "Candidate";
        lastName = "Carter";
      } else if (query.person === "Dan Kelly") {
        firstName = "Dan";
        lastName = "Kelly";
      } else {
        const nameParts = query.person.split(" ");
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(" ");
      }
      
      supabaseQuery = supabaseQuery
        .eq('first_name', firstName)
        .eq('last_name', lastName);
    }
    
    // Execute the query
    const { data, error } = await supabaseQuery;
    
    if (error) throw error;
    
    // Map the display result type to the actual property name in the data
    let resultType = query.resultType ? 
      query.resultType.toLowerCase().replace(/ /g, "_") : 
      "attempts";
    
    // Special handling for "Not Home" to map to "not_home" property
    if (resultType === "not_home") {
      resultType = "not_home";
    } else if (resultType === "bad_data") {
      resultType = "bad_data";
    }
    
    if (data.length === 0) {
      return { result: 0, error: null };
    } else {
      const total = data.reduce((sum, item) => {
        return sum + (item[resultType as keyof typeof item] as number || 0);
      }, 0);
      
      return { result: total, error: null };
    }
  } catch (error) {
    console.error("Error calculating result:", error);
    return { error: "Unknown error", result: null };
  }
};

// Function to calculate result from mock data
const calculateResultFromMockData = (query: Partial<QueryParams>) => {
  let filteredData = getTestData();
  
  // Apply filters
  if (query.tactic && query.tactic !== 'All') {
    filteredData = filteredData.filter(item => item.tactic === query.tactic);
  }
  
  if (query.date && query.date !== 'All') {
    filteredData = filteredData.filter(item => item.date === query.date);
  }
  
  if (query.person && query.person !== 'All') {
    let firstName, lastName;
    
    if (query.person === "Candidate Carter") {
      firstName = "Candidate";
      lastName = "Carter";
    } else if (query.person === "Dan Kelly") {
      firstName = "Dan";
      lastName = "Kelly";
    } else {
      const nameParts = query.person.split(" ");
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(" ");
    }
    
    filteredData = filteredData.filter(
      item => item.first_name === firstName && item.last_name === lastName
    );
  }
  
  // Map result type
  let resultType = query.resultType ? 
    query.resultType.toLowerCase().replace(/ /g, "_") : 
    "attempts";
  
  // Special handling for "Not Home" to map to "not_home" property
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
};
