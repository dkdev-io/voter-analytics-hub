
import { supabase } from '@/integrations/supabase/client';

interface HeaderMappingResult {
  headerMapping: Record<number, string>;
  mappedFields: string[];
}

/**
 * Maps CSV headers to database fields
 */
export const mapHeaders = (headers: string[]): HeaderMappingResult => {
  const headerMapping: Record<number, string> = {};
  
  const headerVariations: Record<string, string[]> = {
    'first_name': ['first_name', 'firstname', 'first', 'fname', 'name', 'given name'],
    'last_name': ['last_name', 'lastname', 'last', 'lname', 'surname', 'family name'],
    'team': ['team', 'team_name', 'teamname', 'group', 'department', 'organization', 'org'],
    'date': ['date', 'contact_date', 'day', 'timestamp', 'contact date'],
    'tactic': ['tactic', 'type', 'contact_type', 'method', 'channel', 'medium'],
    'attempts': ['attempts', 'attempt', 'tried', 'tries', 'total_attempts', 'total attempts'],
    'contacts': ['contacts', 'contact', 'reached', 'connected', 'success', 'successful'],
    'not_home': ['not_home', 'nothome', 'nh', 'not_at_home', 'away', 'absent', 'not available'],
    'refusal': ['refusal', 'refused', 'decline', 'rejected', 'no', 'not interested', 'negative'],
    'bad_data': ['bad_data', 'baddata', 'bad', 'invalid', 'error', 'incorrect', 'wrong number'],
    'support': ['support', 'supports', 'for', 'positive', 'yes', 'favorable', 'agree'],
    'oppose': ['oppose', 'opposed', 'against', 'negative', 'disagree', 'unfavorable'],
    'undecided': ['undecided', 'unsure', 'maybe', 'neutral', 'thinking', 'considering']
  };
  
  headers.forEach((header, index) => {
    const normalizedHeader = header.trim().toLowerCase();
    
    for (const [dbField, variations] of Object.entries(headerVariations)) {
      if (variations.includes(normalizedHeader)) {
        headerMapping[index] = dbField;
        break;
      }
    }
  });

  return { 
    headerMapping, 
    mappedFields: Object.values(headerMapping) 
  };
};

/**
 * Transforms CSV data into the format expected by the database
 */
export const transformCSVData = (csvData: string[][], headerMapping: Record<number, string>): Record<string, any>[] => {
  const transformedData = csvData.map(row => {
    const transformedRow: Record<string, any> = {};
    
    Object.entries(headerMapping).forEach(([index, dbField]) => {
      const idx = parseInt(index);
      let value = row[idx]?.trim() || '';
      
      if (['attempts', 'contacts', 'not_home', 'bad_data', 'refusal', 'support', 'oppose', 'undecided'].includes(dbField)) {
        transformedRow[dbField] = parseInt(value) || 0;
      } else {
        if (dbField === 'team' && value) {
          const lowercaseTeam = value.toLowerCase();
          if (lowercaseTeam.includes('tony')) {
            value = 'Team Tony';
          } else if (lowercaseTeam.includes('party') || lowercaseTeam.includes('local')) {
            value = 'Local Party';
          } else if (lowercaseTeam.includes('candidate')) {
            value = 'Candidate';
          }
          transformedRow[dbField] = value;
        }
        
        if (dbField === 'date' && value) {
          try {
            const dateObj = new Date(value);
            if (!isNaN(dateObj.getTime())) {
              value = dateObj.toISOString().split('T')[0];
            }
          } catch (e) {
            console.warn(`Could not parse date: ${value}`, e);
          }
          transformedRow[dbField] = value;
        }
        
        transformedRow[dbField] = value;
      }
    });
    
    return transformedRow;
  });

  return transformedData;
};

/**
 * Enhance and validate the transformed data
 */
export const validateAndEnhanceData = (transformedData: Record<string, any>[]): Record<string, any>[] => {
  return transformedData.map(row => {
    const enhancedRow = { ...row };
    
    if (!('attempts' in enhancedRow)) enhancedRow.attempts = 0;
    if (!('contacts' in enhancedRow)) enhancedRow.contacts = 0;
    if (!('not_home' in enhancedRow)) enhancedRow.not_home = 0;
    if (!('bad_data' in enhancedRow)) enhancedRow.bad_data = 0;
    if (!('refusal' in enhancedRow)) enhancedRow.refusal = 0;
    if (!('support' in enhancedRow)) enhancedRow.support = 0;
    if (!('oppose' in enhancedRow)) enhancedRow.oppose = 0;
    if (!('undecided' in enhancedRow)) enhancedRow.undecided = 0;
    
    if (!enhancedRow.team) {
      enhancedRow.team = 'Team Tony';
    }
    
    return enhancedRow;
  }).filter(row => 
    row.first_name && row.last_name && row.team && row.date && row.tactic);
};

/**
 * Clear existing voter contacts data
 */
export const clearExistingContacts = async (): Promise<void> => {
  const { error } = await supabase.rpc('truncate_voter_contacts', {});
  
  if (error) {
    console.error("Error truncating table:", error);
    throw new Error(`Failed to clear existing records. Please try again or contact support.`);
  }
  
  console.log("Successfully truncated table using RPC call");
};

/**
 * Upload processed data to Supabase
 */
export const uploadDataBatches = async (
  validData: Record<string, any>[], 
  onProgressUpdate: (progress: number) => void
): Promise<void> => {
  const batchSize = 100;
  const batches = [];
  
  for (let i = 0; i < validData.length; i += batchSize) {
    batches.push(validData.slice(i, i + batchSize));
  }
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    
    const { error } = await supabase
      .from('voter_contacts')
      .insert(batch);
    
    if (error) throw error;
    
    const progressValue = Math.round(((i + 1) / batches.length) * 100);
    onProgressUpdate(progressValue);
  }
};
