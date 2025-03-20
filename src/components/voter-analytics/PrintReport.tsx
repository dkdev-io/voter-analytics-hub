
import React from 'react';
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { type QueryParams } from '@/types/analytics';

interface PrintReportProps {
  query: Partial<QueryParams>;
  onPrint: () => void;
  onToggleSearchPanel?: () => void;
}

export const PrintReport: React.FC<PrintReportProps> = ({ query, onPrint, onToggleSearchPanel }) => {
  const handlePrintWithToggle = () => {
    // If we have the toggle function, hide search panel before printing
    if (onToggleSearchPanel) {
      // Hide the search panel
      onToggleSearchPanel();
      
      // Call the print function with a slight delay to ensure UI updates
      setTimeout(() => {
        onPrint();
        
        // Restore the search panel after printing is done
        setTimeout(() => {
          onToggleSearchPanel();
        }, 1000);
      }, 100);
    } else {
      // Fall back to regular print if no toggle function provided
      onPrint();
    }
  };

  return (
    <div className="flex flex-col items-center mt-6">
      <Button 
        onClick={handlePrintWithToggle}
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        aria-label="Print All Charts"
      >
        <Printer className="h-3 w-3" />
        <span className="text-xs">Print All Charts</span>
      </Button>
    </div>
  );
};
