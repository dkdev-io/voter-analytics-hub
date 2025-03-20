
import React from 'react';
import { type QueryParams } from '@/types/analytics';

interface ReportTitleProps {
  query: Partial<QueryParams>;
}

export const ReportTitle: React.FC<ReportTitleProps> = ({ query }) => {
  return (
    <div id="report-title" className="hidden print:block print:mb-8">
      <h1 className="text-2xl font-bold text-center mb-1">VoterContact.io Report</h1>
      <div className="text-xl font-bold whitespace-pre-line text-center">
        {formatTitle(query)}
      </div>
    </div>
  );
};

// Format the title based on query parameters
export const formatTitle = (query: Partial<QueryParams>) => {
  const { tactic, resultType, person, team } = query;
  
  let title = '';
  
  // First line: "Tactic Metric"
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
  
  // Second line: "completed by Team Member"
  title += "\ncompleted by ";
  
  if (team && team !== 'All') {
    title += `${team} `;
  }
  
  if (person && person !== 'All') {
    title += `${person}`;
  } else if (team && team !== 'All') {
    // If team is specified but no specific person, add a placeholder
    title += "All Members";
  } else {
    title += "All Teams";
  }
  
  return title;
};
