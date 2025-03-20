
import React from 'react';
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { type QueryParams } from '@/types/analytics';

interface PrintReportProps {
  query: Partial<QueryParams>;
  onPrint: () => void;
}

export const PrintReport: React.FC<PrintReportProps> = ({ query, onPrint }) => {
  return (
    <Button 
      onClick={onPrint}
      variant="outline"
      size="sm"
      className="flex items-center gap-1 hidden-print mb-2 ml-auto"
      aria-label="Print Report"
    >
      <Printer className="h-3 w-3" />
      <span className="text-xs">Print Report</span>
    </Button>
  );
};
