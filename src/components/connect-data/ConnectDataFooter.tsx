
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface ConnectDataFooterProps {
  onSkip: () => void;
}

export const ConnectDataFooter = ({ onSkip }: ConnectDataFooterProps) => {
  return (
    <div className="mt-6 flex justify-end">
      <Button 
        variant="outline" 
        onClick={onSkip}
        className="flex items-center space-x-2"
      >
        <span>Skip for Now</span>
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
