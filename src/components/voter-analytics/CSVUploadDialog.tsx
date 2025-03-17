
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileUploadStep } from './csv-upload/FileUploadStep';
import { ProcessingStep } from './csv-upload/ProcessingStep';
import { parseCSV } from '@/utils/csvUtils';

interface CSVUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CSVUploadDialog({ open, onClose, onSuccess }: CSVUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [step, setStep] = useState<'upload' | 'processing'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      // Don't process automatically - wait for the user to submit
    }
  };

  const processCSVFile = async (file: File) => {
    try {
      const { headers, data } = await parseCSV(file);
      setHeaders(headers);
      setCsvData(data);
      
      // Start upload after parsing
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
      // Map CSV headers to database fields
      const headerMapping: Record<number, string> = {};
      
      // Define the expected CSV headers and their corresponding database columns
      const expectedHeaders = {
        'first_name': 'first_name',
        'last_name': 'last_name',
        'team': 'team',
        'date': 'date',
        'tactic': 'tactic',
        'attempts': 'attempts',
        'contacts': 'contacts',
        'not_home': 'not_home',
        'refusal': 'refusal',
        'bad_data': 'bad_data',
        'support': 'support',
        'oppose': 'oppose',
        'undecided': 'undecided'
      };
      
      // Find the index of each expected header in the CSV
      headers.forEach((header, index) => {
        const normalizedHeader = header.trim().toLowerCase();
        if (expectedHeaders[normalizedHeader as keyof typeof expectedHeaders]) {
          headerMapping[index] = expectedHeaders[normalizedHeader as keyof typeof expectedHeaders];
        }
      });
      
      // Transform CSV data to match database schema
      const transformedData = csvData.map(row => {
        const transformedRow: Record<string, any> = {};
        
        Object.entries(headerMapping).forEach(([index, dbField]) => {
          const idx = parseInt(index);
          let value = row[idx]?.trim() || '';
          
          if (['attempts', 'contacts', 'not_home', 'bad_data', 'refusal', 'support', 'oppose', 'undecided'].includes(dbField)) {
            transformedRow[dbField] = parseInt(value) || 0;
          } else {
            transformedRow[dbField] = value;
          }
        });
        
        return transformedRow;
      });
      
      // Filter out any rows that don't have the required fields
      const validData = transformedData.filter(row => 
        row.first_name && row.last_name && row.team && row.date && row.tactic);
      
      if (validData.length === 0) {
        throw new Error('No valid data found in CSV. Please ensure CSV contains required fields.');
      }
      
      // Upload in batches
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
        setProgress(progressValue);
      }
      
      toast({
        title: 'Data uploaded successfully',
        description: `${validData.length} records imported to your database.`,
      });
      
      onSuccess();
      onClose();
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
      resetUpload();
    }
  };

  const resetUpload = () => {
    setFile(null);
    setCsvData([]);
    setHeaders([]);
    setStep('upload');
    setIsUploading(false);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      resetUpload();
      onClose();
    }
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Voter Data</DialogTitle>
          <DialogDescription>
            Upload a CSV file with your voter contact data.
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <FileUploadStep 
            file={file}
            onFileChange={handleFileChange}
            fileInputRef={fileInputRef}
          />
        )}

        {step === 'processing' && (
          <ProcessingStep progress={progress} />
        )}

        {step === 'upload' && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {!file ? (
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isUploading}
              >
                Select File
              </Button>
            ) : (
              <Button 
                onClick={handleSubmitFile} 
                disabled={isUploading}
              >
                Upload File
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
