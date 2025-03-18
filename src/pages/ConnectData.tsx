
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Database, ChevronRight, ArrowRight, ArrowLeft, FileUp, FileText, Upload, Loader2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { useCSVUpload } from '@/hooks/useCSVUpload';
import { ProcessingStep } from '@/components/voter-analytics/csv-upload/ProcessingStep';

const ConnectData = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // CSV upload state management through custom hook
  const {
    file,
    step,
    isUploading,
    progress,
    validationStats,
    handleFileChange,
    handleSubmitFile,
    resetUpload,
    userEmail
  } = useCSVUpload(() => {
    toast({
      title: 'Data uploaded successfully',
      description: 'Your voter data has been uploaded and is ready to use.',
    });
    setTimeout(() => navigate('/dashboard'), 1500);
  });

  const handleSkip = () => {
    toast({
      title: 'Skipped data connection',
      description: 'You can connect your data sources later in settings.',
    });
    navigate('/dashboard');
  };

  const handleConnect = (source: string) => {
    if (source === 'CSV Upload') {
      // No need to set loading or use setTimeout since we already have the upload logic
      return;
    }
    
    setLoading(true);
    // Simulate connection process for other sources
    setTimeout(() => {
      setLoading(false);
      toast({
        title: 'Connection initiated',
        description: `Connecting to ${source}. This feature is coming soon.`,
      });
    }, 1500);
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-3xl p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack} 
            className="mr-2"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Connect Your Data</h1>
        </div>
        
        <p className="mt-2 text-gray-600">
          Connect to your voter file or import your data to get started.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div 
            className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            onClick={() => handleConnect('VAN/NGP')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Database className="w-8 h-8 text-blue-600" />
                <h3 className="text-lg font-medium">VAN/NGP</h3>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Connect to your VAN/NGP voter file directly.
            </p>
          </div>

          <div 
            className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            onClick={() => handleConnect('PDI')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Database className="w-8 h-8 text-blue-600" />
                <h3 className="text-lg font-medium">PDI</h3>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Connect to your PDI voter file directly.
            </p>
          </div>

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

        {step === 'upload' && (
          <div className="flex flex-col items-center justify-center">
            <Button 
              variant="outline" 
              className="flex items-center space-x-2 py-3 px-6 text-gray-700 hover:text-blue-600"
              onClick={handleSkip}
            >
              <span>Skip for Now</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectData;
