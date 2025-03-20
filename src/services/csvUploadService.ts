
import { supabase } from '@/integrations/supabase/client';
import { parseCSV } from '@/utils/csvUtils';
import { 
  mapHeaders, 
  transformCSVData, 
  validateAndEnhanceData, 
  clearExistingContacts, 
  uploadDataBatches,
  ensureVoterContactsTableExists
} from '@/utils/csvDataProcessing';
import { updateUserMetadata } from '@/utils/userMetadataUtils';

export type ValidationStats = {
  total: number;
  valid: number;
  invalid: number;
  reasons: Record<string, number>;
} | null;

export const processCSVFile = async (
  file: File,
  setProgress: (progress: number) => void,
  userId: string,
  userEmail: string | null | undefined,
  onSuccess: () => void,
  onError: (message: string) => void
): Promise<ValidationStats> => {
  try {
    const { headers, data } = await parseCSV(file);
    console.log("Parsed CSV headers:", headers);
    console.log("First few rows:", data.slice(0, 3));
    console.log("Total rows in CSV:", data.length);
    
    return await uploadCSVData(file, headers, data, setProgress, userId, userEmail, onSuccess, onError);
  } catch (error) {
    console.error('Error parsing CSV:', error);
    onError('The file could not be parsed correctly.');
    return null;
  }
};

export const uploadCSVData = async (
  file: File,
  headers: string[],
  csvData: string[][],
  setProgress: (progress: number) => void,
  userId: string,
  userEmail: string | null | undefined,
  onSuccess: () => void,
  onError: (message: string) => void
): Promise<ValidationStats> => {
  try {
    console.log("Setting up for data import...");
    console.log(`Total rows from CSV: ${csvData.length}`);
    
    // First ensure the table exists
    await ensureVoterContactsTableExists();
    
    console.log("Deleting existing records before import...");
    
    await clearExistingContacts();
    
    const { headerMapping } = mapHeaders(headers);
    console.log("Header mapping:", headerMapping);
    
    const transformedData = transformCSVData(csvData, headerMapping);
    console.log(`Transformed data count: ${transformedData.length}`);
    
    const { validData, invalidData } = validateAndEnhanceData(transformedData);
    
    console.log("Valid data count:", validData.length);
    console.log("Invalid data count:", invalidData.length);
    console.log("Sample valid data:", validData.slice(0, 2));
    
    if (validData.length === 0) {
      throw new Error('No valid data found in CSV. Please ensure CSV contains required fields: first_name and last_name.');
    }
    
    // Collect stats on invalid records
    const reasonCounts: Record<string, number> = {};
    invalidData.forEach(({ reason }) => {
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });
    
    const validationStats = {
      total: transformedData.length,
      valid: validData.length,
      invalid: invalidData.length,
      reasons: reasonCounts
    };

    const email = userEmail || 'unknown';
    
    await uploadDataBatches(validData, setProgress, email);
    
    // Store the dataset name and upload date in user metadata
    await updateUserMetadata(userId, file.name);
    
    // Provide detailed information about the import
    const importMessage = validData.length === transformedData.length
      ? `${validData.length} records imported to your database as "voter contact - ${email}".`
      : `${validData.length} of ${transformedData.length} records imported as "voter contact - ${email}". ${invalidData.length} records were skipped due to missing required fields.`;
    
    onSuccess();
    
    return validationStats;
    
  } catch (error: any) {
    console.error('Error uploading data:', error);
    let errorMessage = 'There was an error uploading your data. ';
    
    // Handle specific database errors
    if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
      errorMessage += 'Database setup issue. Please contact support.';
    } else if (error.code === '42P01') {
      errorMessage += 'Database table not found. Please contact support.';
    } else {
      errorMessage += error.message || 'Unknown error occurred.';
    }
    
    onError(errorMessage);
    return null;
  }
};
