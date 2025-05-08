
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useCSVUpload } from '@/hooks/useCSVUpload';
import { ConnectDataHeader } from '@/components/connect-data/ConnectDataHeader';
import { ConnectDataFooter } from '@/components/connect-data/ConnectDataFooter';
import { DataImportSection } from '@/components/connect-data/DataImportSection';

const ConnectData = () => {
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

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-3xl p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <ConnectDataHeader onBack={handleBack} />
        
        <DataImportSection 
          isUploading={isUploading}
          file={file}
          userEmail={userEmail}
          fileInputRef={fileInputRef}
          handleFileChange={handleFileChange}
          handleSubmitFile={handleSubmitFile}
          step={step}
          progress={progress}
          validationStats={validationStats}
        />

        <ConnectDataFooter onSkip={handleSkip} />
      </div>
    </div>
  );
};

export default ConnectData;
