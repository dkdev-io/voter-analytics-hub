
import { useRef } from 'react';
import { IntegrationOption } from './IntegrationOption';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Database, ChevronRight, FileUp, Upload, FileText, AlertCircle } from 'lucide-react';
import { ProcessingStep } from '@/components/voter-analytics/csv-upload/ProcessingStep';

interface DataImportSectionProps {
  isUploading: boolean;
  file: File | null;
  userEmail: string | null | undefined;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmitFile: () => void;
  step: string;
  progress?: number;
  validationStats?: any;
}

export const DataImportSection = ({
  isUploading,
  file,
  userEmail,
  fileInputRef,
  handleFileChange,
  handleSubmitFile,
  step,
  progress = 0,
  validationStats = null
}: DataImportSectionProps) => {
  const { toast } = useToast();

  const handleIntegrationClick = (name: string) => {
    toast({
      title: "Coming Soon",
      description: `${name} integration is coming soon.`,
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <IntegrationOption
        title="VAN/NGP"
        description="Connect to your VAN/NGP voter file directly."
        onClick={() => handleIntegrationClick("VAN/NGP")}
      />

      <IntegrationOption
        title="PDI"
        description="Connect to your PDI voter file directly."
        onClick={() => handleIntegrationClick("PDI")}
      />

      {step === 'upload' ? (
        <div 
          className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer md:col-span-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Database className="w-8 h-8 text-blue-600" />
              <h3 className="text-lg font-medium">CSV Upload</h3>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <FileUp className="h-10 w-10 mx-auto text-gray-400" />
            <p className="mt-4 text-sm text-gray-600">
              Click to browse or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-2">
              CSV files only, up to 10MB
            </p>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-left">
              <div className="flex">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">CSV Requirements:</p>
                  <ul className="text-xs mt-1 list-disc list-inside">
                    <li>Must include both first name and last name columns</li>
                    <li>Date and tactic columns are recommended</li>
                    <li>Contact results (attempts, contacts, support, etc.) will be processed if available</li>
                    <li>Headers should be clearly named (e.g., "first_name", "last_name", "date")</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".csv"
              onChange={handleFileChange}
            />
            
            {file && (
              <div className="mt-4 flex flex-col items-center justify-center">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
                {userEmail && (
                  <p className="text-xs text-gray-500 mt-1">
                    Data will be saved as "voter contact - {userEmail}"
                  </p>
                )}
                <Button 
                  className="mt-4" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubmitFile();
                  }}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </div>
            )}
            
            {!file && (
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
            )}
          </div>
        </div>
      ) : (
        <div className="p-6 border border-gray-200 rounded-lg md:col-span-2">
          <ProcessingStep 
            progress={progress}
            validationStats={validationStats}
            userEmail={userEmail}
          />
        </div>
      )}
    </div>
  );
};
