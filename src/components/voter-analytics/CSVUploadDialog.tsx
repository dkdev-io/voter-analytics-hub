
import { useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUploadStep } from './csv-upload/FileUploadStep';
import { ProcessingStep } from './csv-upload/ProcessingStep';
import { useCSVUpload } from '@/hooks/useCSVUpload';
import { CSVFieldMapping } from './CSVFieldMapping';

interface CSVUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CSVUploadDialog({ open, onOpenChange, onSuccess }: CSVUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    file,
    step,
    isUploading,
    progress,
    validationStats,
    handleFileChange,
    handleSubmitFile,
    resetUpload,
    userEmail,
    csvHeaders,
    csvSampleData,
    mapping,
    handleMappingComplete,
  } = useCSVUpload(onSuccess);

  const handleClose = () => {
    if (!isUploading) {
      resetUpload();
      onOpenChange(false);
    }
  };

  // Debugging output to confirm state/props
  console.log("[CSVUploadDialog] Current Step:", step);
  console.log("[CSVUploadDialog] csvHeaders:", csvHeaders);
  console.log("[CSVUploadDialog] csvSampleData:", csvSampleData);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Voter Data</DialogTitle>
          <DialogDescription>
            Upload a CSV file with your voter contact data.
            {userEmail && <div className="mt-1 text-xs">Data will be saved as {"voter contact - "}{userEmail}</div>}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {step === 'upload' && (
            <FileUploadStep 
              file={file}
              onFileChange={handleFileChange}
              fileInputRef={fileInputRef}
            />
          )}

          {step === 'mapping' && csvHeaders.length > 0 && (
            <CSVFieldMapping 
              headers={csvHeaders}
              sampleData={csvSampleData}
              onMappingComplete={handleMappingComplete}
              onCancel={resetUpload}
            />
          )}

          {step === 'processing' && (
            <ProcessingStep 
              progress={progress}
              validationStats={validationStats}
              userEmail={userEmail}
            />
          )}
        </div>

        {step === 'upload' && (
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={handleClose}>
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
                onClick={() => handleSubmitFile()}
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
