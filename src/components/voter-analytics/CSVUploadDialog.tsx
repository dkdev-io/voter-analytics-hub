
import { useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUploadStep } from './csv-upload/FileUploadStep';
import { ProcessingStep } from './csv-upload/ProcessingStep';
import { useCSVUpload } from '@/hooks/useCSVUpload';

interface CSVUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CSVUploadDialog({ open, onClose, onSuccess }: CSVUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    file,
    step,
    isUploading,
    progress,
    validationStats,
    handleFileChange,
    handleSubmitFile,
    resetUpload
  } = useCSVUpload(onSuccess);

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
            fileInputRef={fileInputRef}
          />
        )}

        {step === 'processing' && (
          <ProcessingStep 
            progress={progress}
            validationStats={validationStats} 
          />
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
