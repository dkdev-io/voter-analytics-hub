
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ConnectDataHeaderProps {
  onBack: () => void;
}

export const ConnectDataHeader = ({ onBack }: ConnectDataHeaderProps) => {
  return (
    <div>
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack} 
          className="mr-2"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Connect Your Data</h1>
      </div>
      
      <p className="mt-2 text-gray-600">
        Import your voter contact data to get started with analytics.
      </p>
    </div>
  );
};
