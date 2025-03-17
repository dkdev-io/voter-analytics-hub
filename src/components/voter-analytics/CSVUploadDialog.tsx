import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CSVFieldMapping } from './CSVFieldMapping';
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
  const [step, setStep] = useState<'upload' | 'mapping' | 'processing'>('upload');
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
      processCSVFile(selectedFile);
    }
  };

  const processCSVFile = async (file: File) => {
    try {
      const { headers, data } = await parseCSV(file);
      setHeaders(headers);
      setCsvData(data);
      setStep('mapping');
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast({
        title: 'Error parsing CSV',
        description: 'The file could not be parsed correctly.',
        variant: 'destructive',
      });
    }
  };

  const handleMappingComplete = async (mapping: Record<string, string>) => {
    if (!file || !csvData.length) return;
    
    setStep('processing');
    setIsUploading(true);
    
    try {
      const transformedData = csvData.map(row => {
        const transformedRow: Record<string, any> = {};
        
        Object.entries(mapping).forEach(([dbField, csvHeader]) => {
          if (csvHeader) {
            const headerIndex = headers.findIndex(h => h === csvHeader);
            if (headerIndex !== -1) {
              let value = row[headerIndex];
              
              if (['attempts', 'contacts', 'not_home', 'bad_data', 'refusal', 'support', 'oppose', 'undecided'].includes(dbField)) {
                value = parseInt(value) || 0;
              }
              
              transformedRow[dbField] = value;
            }
          }
        });
        
        return transformedRow;
      });
      
      const batchSize = 100;
      const batches = [];
      
      for (let i = 0; i < transformedData.length; i += batchSize) {
        batches.push(transformedData.slice(i, i + batchSize));
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
        description: `${transformedData.length} records imported to your database.`,
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error uploading data:', error);
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your data.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setStep('upload');
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
          />
        )}

        {step === 'mapping' && headers.length > 0 && (
          <CSVFieldMapping 
            headers={headers}
            sampleData={csvData.slice(0, 5)}
            onMappingComplete={handleMappingComplete}
            onCancel={() => setStep('upload')}
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
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isUploading}
            >
              Select File
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
