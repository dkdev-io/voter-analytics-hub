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
 * Results of the validation process
 */
export interface ValidationResult {
  validData: Record<string, any>[];
  invalidData: Array<{row: Record<string, any>, reason: string}>;
}

/**
 * Enhance and validate the transformed data
 */
export const validateAndEnhanceData = (transformedData: Record<string, any>[]): ValidationResult => {
  const validData: Record<string, any>[] = [];
  const invalidData: Array<{row: Record<string, any>, reason: string}> = [];
  
  transformedData.forEach(row => {
    const enhancedRow = { ...row };
    
    // Set default values for numeric fields
    if (!('attempts' in enhancedRow)) enhancedRow.attempts = 0;
    if (!('contacts' in enhancedRow)) enhancedRow.contacts = 0;
    if (!('not_home' in enhancedRow)) enhancedRow.not_home = 0;
    if (!('bad_data' in enhancedRow)) enhancedRow.bad_data = 0;
    if (!('refusal' in enhancedRow)) enhancedRow.refusal = 0;
    if (!('support' in enhancedRow)) enhancedRow.support = 0;
    if (!('oppose' in enhancedRow)) enhancedRow.oppose = 0;
    if (!('undecided' in enhancedRow)) enhancedRow.undecided = 0;
    
    // Set default team if missing
    if (!enhancedRow.team) {
      enhancedRow.team = 'Team Tony';
    }
    
    // Validate required fields
    const missingFields = [];
    if (!enhancedRow.first_name) missingFields.push('first_name');
    if (!enhancedRow.last_name) missingFields.push('last_name');
    if (!enhancedRow.date) missingFields.push('date');
    if (!enhancedRow.tactic) missingFields.push('tactic');
    
    // Add to valid or invalid data based on validation
    if (missingFields.length === 0) {
      validData.push(enhancedRow);
    } else {
      invalidData.push({
        row: enhancedRow,
        reason: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
  });
  
  return { validData, invalidData };
};

/**
 * Clear existing voter contacts data for the current user
 */
export const clearExistingContacts = async (): Promise<void> => {
  // Get the current user's ID
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    console.error("No user ID found when clearing contacts");
    throw new Error("You must be logged in to upload data");
  }
  
  console.log(`Deleting voter contact records for user ${userId}...`);
  
  // Delete only this user's records
  const { error } = await supabase
    .from('voter_contacts')
    .delete()
    .eq('user_id', userId);
  
  if (error) {
    console.error("Error deleting records:", error);
    throw new Error(`Failed to clear existing records. Please try again or contact support. Error: ${error.message}`);
  }
  
  console.log(`Successfully deleted voter contact records for user ${userId}`);
};

/**
 * Upload processed data to Supabase
 */
export const uploadDataBatches = async (
  validData: Record<string, any>[], 
  onProgressUpdate: (progress: number) => void,
  userEmail?: string
): Promise<void> => {
  const batchSize = 100;
  const batches = [];
  
  // Get the current user's ID
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  const email = userEmail || sessionData.session?.user.email;
  
  if (!userId) {
    console.error("No user ID found when uploading data");
    throw new Error("You must be logged in to upload data");
  }
  
  // Create label for the data
  const label = `voter contact - ${email}`;
  
  // Add the user ID, email, and label to each row
  const dataWithUserInfo = validData.map(item => ({
    ...item,
    user_id: userId,
    user_email: email,
    label: label
  }));
  
  for (let i = 0; i < dataWithUserInfo.length; i += batchSize) {
    batches.push(dataWithUserInfo.slice(i, i + batchSize));
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

// Helper function for is_not condition
function is_not(value: any) {
  return {
    __is_not: value
  };
}
