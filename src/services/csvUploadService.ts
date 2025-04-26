
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
  onError: (message: string) => void,
  fieldMapping?: Record<string, string> | null
): Promise<ValidationStats> => {
  try {
    const { headers, data } = await parseCSV(file);
    // Use field mapping dialog if provided
    let mappingObj: Record<string, string>;
    if (fieldMapping) {
      mappingObj = fieldMapping;
    } else {
      // Fallback to smart guess mapping
      const { headerMapping } = mapHeaders(headers);
      mappingObj = {};
      Object.entries(headerMapping).forEach(([idx, dbField]) => {
        mappingObj[dbField] = headers[parseInt(idx)];
      });
    }

    // Reorder the csv data columns according to mapping for processing
    const reorderedHeaderArr = Object.entries(mappingObj)
      .filter(([dbField, header]) => header)
      .map(([dbField, header]) => header);
    const headerIndexMap: Record<number, string> = {};
    reorderedHeaderArr.forEach((header, i) => {
      const csvHeaderIdx = headers.indexOf(header);
      if (csvHeaderIdx !== -1) {
        headerIndexMap[i] = Object.keys(mappingObj).find(key => mappingObj[key] === header)!;
      }
    });

    // Now process data with correct mapping
    const transformedData = transformCSVData(data, headerIndexMap);

    const { validData, invalidData } = validateAndEnhanceData(transformedData);

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

    await ensureVoterContactsTableExists();
    await clearExistingContacts();
    await uploadDataBatches(validData, setProgress, email);

    await updateUserMetadata(userId, file.name);
    onSuccess();

    return validationStats;

  } catch (error: any) {
    console.error('Error uploading data:', error);
    let errorMessage = 'There was an error uploading your data. ';
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
