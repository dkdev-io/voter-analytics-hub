
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CSVFieldMapping } from './CSVFieldMapping';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, Upload, FileUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from "@/components/ui/progress";

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
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        const parseCSVLine = (line: string) => {
          const result = [];
          let inQuote = false;
          let currentValue = '';
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
              inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
              result.push(currentValue);
              currentValue = '';
            } else {
              currentValue += char;
            }
          }
          
          result.push(currentValue);
          return result;
        };
        
        const parsedLines = lines.map(parseCSVLine);
        
        if (parsedLines.length < 2) {
          throw new Error('CSV must contain headers and at least one row of data');
        }
        
        setHeaders(parsedLines[0]);
        setCsvData(parsedLines.slice(1));
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
    
    reader.onerror = () => {
      toast({
        title: 'Error reading file',
        description: 'The file could not be read.',
        variant: 'destructive',
      });
    };
    
    reader.readAsText(file);
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
        
        // Calculate and set the progress as a number
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
          <div className="py-6">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-4 text-sm text-gray-600">
                Click to browse or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-2">
                CSV files only, up to 10MB
              </p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv"
                onChange={handleFileChange}
              />
              
              {file && (
                <div className="mt-4 flex items-center justify-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
              )}
              
              <Button 
                className="mt-4" 
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Select CSV File
              </Button>
            </div>
          </div>
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
          <div className="py-10 text-center">
            <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
            <h3 className="mt-4 text-lg font-medium">Processing your data</h3>
            <p className="text-sm text-gray-500 mt-1">
              Please don't close this window.
            </p>
            
            <div className="mt-6 w-full">
              <Progress value={progress} className="h-2" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {progress}% complete
            </p>
          </div>
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
