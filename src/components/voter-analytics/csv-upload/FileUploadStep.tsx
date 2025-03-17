
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { FileUp, FileText, Upload } from 'lucide-react';

interface FileUploadStepProps {
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileUploadStep({ file, onFileChange }: FileUploadStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
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
          onChange={onFileChange}
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
  );
}
