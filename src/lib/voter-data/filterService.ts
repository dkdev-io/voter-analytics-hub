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
  
  // Extract date information using regex for standard formats
  // Handle both YYYY-MM-DD and MM-DD-YYYY formats
  const isoDateRegex = /\b\d{4}-\d{2}-\d{2}\b/g;
  const usDateRegex = /\b\d{2}-\d{2}-\d{4}\b/g;
  const isoDateMatches = query.match(isoDateRegex);
  const usDateMatches = query.match(usDateRegex);
  
  if (isoDateMatches && isoDateMatches.length > 0) {
    // Validate the date
    const dateStr = isoDateMatches[0];
    if (isValidDate(dateStr)) {
      extractedParams.date = dateStr;
      console.log("Extracted ISO date:", extractedParams.date);
    } else {
      console.warn("Invalid ISO date format detected:", dateStr);
    }
  } else if (usDateMatches && usDateMatches.length > 0) {
    // Convert MM-DD-YYYY to YYYY-MM-DD
    const parts = usDateMatches[0].split('-');
    const isoDate = `${parts[2]}-${parts[0]}-${parts[1]}`;
    
    if (isValidDate(isoDate)) {
      extractedParams.date = isoDate;
      console.log("Converted US date to ISO:", extractedParams.date);
    } else {
      console.warn("Invalid US date format detected:", usDateMatches[0]);
    }
  } else {
    // Try to extract dates in other formats or with natural language
    const datePatterns = [
      { regex: /january\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i, month: '01' },
      { regex: /february\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i, month: '02' },
      { regex: /march\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i, month: '03' },
      { regex: /april\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i, month: '04' },
      { regex: /may\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i, month: '05' },
      { regex: /june\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i, month: '06' },
      { regex: /july\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i, month: '07' },
      { regex: /august\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i, month: '08' },
      { regex: /september\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i, month: '09' },
      { regex: /october\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i, month: '10' },
      { regex: /november\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i, month: '11' },
      { regex: /december\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i, month: '12' },
    ];
    
    for (const pattern of datePatterns) {
      const match = query.match(pattern.regex);
      if (match) {
        let day = match[1].padStart(2, '0');
        const year = match[2];
        const isoDate = `${year}-${pattern.month}-${day}`;
        
        if (isValidDate(isoDate)) {
          extractedParams.date = isoDate;
          console.log("Extracted natural language date:", extractedParams.date);
          break;
        }
      }
    }
  }
  
  // Extract person information
  const peopleNames = [
    { first: 'jane', last: 'doe' },
    { first: 'john', last: 'smith' },
    { first: 'dan', last: 'kelly' },
    { first: 'sarah', last: 'johnson' },
    { first: 'alex', last: 'johnson' },
    { first: 'chris', last: 'brown' },
    { first: 'maria', last: 'martinez' }
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
 * Validates whether a date string is a valid date in YYYY-MM-DD format
 */
function isValidDate(dateString: string): boolean {
  // First check the format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }
  
  // Parse the date parts and create a date object
  const parts = dateString.split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  
  // Check the ranges of month and day
  if (month < 1 || month > 12) {
    return false;
  }
  
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > lastDayOfMonth) {
    return false;
  }
  
  return true;
}

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
