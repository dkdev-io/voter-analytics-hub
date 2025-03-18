
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { parseCSV } from '@/utils/csvUtils';
import { 
  mapHeaders, 
  transformCSVData, 
  validateAndEnhanceData, 
  clearExistingContacts, 
  uploadDataBatches 
} from '@/utils/csvDataProcessing';
import { useAuth } from '@/hooks/useAuth';

export function useCSVUpload(onSuccess: () => void) {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [step, setStep] = useState<'upload' | 'processing'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [validationStats, setValidationStats] = useState<{
    total: number;
    valid: number;
    invalid: number;
    reasons: Record<string, number>;
  } | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a CSV file',
          variant: 'destructive',
        });
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: 'File too large',
          description: 'Please upload a file smaller than 10MB',
          variant: 'destructive',
        });
        return;
      }

      setFile(selectedFile);
    }
  };

  const processCSVFile = async (file: File) => {
    try {
      const { headers, data } = await parseCSV(file);
      console.log("Parsed CSV headers:", headers);
      console.log("First few rows:", data.slice(0, 3));
      console.log("Total rows in CSV:", data.length);
      
      setHeaders(headers);
      setCsvData(data);
      
      handleUpload(headers, data);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast({
        title: 'Error parsing CSV',
        description: 'The file could not be parsed correctly.',
        variant: 'destructive',
      });
    }
  };

  const handleUpload = async (headers: string[], csvData: string[][]) => {
    if (!file || !csvData.length) return;
    
    setStep('processing');
    setIsUploading(true);
    
    try {
      console.log("Deleting ALL existing records before import...");
      
      await clearExistingContacts();
      
      const { headerMapping } = mapHeaders(headers);
      console.log("Header mapping:", headerMapping);
      
      const transformedData = transformCSVData(csvData, headerMapping);
      const { validData, invalidData } = validateAndEnhanceData(transformedData);
      
      console.log("Valid data count:", validData.length);
      console.log("Invalid data count:", invalidData.length);
      console.log("Sample valid data:", validData.slice(0, 2));
      
      if (validData.length === 0) {
        throw new Error('No valid data found in CSV. Please ensure CSV contains required fields: first_name, last_name, team, date, and tactic.');
      }
      
      // Collect stats on invalid records
      const reasonCounts: Record<string, number> = {};
      invalidData.forEach(({ reason }) => {
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
      });
      
      setValidationStats({
        total: transformedData.length,
        valid: validData.length,
        invalid: invalidData.length,
        reasons: reasonCounts
      });

      const userEmail = user?.email || 'unknown';
      
      await uploadDataBatches(validData, setProgress, userEmail);
      
      // Provide detailed information about the import
      const importMessage = validData.length === transformedData.length
        ? `${validData.length} records imported to your database as "voter contact - ${userEmail}".`
        : `${validData.length} of ${transformedData.length} records imported as "voter contact - ${userEmail}". ${invalidData.length} records were skipped due to missing required fields.`;
      
      toast({
        title: 'Data uploaded successfully',
        description: importMessage,
      });
      
      console.log("Clearing data cache after successful upload");
      
      onSuccess();
      
      setTimeout(() => {
        resetUpload();
      }, 500);
    } catch (error) {
      console.error('Error uploading data:', error);
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your data. ' + (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setStep('upload');
      setProgress(0);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setCsvData([]);
    setHeaders([]);
    setStep('upload');
    setIsUploading(false);
    setProgress(0);
    setValidationStats(null);
  };

  const handleSubmitFile = () => {
    if (file) {
      processCSVFile(file);
    } else {
      toast({
        title: 'No file selected',
        description: 'Please select a CSV file to upload',
        variant: 'destructive',
      });
    }
  };

  return {
    file,
    step,
    isUploading,
    progress,
    validationStats,
    handleFileChange,
    handleSubmitFile,
    resetUpload,
    userEmail: user?.email
  };
}
