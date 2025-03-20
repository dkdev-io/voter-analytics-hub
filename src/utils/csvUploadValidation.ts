
import { useToast } from '@/hooks/use-toast';

export const validateFileType = (file: File, toast: ReturnType<typeof useToast>['toast']): boolean => {
  if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
    toast({
      title: 'Invalid file type',
      description: 'Please upload a CSV file',
      variant: 'destructive',
    });
    return false;
  }
  return true;
};

export const validateFileSize = (file: File, maxSizeMB: number, toast: ReturnType<typeof useToast>['toast']): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    toast({
      title: 'File too large',
      description: `Please upload a file smaller than ${maxSizeMB}MB`,
      variant: 'destructive',
    });
    return false;
  }
  return true;
};
