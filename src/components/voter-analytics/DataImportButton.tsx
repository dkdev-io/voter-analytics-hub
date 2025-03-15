
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';

interface DataImportButtonProps {
  onImport: () => Promise<boolean>;
  isLoading: boolean;
}

export const DataImportButton = ({ onImport, isLoading }: DataImportButtonProps) => {
  const [importing, setImporting] = useState(false);
  
  const handleImport = async () => {
    setImporting(true);
    try {
      await onImport();
    } finally {
      setImporting(false);
    }
  };
  
  return (
    <Button 
      onClick={handleImport} 
      disabled={isLoading || importing} 
      variant="outline"
      className="text-xs"
    >
      <FileDown className="mr-1 h-3 w-3" />
      Import New Dataset
    </Button>
  );
};
