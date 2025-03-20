
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { validateFileType, validateFileSize } from '@/utils/csvUploadValidation';
import { processCSVFile, ValidationStats } from '@/services/csvUploadService';

export function useCSVUpload(onSuccess: () => void) {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<'upload' | 'processing'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [validationStats, setValidationStats] = useState<ValidationStats>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!validateFileType(selectedFile, toast)) return;
      if (!validateFileSize(selectedFile, 10, toast)) return;

      setFile(selectedFile);
    }
  };

  const handleSubmitFile = () => {
    if (file) {
      setStep('processing');
      setIsUploading(true);
      
      processCSVFile(
        file,
        setProgress,
        user?.id || '',
        user?.email,
        handleUploadSuccess,
        handleUploadError
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
    
    console.log("Clearing data cache after successful upload");
    
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
