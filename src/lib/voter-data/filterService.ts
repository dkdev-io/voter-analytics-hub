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
  
  // Extract person information - removed hard-coded names list, we'll use regex to find names
  const nameRegex = /\b([A-Za-z]+)\s+([A-Za-z]+)\b/g;
  const matches = [...query.matchAll(nameRegex)];
  
  // Prioritize matches that look like names (first letter capitalized)
  if (matches.length > 0) {
    // Take the first full name match
    const [fullMatch, firstName, lastName] = matches[0];
    const formattedName = `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${lastName.charAt(0).toUpperCase() + lastName.slice(1)}`;
    extractedParams.person = formattedName;
    console.log("Extracted person using regex:", extractedParams.person);
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
  console.log("Filter voter data called with query:", query);
  
  // Debug log for person filter
  if (query.person) {
    console.log(`Looking for person: "${query.person}"`);
    
    // Log all matching names in the dataset to help debug
    const matchingNames = data
      .filter(item => {
        const fullName = `${item.first_name || ''} ${item.last_name || ''}`.toLowerCase();
        const queryName = query.person?.toLowerCase() || '';
        return fullName.includes(queryName);
      })
      .map(item => `${item.first_name} ${item.last_name}`);
    
    console.log(`Potential name matches in dataset: ${matchingNames.slice(0, 10).join(', ')}${matchingNames.length > 10 ? '...' : ''}`);
  }
  
  // Regular filtering for all queries
  const filteredData = data.filter(item => {
    // For debugging
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
    
    // Apply person filter with case-insensitive matching
    if (includeRecord && query.person && query.person !== 'All') {
      // Use standardized case-insensitive comparison for names
      const queryFirstName = query.firstName?.toLowerCase() || '';
      const queryLastName = query.lastName?.toLowerCase() || '';
      
      const itemFirstName = (item.first_name || '').toLowerCase();
      const itemLastName = (item.last_name || '').toLowerCase();
      
      // For names with both first and last name specified
      if (queryFirstName && queryLastName) {
        // Apply exact match for both first and last name
        if (itemFirstName !== queryFirstName || itemLastName !== queryLastName) {
          filterLog += `Failed person filter: query=${queryFirstName} ${queryLastName}, item=${itemFirstName} ${itemLastName}`;
          includeRecord = false;
        }
      } else {
        // For single name queries, do partial matching
        const fullName = `${item.first_name || ''} ${item.last_name || ''}`.toLowerCase();
        if (!fullName.includes(query.person.toLowerCase())) {
          filterLog += `Failed person filter (single name): query=${query.person}, item=${fullName}`;
          includeRecord = false;
        }
      }
    }
    
    // Apply search query
    if (includeRecord && query.searchQuery && !query.person && !query.tactic && !query.date) {
      const searchLower = query.searchQuery.toLowerCase();
      const fullName = `${item.first_name} ${item.last_name}`.toLowerCase();
      const teamLower = item.team ? item.team.toLowerCase() : '';
      const tacticLower = item.tactic ? item.tactic.toLowerCase() : '';
      
      if (!fullName.includes(searchLower) && 
          !teamLower.includes(searchLower) && 
          !tacticLower.includes(searchLower)) {
        filterLog += `Failed search filter: query=${query.searchQuery}`;
        includeRecord = false;
      }
    }
    
    // Debug logging for all records
    if (query.person && includeRecord) {
      console.log(`INCLUDED: ${item.first_name} ${item.last_name}, ${item.date}, ${item.tactic}, attempts=${item.attempts}`);
    }
    
    return includeRecord;
  });
  
  console.log(`Filtered data count: ${filteredData.length} (from ${data.length})`);
  
  // If person filter returns no results, try fallback matching
  if (filteredData.length === 0 && query.person) {
    console.warn(`No records found for person: ${query.person}. Trying case-insensitive search...`);
    
    return data.filter(item => {
      if (!query.person) return false;
      
      const queryNames = query.person.split(' ');
      if (queryNames.length < 2) return false;
      
      const queryFirstName = queryNames[0].toLowerCase();
      const queryLastName = queryNames.slice(1).join(' ').toLowerCase();
      
      const itemFirstName = (item.first_name || '').toLowerCase();
      const itemLastName = (item.last_name || '').toLowerCase();
      
      const matchesFirstName = itemFirstName.includes(queryFirstName) || queryFirstName.includes(itemFirstName);
      const matchesLastName = itemLastName.includes(queryLastName) || queryLastName.includes(itemLastName);
      
      const matches = matchesFirstName && matchesLastName;
      
      if (matches) {
        console.log(`Case-insensitive match found: ${item.first_name} ${item.last_name}`);
      }
      
      return matches;
    });
  }
  
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
    const teamLower = item.team ? item.team.toLowerCase() : '';
    const tacticLower = item.tactic ? item.tactic.toLowerCase() : '';
    
    return fullName.includes(searchLower) || 
           teamLower.includes(searchLower) || 
           tacticLower.includes(searchLower);
  });
};
