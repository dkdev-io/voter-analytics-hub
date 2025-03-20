
import React from 'react';

interface PrintStylesheetProps {
  onCleanup?: () => void;
  userEmail?: string;
  datasetName?: string;
}

export const PrintStylesheet: React.FC<PrintStylesheetProps> = ({ onCleanup, userEmail, datasetName }) => {
  React.useEffect(() => {
    // Add a print-specific stylesheet
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        /* Hide absolutely everything by default */
        body * {
          visibility: hidden !important;
          display: none !important;
        }
        
        /* Only show the report container and its contents */
        #report-container, #report-container * {
          visibility: visible !important;
          display: block !important;
        }
        
        /* Position the report at the top of the page */
        #report-container {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          padding: 20px !important;
          margin: 0 !important;
          box-sizing: border-box !important;
          background-color: white !important;
        }
        
        /* Ensure the report title is visible */
        #report-title {
          display: block !important;
          margin: 0 0 15px !important;
          text-align: center !important;
          position: relative !important;
          visibility: visible !important;
          page-break-after: avoid !important;
        }
        
        /* Adjust pie charts layout to fit on one page */
        #pie-charts-row {
          display: flex !important;
          flex-direction: row !important;
          justify-content: space-between !important;
          width: 100% !important;
          break-inside: avoid !important;
          margin-bottom: 15px !important;
          scale: 0.9 !important;
        }
        
        .pie-chart-container {
          width: 32% !important;
          max-width: 32% !important;
          min-width: 32% !important;
          break-inside: avoid !important;
          transform: scale(0.9) !important;
          margin: 0 !important;
        }
        
        /* Reduce chart height to fit on one page */
        .h-72 {
          height: 220px !important;
          max-height: 220px !important;
        }
        
        /* Make line charts smaller to fit on one page */
        #line-chart-container,
        #cumulative-line-chart-container {
          width: 100% !important;
          margin-top: 10px !important;
          scale: 0.9 !important;
          transform-origin: top center !important;
        }
        
        .recharts-wrapper {
          max-height: 180px !important;
        }
        
        /* Reduce font sizes */
        .text-xs {
          font-size: 7px !important;
        }
        
        .text-sm {
          font-size: 9px !important;
        }
        
        /* Condense spacing */
        .pb-4 {
          padding-bottom: 10px !important;
        }
        
        /* Report footer styling */
        #report-footer {
          display: block !important;
          visibility: visible !important;
          margin-top: 10px !important;
          padding-top: 5px !important;
          text-align: center !important;
          font-size: 7px !important;
          color: #666 !important;
        }
        
        /* Fix legends to be more compact */
        .recharts-legend-wrapper ul {
          padding: 0 !important;
          margin: 0 !important;
        }
        
        .recharts-legend-wrapper li {
          margin-bottom: 1px !important;
        }
        
        /* Hide absolutely everything except for the report */
        body > *:not(#report-container),
        #root > *:not(#report-container),
        .ResizablePanelGroup,
        [data-panel="left"],
        [role="tablist"],
        button, 
        nav, 
        header, 
        footer,
        input, 
        select, 
        form, 
        .hidden-print,
        .print\\:hidden {
          display: none !important;
          visibility: hidden !important;
        }
        
        /* Ensure page doesn't break in middle of charts */
        @page {
          size: letter portrait;
          margin: 0.5cm;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Clean up
    return () => {
      document.head.removeChild(style);
      if (onCleanup) onCleanup();
    };
  }, [onCleanup]);
  
  return null;
};
