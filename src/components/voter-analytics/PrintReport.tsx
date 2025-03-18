
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
      className="flex items-center gap-2 hidden-print"
    >
      <Printer className="h-4 w-4" />
      <span>Print Report</span>
    </Button>
  );
};
