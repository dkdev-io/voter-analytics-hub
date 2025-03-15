import type { QueryParams, VoterMetrics } from '@/types/analytics';
import { getTestData } from './migrationService';

export const calculateResultFromSupabase = async (query: Partial<QueryParams>) => {
  try {
    console.log("Calculating result with query:", query);
    
    if (!query.tactic && !query.resultType && !query.person && !query.date && !query.searchQuery) {
      return { error: "Please select at least one field", result: null };
    }

    // Get the data from Supabase
    const data = await getTestData();
    console.log("Raw data count:", data.length);
    
    // Display records for Dan Kelly with date 2025-01-31 and tactic Phone
    if (query.person === "Dan Kelly" && query.date === "2025-01-31" && query.tactic === "Phone") {
      const relevantData = data.filter(item => 
        item.first_name === "Dan" && 
        item.last_name === "Kelly" && 
        item.date === "2025-01-31" && 
        item.tactic === "Phone"
      );
      console.log("Dan Kelly records for 2025-01-31 with tactic Phone:", relevantData.map(item => 
        `ID: ${item.id}, Date: ${item.date}, Tactic: ${item.tactic}, Attempts: ${item.attempts}`
      ));
      
      // Expected total should be 17
      const expectedTotal = relevantData.reduce((sum, item) => sum + (item.attempts || 0), 0);
      console.log("Expected total for Dan Kelly on 2025-01-31 with tactic Phone:", expectedTotal);
    }
    
    // Filter the data based on query parameters
    const filteredData = data.filter(item => {
      // For debug tracking
      let filterFailReason = "";
      
      // Apply tactic filter
      if (query.tactic && query.tactic !== 'All' && item.tactic !== query.tactic) {
        filterFailReason = `Tactic mismatch: query=${query.tactic}, item=${item.tactic}`;
        return false;
      }
      
      // Apply date filter with exact match
      if (query.date && query.date !== 'All' && item.date !== query.date) {
        filterFailReason = `Date mismatch: query=${query.date}, item=${item.date}`;
        return false;
      }
      
      // Apply team filter
      if (query.team && query.team !== 'All' && item.team !== query.team) {
        filterFailReason = `Team mismatch: query=${query.team}, item=${item.team}`;
        return false;
      }
      
      // Apply person filter with exact name matching
      if (query.person && query.person !== 'All') {
        const names = query.person.split(' ');
        const firstName = names[0];
        const lastName = names.length > 1 ? names[1] : '';
        
        if (item.first_name !== firstName || item.last_name !== lastName) {
          filterFailReason = `Person mismatch: query=${query.person}, item=${item.first_name} ${item.last_name}`;
          return false;
        }
      }
      
      // Apply search query
      if (query.searchQuery) {
        const searchLower = query.searchQuery.toLowerCase();
        const fullName = `${item.first_name} ${item.last_name}`.toLowerCase();
        const teamLower = item.team.toLowerCase();
        const tacticLower = item.tactic.toLowerCase();
        
        if (!fullName.includes(searchLower) && 
            !teamLower.includes(searchLower) && 
            !tacticLower.includes(searchLower)) {
          filterFailReason = `Search query mismatch: query=${query.searchQuery}`;
          return false;
        }
      }
      
      return true;
    });
    
    // Log filtered data for debugging
    console.log(`Filtered data count: ${filteredData.length}`);
    
    if (query.person === "Dan Kelly" && query.tactic === "Phone" && query.date === "2025-01-31") {
      console.log("CRITICAL DEBUG: Filtered items for Dan Kelly + Phone + 2025-01-31:");
      filteredData.forEach(item => {
        console.log(`ID: ${item.id}, Date: ${item.date}, Attempts: ${item.attempts}, Tactic: ${item.tactic}`);
      });
    }
    
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
      // Calculate the sum
      let total = 0;
      
      for (const item of filteredData) {
        const value = Number(item[resultType as keyof typeof item]) || 0;
        
        if (query.person === "Dan Kelly" && query.tactic === "Phone" && query.date === "2025-01-31") {
          console.log(`Adding ${value} from item ${item.id} to total ${total}`);
        }
        
        total += value;
      }
      
      // One more verification
      if (query.person === "Dan Kelly" && query.date === "2025-01-31" && query.tactic === "Phone") {
        console.log(`Final total for Dan Kelly on 2025-01-31 with tactic Phone: ${total}`);
      }
      
      return { result: total, error: null };
    }
  } catch (error) {
    console.error("Error calculating result:", error);
    return { error: "Error processing data", result: null };
  }
};

export const searchVoterData = async (searchQuery: string) => {
  try {
    if (!searchQuery.trim()) {
      return { data: [], error: null };
    }
    
    const data = await getTestData();
    const searchLower = searchQuery.toLowerCase();
    
    const searchResults = data.filter(item => {
      const fullName = `${item.first_name} ${item.last_name}`.toLowerCase();
      const teamLower = item.team.toLowerCase();
      const tacticLower = item.tactic.toLowerCase();
      
      return fullName.includes(searchLower) || 
             teamLower.includes(searchLower) || 
             tacticLower.includes(searchLower);
    });
    
    return { data: searchResults, error: null };
  } catch (error) {
    console.error("Error searching voter data:", error);
    return { data: [], error: "Error searching data" };
  }
};

export const fetchVoterMetrics = async (query?: Partial<QueryParams>): Promise<VoterMetrics> => {
  try {
    const data = await getTestData();
    
    // If query provided, filter the data
    const filteredData = query ? data.filter(item => {
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
      
      // Apply search query if provided
      if (query.searchQuery) {
        const searchLower = query.searchQuery.toLowerCase();
        const fullName = `${item.first_name} ${item.last_name}`.toLowerCase();
        const teamLower = item.team.toLowerCase();
        const tacticLower = item.tactic.toLowerCase();
        
        if (!fullName.includes(searchLower) && 
            !teamLower.includes(searchLower) && 
            !tacticLower.includes(searchLower)) {
          return false;
        }
      }
      
      return true;
    }) : data;
    
    // Initialize metrics structure
    const metrics: VoterMetrics = {
      tactics: {
        sms: 0,
        phone: 0,
        canvas: 0
      },
      contacts: {
        support: 0,
        oppose: 0,
        undecided: 0
      },
      notReached: {
        notHome: 0,
        refusal: 0,
        badData: 0
      },
      teamAttempts: {},
      byDate: []
    };
    
    // Get unique dates
    const uniqueDates = [...new Set(filteredData.map(item => item.date))].sort();
    
    // Create byDate data structure
    const dateData = uniqueDates.map(date => {
      const dateItems = filteredData.filter(item => item.date === date);
      const attempts = dateItems.reduce((sum, item) => sum + (item.attempts || 0), 0);
      const contacts = dateItems.reduce((sum, item) => sum + (item.contacts || 0), 0);
      // "issues" are the sum of not_home, refusal, and bad_data
      const issues = dateItems.reduce((sum, item) => 
        sum + (item.not_home || 0) + (item.refusal || 0) + (item.bad_data || 0), 0);
      
      return {
        date,
        attempts,
        contacts,
        issues
      };
    });
    
    metrics.byDate = dateData;
    
    // Aggregate data
    filteredData.forEach(item => {
      // Aggregate by tactic
      if (item.tactic.toLowerCase() === 'sms') {
        metrics.tactics.sms += item.attempts || 0;
      } else if (item.tactic.toLowerCase() === 'phone') {
        metrics.tactics.phone += item.attempts || 0;
      } else if (item.tactic.toLowerCase() === 'canvas') {
        metrics.tactics.canvas += item.attempts || 0;
      }
      
      // Aggregate contacts by result
      metrics.contacts.support += item.support || 0;
      metrics.contacts.oppose += item.oppose || 0;
      metrics.contacts.undecided += item.undecided || 0;
      
      // Aggregate not reached
      metrics.notReached.notHome += item.not_home || 0;
      metrics.notReached.refusal += item.refusal || 0;
      metrics.notReached.badData += item.bad_data || 0;
      
      // Aggregate attempts by team
      const teamName = item.team;
      if (!metrics.teamAttempts![teamName]) {
        metrics.teamAttempts![teamName] = 0;
      }
      metrics.teamAttempts![teamName] += item.attempts || 0;
    });
    
    return metrics;
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
