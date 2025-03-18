
import React from 'react';

interface PrintStylesheetProps {
  onCleanup?: () => void;
}

export const PrintStylesheet: React.FC<PrintStylesheetProps> = ({ onCleanup }) => {
  React.useEffect(() => {
    // Add a print-specific stylesheet
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        /* Hide everything by default */
        body * {
          visibility: hidden;
        }
        
        /* Only show the report container and its contents */
        #report-container, #report-container * {
          visibility: visible;
        }
        
        /* Position the report at the top of the page */
        #report-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          padding: 20px;
          margin: 0;
        }
        
        /* Ensure the report title is visible and properly positioned */
        #report-title {
          display: block !important;
          margin: 0 0 30px;
          text-align: center;
          position: relative;
          visibility: visible !important;
          page-break-after: avoid;
        }
        
        /* Make pie charts appear on the same line when printing */
        #pie-charts-row {
          display: flex !important;
          flex-direction: row !important;
          justify-content: space-between !important;
          width: 100% !important;
        }
        
        .pie-chart-container {
          width: 32% !important;
          max-width: 32% !important;
        }
        
        /* Line chart should be full width below */
        #line-chart-container {
          width: 100% !important;
          margin-top: 20px !important;
        }
        
        /* Hide specific elements that shouldn't appear in print */
        button, 
        .hidden-print,
        nav,
        header,
        footer,
        .tabs-container,
        .welcome-section,
        [role="tablist"],
        input,
        select,
        form,
        .bg-white.rounded-lg.shadow-sm.p-6 {
          display: none !important;
          visibility: hidden !important;
        }

        /* Additional rules to hide everything before the report title */
        #report-container ~ *,
        #report-container ~ * * {
          display: none !important;
          visibility: hidden !important;
        }

        /* Ensure no unwanted elements appear above the report */
        #report-title ~ *:not(#pie-charts-row):not(#line-chart-container):not(.pie-chart-container) {
          display: none !important;
          visibility: hidden !important;
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
