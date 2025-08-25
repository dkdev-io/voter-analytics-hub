
import { supabase } from '@/integrations/supabase/client';
import { 
  analyzeCSVData, 
  generateSuggestedMappings, 
  normalizeDate,
  createDynamicFieldDefinitions
} from './flexibleCsvMapping';
import { 
  ColumnMapping, 
  FieldDefinition, 
  ProcessingResult, 
  ValidationError,
  CORE_FIELD_DEFINITIONS 
} from '@/types/csvMapping';

interface HeaderMappingResult {
  headerMapping: Record<number, string>;
  mappedFields: string[];
  dynamicFields?: Record<string, any>;
}

/**
 * Enhanced CSV header mapping using flexible mapping system
 */
export const mapHeaders = (headers: string[], customMapping?: Record<string, string>): HeaderMappingResult => {
  console.log('mapHeaders called with:', { headers, customMapping });
  
  let headerMapping: Record<number, string> = {};
  const dynamicFields: Record<string, any> = {};
  
  if (customMapping) {
    // Use provided mapping
    headers.forEach((header, index) => {
      const dbField = customMapping[header];
      if (dbField) {
        headerMapping[index] = dbField;
      }
    });
  } else {
    // Fall back to legacy mapping for backward compatibility
    const headerVariations: Record<string, string[]> = {
      'first_name': ['first_name', 'firstname', 'first', 'fname', 'name', 'given name'],
      'last_name': ['last_name', 'lastname', 'last', 'lname', 'surname', 'family name'],
      'team': ['team', 'team_name', 'teamname', 'group', 'department', 'organization', 'org'],
      'date': ['date', 'contact_date', 'day', 'timestamp', 'contact date'],
      'tactic': ['tactic', 'type', 'contact_type', 'method', 'channel', 'medium'],
      'attempts': ['attempts', 'attempt', 'tried', 'tries', 'total_attempts', 'total attempts'],
      'contacts': ['contacts', 'contact', 'reached', 'connected', 'success', 'successful'],
      'not_home': ['not_home', 'nothome', 'nh', 'not_at_home', 'away', 'absent', 'not available', 'nh'],
      'refusal': ['refusal', 'refused', 'decline', 'rejected', 'no', 'not interested', 'negative', 'ref'],
      'bad_data': ['bad_data', 'baddata', 'bad', 'invalid', 'error', 'incorrect', 'wrong number', 'bd'],
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
      
      // If no match found, check if it looks like a dynamic field
      if (!headerMapping[index]) {
        const cleanHeader = header.toLowerCase().replace(/\s+/g, '_');
        // Store as dynamic field for potential custom mapping
        dynamicFields[`dynamic_${cleanHeader}`] = header;
      }
    });
  }
  
  console.log('Mapping result:', { headerMapping, mappedFields: Object.values(headerMapping), dynamicFields });
  
  return { 
    headerMapping, 
    mappedFields: Object.values(headerMapping),
    dynamicFields
  };
};

/**
 * Enhanced CSV analysis for flexible mapping
 */
export const analyzeCSVForMapping = (headers: string[], rows: string[][]) => {
  return analyzeCSVData(headers, rows);
};

/**
 * Enhanced CSV data transformation with flexible mapping support
 */
export const transformCSVData = (
  csvData: string[][], 
  headerMapping: Record<number, string>, 
  columnAnalysis?: Record<string, any>,
  fieldDefinitions?: FieldDefinition[]
): Record<string, any>[] => {
  console.log(`Starting transformation of ${csvData.length} rows with mapping:`, headerMapping);
  
  const fields = fieldDefinitions || CORE_FIELD_DEFINITIONS;
  const fieldMap = fields.reduce((acc, field) => {
    acc[field.key] = field;
    return acc;
  }, {} as Record<string, FieldDefinition>);
  
  const transformedData = csvData.map((row, rowIndex) => {
    const transformedRow: Record<string, any> = {};
    
    Object.entries(headerMapping).forEach(([index, dbField]) => {
      const idx = parseInt(index);
      let value = row[idx]?.trim() || '';
      
      if (!value) {
        transformedRow[dbField] = getDefaultValue(dbField, fieldMap[dbField]?.type);
        return;
      }
      
      const fieldDef = fieldMap[dbField];
      const fieldType = fieldDef?.type || 'string';
      
      // Transform based on field type
      switch (fieldType) {
        case 'number':
          transformedRow[dbField] = parseFloat(value) || 0;
          break;
          
        case 'date':
          const normalizedDate = normalizeDate(value, columnAnalysis?.[Object.keys(columnAnalysis)[idx]]?.dateFormats);
          transformedRow[dbField] = normalizedDate || new Date().toISOString().split('T')[0];
          break;
          
        case 'boolean':
          transformedRow[dbField] = parseBooleanValue(value);
          break;
          
        case 'category':
        case 'string':
        case 'name':
        case 'email':
        case 'phone':
        default:
          // Special handling for team normalization (legacy support)
          if (dbField === 'team' && value) {
            value = normalizeTeamValue(value);
          }
          transformedRow[dbField] = value;
          break;
      }
    });
    
    // Debug rows that might be problematic
    if (rowIndex < 5 || rowIndex === csvData.length - 1) {
      console.log(`Transformed row ${rowIndex}:`, transformedRow);
    }
    
    return transformedRow;
  });

  console.log(`Transformed ${transformedData.length} rows`);
  return transformedData;
};

/**
 * Get default value for a field type
 */
function getDefaultValue(fieldKey: string, fieldType?: string): any {
  if (fieldType === 'number') {
    return 0;
  }
  if (fieldType === 'boolean') {
    return false;
  }
  if (fieldType === 'date') {
    return new Date().toISOString().split('T')[0];
  }
  
  // Legacy defaults for specific fields
  if (fieldKey === 'team') {
    return 'Unknown Team';
  }
  if (fieldKey === 'tactic') {
    return 'Unknown';
  }
  
  return '';
}

/**
 * Parse boolean values from various string representations
 */
function parseBooleanValue(value: string): boolean {
  const lowerValue = value.toLowerCase().trim();
  return ['true', 'yes', '1', 'y', 'on'].includes(lowerValue);
}

/**
 * Normalize team values (legacy support)
 */
function normalizeTeamValue(value: string): string {
  const lowercaseTeam = value.toLowerCase();
  if (lowercaseTeam.includes('tony')) {
    return 'Team Tony';
  } else if (lowercaseTeam.includes('party') || lowercaseTeam.includes('local')) {
    return 'Local Party';
  } else if (lowercaseTeam.includes('candidate')) {
    return 'Candidate';
  }
  return value;
}

/**
 * Results of the validation process
 */
export interface ValidationResult {
  validData: Record<string, any>[];
  invalidData: Array<{row: Record<string, any>, reason: string}>;
}

/**
 * Enhanced validation with flexible field support
 */
export const validateAndEnhanceDataEnhanced = (
  transformedData: Record<string, any>[], 
  fieldDefinitions: FieldDefinition[] = CORE_FIELD_DEFINITIONS
): ProcessingResult => {
  console.log(`Validating ${transformedData.length} rows`);
  
  const validData: Record<string, any>[] = [];
  const invalidRows: Array<{ row: Record<string, any>; errors: ValidationError[] }> = [];
  const warnings: ValidationError[] = [];
  
  const requiredFields = fieldDefinitions.filter(f => f.required).map(f => f.key);
  const numericFields = fieldDefinitions.filter(f => f.type === 'number').map(f => f.key);
  
  transformedData.forEach((row, rowIndex) => {
    const enhancedRow = { ...row };
    const rowErrors: ValidationError[] = [];
    
    // Set defaults for numeric fields
    numericFields.forEach(field => {
      if (!(field in enhancedRow) || enhancedRow[field] === null || enhancedRow[field] === undefined) {
        enhancedRow[field] = 0;
      } else {
        const num = parseFloat(enhancedRow[field]);
        if (isNaN(num)) {
          rowErrors.push({
            row: rowIndex,
            column: field,
            value: enhancedRow[field],
            error: 'Invalid numeric value',
            severity: 'warning'
          });
          enhancedRow[field] = 0;
        } else {
          enhancedRow[field] = num;
        }
      }
    });
    
    // Apply field-specific defaults
    if (!enhancedRow.team) enhancedRow.team = 'Unknown Team';
    if (!enhancedRow.tactic) enhancedRow.tactic = 'Unknown';
    if (!enhancedRow.date) enhancedRow.date = new Date().toISOString().split('T')[0];
    
    // Handle name fields intelligently
    if (!enhancedRow.first_name && enhancedRow.last_name) {
      enhancedRow.first_name = "Unknown";
      warnings.push({
        row: rowIndex,
        column: 'first_name',
        value: '',
        error: 'Missing first name, using "Unknown"',
        severity: 'warning'
      });
    }
    
    if (!enhancedRow.last_name && enhancedRow.first_name) {
      enhancedRow.last_name = "Unknown";
      warnings.push({
        row: rowIndex,
        column: 'last_name',
        value: '',
        error: 'Missing last name, using "Unknown"',
        severity: 'warning'
      });
    }
    
    // Check required fields
    const missingRequired = requiredFields.filter(field => !enhancedRow[field] || enhancedRow[field] === '');
    
    if (missingRequired.length > 0) {
      missingRequired.forEach(field => {
        rowErrors.push({
          row: rowIndex,
          column: field,
          value: enhancedRow[field] || '',
          error: 'Required field missing',
          severity: 'error'
        });
      });
    }
    
    // Validate email format if present
    if (enhancedRow.email && enhancedRow.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(enhancedRow.email)) {
        rowErrors.push({
          row: rowIndex,
          column: 'email',
          value: enhancedRow.email,
          error: 'Invalid email format',
          severity: 'warning'
        });
      }
    }
    
    // Add to appropriate collection
    if (rowErrors.filter(e => e.severity === 'error').length === 0) {
      validData.push(enhancedRow);
    } else {
      invalidRows.push({ row: enhancedRow, errors: rowErrors });
    }
    
    // Collect warnings
    warnings.push(...rowErrors.filter(e => e.severity === 'warning'));
  });
  
  const result: ProcessingResult = {
    success: invalidRows.length === 0,
    validRows: validData,
    invalidRows,
    warnings,
    stats: {
      totalRows: transformedData.length,
      validRows: validData.length,
      invalidRows: invalidRows.length,
      warningRows: warnings.length
    }
  };
  
  console.log('Enhanced validation results:', result.stats);
  return result;
};

/**
 * Legacy validation function for backward compatibility
 */
export const validateAndEnhanceData = (transformedData: Record<string, any>[]): ValidationResult => {
  const result = validateAndEnhanceDataEnhanced(transformedData);
  return {
    validData: result.validRows,
    invalidData: result.invalidRows.map(item => ({
      row: item.row,
      reason: item.errors.map(e => e.error).join(', ')
    }))
  };
};

/**
 * Ensures the voter_contacts table exists for the current user
 */
export const ensureVoterContactsTableExists = async (): Promise<void> => {
  try {
    // Check if table exists by querying it
    const { error } = await supabase
      .from('voter_contacts')
      .select('id')
      .limit(1);
    
    if (error && error.code === '42P01') { // Table does not exist error code
      console.log("Table 'voter_contacts' does not exist. Creating it...");
      
      // Create the table with SQL (this requires appropriate permissions)
      const { error: createError } = await supabase.rpc('create_voter_contacts_table');
      
      if (createError) {
        console.error("Error creating table:", createError);
        throw new Error(`Failed to create the required database table: ${createError.message}`);
      }
      
      console.log("Table 'voter_contacts' created successfully");
    } else if (error) {
      console.error("Error checking table existence:", error);
      throw new Error(`Error checking database: ${error.message}`);
    } else {
      console.log("Table 'voter_contacts' already exists");
    }
  } catch (error) {
    console.error("Error in ensureVoterContactsTableExists:", error);
    throw error;
  }
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
 * Enhanced data upload with flexible field support
 */
export const uploadDataBatches = async (
  validData: Record<string, any>[], 
  onProgressUpdate: (progress: number) => void,
  userEmail?: string,
  customFields?: string[]
): Promise<void> => {
  const batchSize = 50;
  const batches = [];
  
  // Get the current user's ID
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  const email = userEmail || sessionData.session?.user.email;
  
  if (!userId) {
    console.error("No user ID found when uploading data");
    throw new Error("You must be logged in to upload data");
  }
  
  // Make sure the table exists
  await ensureVoterContactsTableExists();
  
  // Create label for the data using the user's email
  const label = `voter contact - ${email}`;
  
  // Prepare data with user info and field normalization
  const dataWithUserInfo = validData.map(item => {
    const normalizedItem = { ...item };
    
    // Ensure all expected fields are present with defaults
    const expectedFields = [
      'first_name', 'last_name', 'team', 'date', 'tactic',
      'attempts', 'contacts', 'not_home', 'refusal', 'bad_data',
      'support', 'oppose', 'undecided'
    ];
    
    expectedFields.forEach(field => {
      if (!(field in normalizedItem)) {
        if (['attempts', 'contacts', 'not_home', 'refusal', 'bad_data', 'support', 'oppose', 'undecided'].includes(field)) {
          normalizedItem[field] = 0;
        } else if (field === 'team') {
          normalizedItem[field] = 'Unknown Team';
        } else if (field === 'tactic') {
          normalizedItem[field] = 'Unknown';
        } else if (field === 'date') {
          normalizedItem[field] = new Date().toISOString().split('T')[0];
        } else {
          normalizedItem[field] = '';
        }
      }
    });
    
    // Add custom fields if they exist
    if (customFields) {
      customFields.forEach(field => {
        if (!(field in normalizedItem)) {
          normalizedItem[field] = '';
        }
      });
    }
    
    return {
      ...normalizedItem,
      user_id: userId,
      user_email: email,
      label: label
    };
  });
  
  for (let i = 0; i < dataWithUserInfo.length; i += batchSize) {
    batches.push(dataWithUserInfo.slice(i, i + batchSize));
  }
  
  console.log(`Prepared ${batches.length} batches of max ${batchSize} rows each`);
  
  let successfulBatches = 0;
  let failedBatches = 0;
  let totalRowsUploaded = 0;
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    
    try {
      const { error, data } = await supabase
        .from('voter_contacts')
        .insert(batch)
        .select('id');
      
      if (error) {
        console.error(`Error inserting batch ${i+1}/${batches.length}:`, error);
        failedBatches++;
        throw error;
      }
      
      successfulBatches++;
      totalRowsUploaded += batch.length;
      console.log(`Successfully uploaded batch ${i+1}/${batches.length} (${batch.length} rows)`);
    } catch (error) {
      console.error(`Failed to upload batch ${i+1}/${batches.length}:`, error);
      failedBatches++;
      // Continue with next batch instead of stopping the whole process
    }
    
    const progressValue = Math.round(((i + 1) / batches.length) * 100);
    onProgressUpdate(progressValue);
  }
  
  console.log(`Upload complete: ${successfulBatches} successful batches, ${failedBatches} failed batches`);
  console.log(`Total rows uploaded: ${totalRowsUploaded} of ${dataWithUserInfo.length}`);
  
  if (failedBatches > 0) {
    throw new Error(`Some data failed to upload (${failedBatches} of ${batches.length} batches). Please try again or contact support.`);
  }
};

// Helper function for is_not condition
function is_not(value: any) {
  return {
    __is_not: value
  };
}

// Note: Legacy export is handled by renaming the enhanced function above
