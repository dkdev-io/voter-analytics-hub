
import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FileUploadStep } from './csv-upload/FileUploadStep';
import { ProcessingStep } from './csv-upload/ProcessingStep';
import { useCSVUpload } from '@/hooks/useCSVUpload';
import { CSVFieldMapping } from './CSVFieldMapping';
import { EnhancedCSVUpload } from './csv-upload/EnhancedCSVUpload';

interface CSVUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CSVUploadDialog({ open, onOpenChange, onSuccess }: CSVUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [useEnhancedUpload, setUseEnhancedUpload] = useState(true);
  
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

  const handleEnhancedUploadComplete = (result: { success: boolean; rowsUploaded: number; warnings: any[] }) => {
    if (result.success) {
      onSuccess();
      onOpenChange(false);
    }
  };

  // Debugging output to confirm state/props
  console.log("[CSVUploadDialog] Current Step:", step);
  console.log("[CSVUploadDialog] csvHeaders:", csvHeaders);
  console.log("[CSVUploadDialog] csvSampleData:", csvSampleData);
  console.log("[CSVUploadDialog] useEnhancedUpload:", useEnhancedUpload);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={useEnhancedUpload ? "max-w-7xl max-h-[95vh]" : "sm:max-w-[700px] max-h-[90vh]"}>
        {useEnhancedUpload ? (
          // Enhanced upload component
          <div className="p-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Enhanced CSV Import</h2>
                <p className="text-sm text-gray-600">
                  Advanced CSV import with flexible field mapping and validation
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="upload-mode">Use Legacy Import</Label>
                <Switch
                  id="upload-mode"
                  checked={!useEnhancedUpload}
                  onCheckedChange={(checked) => setUseEnhancedUpload(!checked)}
                />
              </div>
            </div>
            <EnhancedCSVUpload 
              onUploadComplete={handleEnhancedUploadComplete}
              onCancel={handleClose}
            />
          </div>
        ) : (
          // Legacy upload component
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle>Import Voter Data</DialogTitle>
                  <DialogDescription>
                    Upload a CSV file with your voter contact data.
                    {userEmail && <div className="mt-1 text-xs">Data will be saved as {"voter contact - "}{userEmail}</div>}
                  </DialogDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="upload-mode-legacy">Use Enhanced Import</Label>
                  <Switch
                    id="upload-mode-legacy"
                    checked={useEnhancedUpload}
                    onCheckedChange={setUseEnhancedUpload}
                  />
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-hidden">
              {step === 'upload' && (
                <FileUploadStep 
                  file={file}
                  onFileChange={handleFileChange}
                  fileInputRef={fileInputRef}
                />
              )}

              {step === 'mapping' && csvHeaders && csvHeaders.length > 0 && (
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
