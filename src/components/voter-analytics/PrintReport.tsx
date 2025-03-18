
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Printer, FileText } from "lucide-react";
import { type QueryParams } from '@/types/analytics';

interface PrintReportProps {
  query: Partial<QueryParams>;
  onPrint: () => void;
}

export const PrintReport: React.FC<PrintReportProps> = ({ query, onPrint }) => {
  // Format the title based on query parameters
  const formatTitle = () => {
    const { tactic, resultType, person, team, date, endDate } = query;
    
    let title = '';
    
    // First line: "Tactic ResultType"
    if (tactic && tactic !== 'All') {
      title += tactic;
    } else {
      title += "All Tactics";
    }
    
    if (resultType && resultType !== 'All') {
      title += ` ${resultType}`;
    } else {
      title += " Results";
    }
    
    // Second line: "Person by Team"
    title += "\n";
    if (person && person !== 'All') {
      title += `${person}`;
    } else {
      title += "All Canvassers";
    }
    
    title += " by ";
    
    if (team && team !== 'All') {
      title += `${team}`;
    } else {
      title += "All Teams";
    }
    
    // Third line: "Date to EndDate"
    title += "\n";
    if (date && date !== 'All') {
      title += `${date}`;
    } else {
      title += "All Dates";
    }
    
    if (endDate && endDate !== 'All') {
      title += ` to ${endDate}`;
    }
    
    return title;
  };
  
  return (
    <div className="mb-4">
      <Button 
        onClick={onPrint}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Printer className="h-4 w-4" />
        <span>Print Report</span>
      </Button>
      
      {/* This div will be hidden on screen but used for printing */}
      <div id="report-title" className="hidden">
        <pre className="text-xl font-bold whitespace-pre-line">
          {formatTitle()}
        </pre>
      </div>
    </div>
  );
};
