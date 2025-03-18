
import type { QueryParams } from '@/types/analytics';

/**
 * Extracts structured query parameters from natural language search query
 */
export const extractQueryParameters = (searchQuery: string): Partial<QueryParams> => {
  const query = searchQuery.toLowerCase();
  const extractedParams: Partial<QueryParams> = {};
  
  console.log("Extracting parameters from:", query);
  
  // Extract tactic information
  if (query.includes('sms')) {
    extractedParams.tactic = 'SMS';
  } else if (query.includes('phone') || query.includes('call')) {
    extractedParams.tactic = 'Phone';
  } else if (query.includes('canvas')) {
    extractedParams.tactic = 'Canvas';
  }
  
  // Extract date information using regex
  const dateRegex = /\b\d{4}-\d{2}-\d{2}\b/g;
  const dateMatches = query.match(dateRegex);
  if (dateMatches && dateMatches.length > 0) {
    extractedParams.date = dateMatches[0];
    console.log("Extracted date:", extractedParams.date);
  }
  
  // Extract person information
  const peopleNames = [
    { first: 'jane', last: 'doe' },
    { first: 'john', last: 'smith' },
    { first: 'dan', last: 'kelly' },
    { first: 'sarah', last: 'johnson' }
  ];
  
  for (const person of peopleNames) {
    // Check if both first and last name are in the query
    if (query.includes(person.first) && query.includes(person.last)) {
      const fullName = person.first.charAt(0).toUpperCase() + 
                      person.first.slice(1) + ' ' + 
                      person.last.charAt(0).toUpperCase() + 
                      person.last.slice(1);
      extractedParams.person = fullName;
      console.log("Extracted person:", extractedParams.person);
      break;
    }
  }
  
  // Extract team information
  if (query.includes('team tony')) {
    extractedParams.team = 'Team Tony';
  } else if (query.includes('team sarah')) {
    extractedParams.team = 'Team Sarah';
  }
  
  // Extract result type (usually the metric we're looking for)
  if (query.includes('attempts') || query.includes('make') || query.includes('made')) {
    extractedParams.resultType = 'attempts';
  } else if (query.includes('contacts') || query.includes('reached')) {
    extractedParams.resultType = 'contacts';
  } else if (query.includes('not home') || query.includes('absent')) {
    extractedParams.resultType = 'notHome';
  } else if (query.includes('refusal') || query.includes('refused')) {
    extractedParams.resultType = 'refusal';
  } else if (query.includes('bad data')) {
    extractedParams.resultType = 'badData';
  } else if (query.includes('support') || query.includes('supported')) {
    extractedParams.resultType = 'support';
  } else if (query.includes('oppose') || query.includes('opposed')) {
    extractedParams.resultType = 'oppose';
  } else if (query.includes('undecided')) {
    extractedParams.resultType = 'undecided';
  }
  
  // Default to attempts if no specific metric mentioned
  if (!extractedParams.resultType) {
    extractedParams.resultType = 'attempts';
  }
  
  console.log("Final extracted parameters:", extractedParams);
  return extractedParams;
};

/**
 * Filters voter data based on query parameters
 */
export const filterVoterData = (data: any[], query: Partial<QueryParams>) => {
  // Regular filtering for all queries
  const filteredData = data.filter(item => {
    // For extensive debugging
    let includeRecord = true;
    let filterLog = `Record ID ${item.id} (${item.first_name} ${item.last_name}, ${item.date}, ${item.tactic}): `;
    
    // Apply tactic filter
    if (query.tactic && query.tactic !== 'All' && item.tactic !== query.tactic) {
      filterLog += `Failed tactic filter: query=${query.tactic}, item=${item.tactic}`;
      includeRecord = false;
    }
    
    // Apply date filter with date range support
    if (includeRecord && query.date && query.date !== 'All') {
      // Convert dates to timestamps for comparison
      const itemDate = new Date(item.date).getTime();
      const startDate = new Date(query.date).getTime();
      
      // If endDate is specified, use date range
      if (query.endDate && query.endDate !== 'All') {
        const endDate = new Date(query.endDate).getTime();
        
        // Check if item date is within range (inclusive of start and end dates)
        if (itemDate < startDate || itemDate > endDate) {
          filterLog += `Failed date range filter: query=${query.date} to ${query.endDate}, item=${item.date}`;
          includeRecord = false;
        }
      } else {
        // Single date filter
        if (item.date !== query.date) {
          filterLog += `Failed date filter: query=${query.date}, item=${item.date}`;
          includeRecord = false;
        }
      }
    }
    
    // Apply team filter
    if (includeRecord && query.team && query.team !== 'All' && item.team !== query.team) {
      filterLog += `Failed team filter: query=${query.team}, item=${item.team}`;
      includeRecord = false;
    }
    
    // Apply person filter with exact name matching
    if (includeRecord && query.person && query.person !== 'All') {
      const names = query.person.split(' ');
      const firstName = names[0];
      const lastName = names.length > 1 ? names[1] : '';
      
      // Normalize capitalization for case-insensitive comparison
      const normalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
      const normalizedLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
      
      if (item.first_name !== normalizedFirstName || item.last_name !== normalizedLastName) {
        filterLog += `Failed person filter: query=${query.person}, item=${item.first_name} ${item.last_name}`;
        includeRecord = false;
      }
    }
    
    // Apply search query
    if (includeRecord && query.searchQuery && !query.person && !query.tactic && !query.date) {
      const searchLower = query.searchQuery.toLowerCase();
      const fullName = `${item.first_name} ${item.last_name}`.toLowerCase();
      const teamLower = item.team.toLowerCase();
      const tacticLower = item.tactic.toLowerCase();
      
      if (!fullName.includes(searchLower) && 
          !teamLower.includes(searchLower) && 
          !tacticLower.includes(searchLower)) {
        filterLog += `Failed search filter: query=${query.searchQuery}`;
        includeRecord = false;
      }
    }
    
    // Debug output for specific records
    if (query.person && item.first_name === query.person.split(' ')[0] && 
        item.last_name === query.person.split(' ')[1]) {
      if (includeRecord) {
        console.log(`INCLUDED ${filterLog}`);
      } else {
        console.log(`EXCLUDED ${filterLog}`);
      }
    }
    
    return includeRecord;
  });
  
  return filteredData;
};

/**
 * Searches voter data based on a search query
 */
export const searchFilterVoterData = (data: any[], searchQuery: string) => {
  if (!searchQuery.trim()) {
    return [];
  }
  
  return data.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${item.first_name} ${item.last_name}`.toLowerCase();
    const teamLower = item.team.toLowerCase();
    const tacticLower = item.tactic.toLowerCase();
    
    return fullName.includes(searchLower) || 
           teamLower.includes(searchLower) || 
           tacticLower.includes(searchLower);
  });
};
