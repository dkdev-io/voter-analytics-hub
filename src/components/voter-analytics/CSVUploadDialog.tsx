
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
      
      // Fix for type error - type assertion to make TypeScript happy
      const { error: deleteError } = await supabase
        .from('voter_contacts')
        .delete()
        .neq('id', 0 as any);
        
      if (deleteError) {
        console.error("Error using DELETE operation:", deleteError);
        
        const { error: truncateError } = await supabase.rpc('truncate_voter_contacts');
        
        if (truncateError) {
          console.error("Error truncating table:", truncateError);
          throw new Error(`Failed to clear existing records. Please try again or contact support.`);
        } else {
          console.log("Successfully truncated table using RPC call");
        }
      } else {
        console.log("Successfully deleted all records using DELETE operation");
      }
      
      const headerMapping: Record<number, string> = {};
      
      const headerVariations: Record<string, string[]> = {
        'first_name': ['first_name', 'firstname', 'first', 'fname', 'name', 'given name'],
        'last_name': ['last_name', 'lastname', 'last', 'lname', 'surname', 'family name'],
        'team': ['team', 'team_name', 'teamname', 'group', 'department', 'organization', 'org'],
        'date': ['date', 'contact_date', 'day', 'timestamp', 'contact date'],
        'tactic': ['tactic', 'type', 'contact_type', 'method', 'channel', 'medium'],
        'attempts': ['attempts', 'attempt', 'tried', 'tries', 'total_attempts', 'total attempts'],
        'contacts': ['contacts', 'contact', 'reached', 'connected', 'success', 'successful'],
        'not_home': ['not_home', 'nothome', 'nh', 'not_at_home', 'away', 'absent', 'not available'],
        'refusal': ['refusal', 'refused', 'decline', 'rejected', 'no', 'not interested', 'negative'],
        'bad_data': ['bad_data', 'baddata', 'bad', 'invalid', 'error', 'incorrect', 'wrong number'],
        'support': ['support', 'supports', 'for', 'positive', 'yes', 'favorable', 'agree'],
        'oppose': ['oppose', 'opposed', 'against', 'negative', 'disagree', 'unfavorable'],
        'undecided': ['undecided', 'unsure', 'maybe', 'neutral', 'thinking', 'considering']
      };
      
      headers.forEach((header, index) => {
        const normalizedHeader = header.trim().toLowerCase();
        
        for (const [dbField, variations] of Object.entries(headerVariations)) {
          if (variations.includes(normalizedHeader)) {
            headerMapping[index] = dbField;
            break;
          }
        }
      });
      
      console.log("Header mapping:", headerMapping);
      
      const transformedData = csvData.map(row => {
        const transformedRow: Record<string, any> = {};
        
        Object.entries(headerMapping).forEach(([index, dbField]) => {
          const idx = parseInt(index);
          let value = row[idx]?.trim() || '';
          
          if (['attempts', 'contacts', 'not_home', 'bad_data', 'refusal', 'support', 'oppose', 'undecided'].includes(dbField)) {
            transformedRow[dbField] = parseInt(value) || 0;
          } else {
            if (dbField === 'team' && value) {
              const lowercaseTeam = value.toLowerCase();
              if (lowercaseTeam.includes('tony')) {
                value = 'Team Tony';
              } else if (lowercaseTeam.includes('party') || lowercaseTeam.includes('local')) {
                value = 'Local Party';
              } else if (lowercaseTeam.includes('candidate')) {
                value = 'Candidate';
              }
              transformedRow[dbField] = value;
            }
            
            if (dbField === 'date' && value) {
              try {
                const dateObj = new Date(value);
                if (!isNaN(dateObj.getTime())) {
                  value = dateObj.toISOString().split('T')[0];
                }
              } catch (e) {
                console.warn(`Could not parse date: ${value}`, e);
              }
              transformedRow[dbField] = value;
            }
            
            transformedRow[dbField] = value;
          }
        });
        
        return transformedRow;
      });
      
      const validData = transformedData.map(row => {
        const enhancedRow = { ...row };
        
        if (!('attempts' in enhancedRow)) enhancedRow.attempts = 0;
        if (!('contacts' in enhancedRow)) enhancedRow.contacts = 0;
        if (!('not_home' in enhancedRow)) enhancedRow.not_home = 0;
        if (!('bad_data' in enhancedRow)) enhancedRow.bad_data = 0;
        if (!('refusal' in enhancedRow)) enhancedRow.refusal = 0;
        if (!('support' in enhancedRow)) enhancedRow.support = 0;
        if (!('oppose' in enhancedRow)) enhancedRow.oppose = 0;
        if (!('undecided' in enhancedRow)) enhancedRow.undecided = 0;
        
        if (!enhancedRow.team) {
          enhancedRow.team = 'Team Tony';
        }
        
        return enhancedRow;
      }).filter(row => 
        row.first_name && row.last_name && row.team && row.date && row.tactic);
      
      console.log("Valid data count:", validData.length);
      console.log("Sample valid data:", validData.slice(0, 2));
      
      if (validData.length === 0) {
        throw new Error('No valid data found in CSV. Please ensure CSV contains required fields: first_name, last_name, team, date, and tactic.');
      }
      
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
      
      console.log("Clearing data cache after successful upload");
      
      onSuccess();
      
      setTimeout(() => {
        onClose();
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
