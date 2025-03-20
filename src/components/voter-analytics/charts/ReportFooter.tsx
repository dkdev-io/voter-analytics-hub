
import React from 'react';
import { format } from 'date-fns';

interface ReportFooterProps {
  userEmail?: string;
  datasetName?: string;
}

export const ReportFooter: React.FC<ReportFooterProps> = ({ 
  userEmail = "user@example.com",
  datasetName
}) => {
  const currentDate = format(new Date(), "MMM d, yyyy 'at' h:mm a");
  const displayName = datasetName || "Voter Contacts Dataset";
  
  return (
    <div id="report-footer" className="hidden print:block print:mt-6 text-sm text-gray-500 border-t border-gray-200 pt-4 text-center">
      Prepared for {userEmail} on {currentDate}. From <span className="font-semibold">{displayName}</span>.
    </div>
  );
};
