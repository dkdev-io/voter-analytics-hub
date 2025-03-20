
import React from 'react';
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { type QueryParams } from '@/types/analytics';
import { ReportPrintIssueButton } from '../issue-log/ReportPrintIssueButton';

interface PrintReportProps {
  query: Partial<QueryParams>;
  onPrint: () => void;
}

export const PrintReport: React.FC<PrintReportProps> = ({ query, onPrint }) => {
  return (
    <div className="flex flex-col items-center gap-2 mt-6">
      <Button 
        onClick={onPrint}
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        aria-label="Print Charts Only"
      >
        <Printer className="h-3 w-3" />
        <span className="text-xs">Print Charts Only</span>
      </Button>
      
      <div className="text-xs text-gray-500 mt-1">
        <span>Having issues with printing?</span>
        <ReportPrintIssueButton 
          variant="link" 
          size="sm" 
          className="text-xs p-0 h-auto font-normal"
        />
      </div>
    </div>
  );
};
