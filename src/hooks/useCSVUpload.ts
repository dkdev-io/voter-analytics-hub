
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { parseCSV } from '@/utils/csvUtils';
import { 
  mapHeaders, 
  transformCSVData, 
  validateAndEnhanceData, 
  clearExistingContacts, 
  uploadDataBatches 
} from '@/utils/csvDataProcessing';

export function useCSVUpload(onSuccess: () => void) {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [step, setStep] = useState<'upload' | 'processing'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const { toast } = useToast();

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
      const validData = validateAndEnhanceData(transformedData);
      
      console.log("Valid data count:", validData.length);
      console.log("Sample valid data:", validData.slice(0, 2));
      
      if (validData.length === 0) {
        throw new Error('No valid data found in CSV. Please ensure CSV contains required fields: first_name, last_name, team, date, and tactic.');
      }
      
      await uploadDataBatches(validData, setProgress);
      
      toast({
        title: 'Data uploaded successfully',
        description: `${validData.length} records imported to your database.`,
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
    handleFileChange,
    handleSubmitFile,
    resetUpload
  };
}
