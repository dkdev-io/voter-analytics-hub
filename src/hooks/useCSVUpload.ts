
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { validateFileType, validateFileSize } from '@/utils/csvUploadValidation';
import { processCSVFile, ValidationStats } from '@/services/csvUploadService';
import { parseCSV } from '@/utils/csvUtils';

export function useCSVUpload(onSuccess: () => void) {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<'upload' | 'mapping' | 'processing'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [validationStats, setValidationStats] = useState<ValidationStats>(null);
  const [csvHeaders, setCSVHeaders] = useState<string[]>([]);
  const [csvSampleData, setCSVSampleData] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string> | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!validateFileType(selectedFile, toast)) return;
      if (!validateFileSize(selectedFile, 10, toast)) return;

      setFile(selectedFile);

      // Step 1: Parse to preview headers
      try {
        const { headers, data } = await parseCSV(selectedFile);
        setCSVHeaders(headers);
        setCSVSampleData(data.slice(0, 3));
        setStep('mapping');
      } catch (err) {
        toast({
          title: 'Could not parse file',
          description: 'Please check your CSV file and try again.',
          variant: 'destructive'
        });
        setFile(null);
        setCSVHeaders([]);
        setCSVSampleData([]);
        setStep('upload');
      }
    }
  };

  const handleMappingComplete = (selectedMapping: Record<string, string>) => {
    setMapping(selectedMapping);
    setStep('processing');
    handleSubmitFile(selectedMapping);
  };

  const handleSubmitFile = (passedMapping?: Record<string, string> | null) => {
    if (file) {
      setStep('processing');
      setIsUploading(true);

      processCSVFile(
        file,
        setProgress,
        user?.id || '',
        user?.email,
        handleUploadSuccess,
        handleUploadError,
        passedMapping || mapping
      ).then(stats => {
        if (stats) {
          setValidationStats(stats);
        }
      });
    } else {
      toast({
        title: 'No file selected',
        description: 'Please select a CSV file to upload',
        variant: 'destructive',
      });
    }
  };

  const handleUploadSuccess = () => {
    toast({
      title: 'Data uploaded successfully',
      description: `${file?.name} has been successfully imported.`,
    });

    onSuccess();

    setTimeout(() => {
      resetUpload();
    }, 500);
  };

  const handleUploadError = (errorMessage: string) => {
    toast({
      title: 'Upload failed',
      description: errorMessage,
      variant: 'destructive',
    });
    setIsUploading(false);
    setStep('upload');
    setProgress(0);
  };

  const resetUpload = () => {
    setFile(null);
    setStep('upload');
    setIsUploading(false);
    setProgress(0);
    setValidationStats(null);
    setCSVHeaders([]);
    setCSVSampleData([]);
    setMapping(null);
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
    userEmail: user?.email,
    csvHeaders,
    csvSampleData,
    mapping,
    handleMappingComplete,
  };
}
