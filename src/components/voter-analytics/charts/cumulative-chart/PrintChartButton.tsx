
import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface PrintChartButtonProps {
  onClick: () => void;
}

export const PrintChartButton: React.FC<PrintChartButtonProps> = ({ onClick }) => {
  return (
    <div className="absolute bottom-2 right-2 print:hidden">
      <Button
        onClick={onClick}
        variant="outline"
        size="sm"
        className="flex items-center gap-1 text-xs py-1 px-2 h-7"
        aria-label="Print This Chart"
      >
        <Printer className="h-3 w-3" />
        <span>Print This Chart</span>
      </Button>
    </div>
  );
};
