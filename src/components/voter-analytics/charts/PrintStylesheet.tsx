
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
          display: none;
        }
        
        /* Only show the report container and its contents */
        #report-container, #report-container * {
          visibility: visible;
          display: block;
        }
        
        /* Position the report at the top of the page */
        #report-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          padding: 20px;
          margin: 0;
          box-sizing: border-box;
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
          break-inside: avoid;
        }
        
        .pie-chart-container {
          width: 32% !important;
          max-width: 32% !important;
          min-width: 32% !important;
          break-inside: avoid;
        }
        
        /* Line chart should be full width below */
        #line-chart-container {
          width: 100% !important;
          margin-top: 20px !important;
          break-before: auto;
          break-after: auto;
        }
        
        /* Hide specific elements that shouldn't appear in print */
        .tabs-container,
        .welcome-section,
        .hidden-print,
        button, 
        nav,
        header,
        footer,
        [role="tablist"],
        input,
        select,
        form {
          display: none !important;
          visibility: hidden !important;
        }
        
        /* Important: Force hide everything outside the report container */
        #report-container ~ * {
          display: none !important;
          visibility: hidden !important;
        }
        
        /* Make sure charts are properly sized and spaced */
        .recharts-wrapper {
          width: 100% !important;
          height: auto !important;
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
