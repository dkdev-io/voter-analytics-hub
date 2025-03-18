
import React from 'react';
import { type QueryParams } from '@/types/analytics';

interface ReportTitleProps {
  query: Partial<QueryParams>;
}

export const ReportTitle: React.FC<ReportTitleProps> = ({ query }) => {
  return (
    <div id="report-title" className="hidden print:block print:mb-8">
      <div className="text-xl font-bold whitespace-pre-line text-center">
        {formatTitle(query)}
      </div>
    </div>
  );
};

// Format the title based on query parameters
export const formatTitle = (query: Partial<QueryParams>) => {
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
