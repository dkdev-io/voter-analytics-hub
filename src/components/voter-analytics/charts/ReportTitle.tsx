
import React from 'react';
import { type QueryParams } from '@/types/analytics';

interface ReportTitleProps {
  query: Partial<QueryParams>;
  singleChartTitle?: string;
}

export const ReportTitle: React.FC<ReportTitleProps> = ({ query, singleChartTitle }) => {
  return (
    <div id="report-title" className="hidden print:block print:mb-8">
      <h1 className="text-2xl font-bold text-center mb-1">VoterContact.io Report</h1>
      <div className="text-xl font-bold whitespace-pre-line text-center">
        {singleChartTitle ? `${singleChartTitle}\n${formatSubtitle(query)}` : formatTitle(query)}
      </div>
    </div>
  );
};

// Format the subtitle for single chart printouts
const formatSubtitle = (query: Partial<QueryParams>) => {
  const { tactic, resultType, person, team } = query;
  
  let subtitle = '';
  
  if (team && team !== 'All') {
    subtitle += `${team} `;
  }
  
  if (person && person !== 'All') {
    subtitle += `${person}`;
  } else if (team && team !== 'All') {
    subtitle += "All Members";
  } else {
    subtitle += "All Teams";
  }
  
  // Add tactic and result type if present
  if ((tactic && tactic !== 'All') || (resultType && resultType !== 'All')) {
    subtitle += " - ";
    
    if (tactic && tactic !== 'All') {
      subtitle += tactic;
    }
    
    if (resultType && resultType !== 'All') {
      if (tactic && tactic !== 'All') {
        subtitle += " ";
      }
      subtitle += resultType;
    }
  }
  
  return subtitle;
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
  
  // Second line: "Completed by Team Member" - capitalize "Completed"
  title += "\nCompleted by ";
  
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
