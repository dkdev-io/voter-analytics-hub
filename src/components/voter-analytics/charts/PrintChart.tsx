
import React, { useEffect } from 'react';
import { ReportTitle } from './ReportTitle';
import { ReportFooter } from './ReportFooter';
import { type QueryParams } from '@/types/analytics';

interface PrintChartProps {
  query: Partial<QueryParams>;
  userEmail?: string;
  datasetName?: string;
  chartId: string;
  chartTitle: string;
  onCleanup?: () => void;
}

export const PrintChart: React.FC<PrintChartProps> = ({ 
  query, 
  userEmail, 
  datasetName, 
  chartId,
  chartTitle,
  onCleanup 
}) => {
  useEffect(() => {
    // Add a print-specific stylesheet for single chart
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        /* Hide all UI elements first */
        body > *:not(#root),
        #root > *:not(.dashboard-container),
        .dashboard-container > *:not(.print-container),
        .print-hidden {
          display: none !important;
        }
        
        /* Only show the specific chart container and report elements */
        .print-container,
        .print-container #report-title,
        .print-container #${chartId},
        .print-container #report-footer {
          display: block !important;
          visibility: visible !important;
        }
        
        /* Hide any additional elements we don't want in the printout */
        header, 
        nav, 
        .print-container button,
        .sidebar,
        footer,
        .query-section,
        .search-section,
        .print-hidden,
        #pie-charts-row,
        .print-container > div:not(#report-title):not(#${chartId}):not(#report-footer) {
          display: none !important;
        }
        
        /* Ensure the report container takes up the full page */
        .print-container {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          height: auto !important;
          padding: 20px !important;
          margin: 0 !important;
          background-color: white !important;
        }
        
        /* Make line chart landscape and larger */
        #${chartId} {
          width: 100% !important;
          height: 400px !important;
          max-height: 400px !important;
          margin-top: 20px !important;
          margin-bottom: 20px !important;
          transform-origin: top center !important;
          display: block !important;
          visibility: visible !important;
          overflow: visible !important;
        }
        
        /* Ensure the footer has space */
        #report-footer {
          margin-top: 20px !important;
        }
        
        /* Set page size and orientation */
        @page {
          size: landscape;
          margin: 0.5cm;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Custom title for the chart
    const originalTitle = document.title;
    document.title = `${chartTitle} - VoterContact.io Report`;
    
    // Make sure the target chart is fully rendered and visible before printing
    // This adds a tiny delay to ensure the chart is ready
    setTimeout(() => {
      window.print();
    }, 300);
    
    return () => {
      document.head.removeChild(style);
      document.title = originalTitle;
      if (onCleanup) onCleanup();
    };
  }, [chartId, chartTitle, onCleanup]);
  
  return (
    <>
      <ReportTitle query={query} singleChartTitle={chartTitle} />
      <ReportFooter userEmail={userEmail} datasetName={datasetName} />
    </>
  );
};
