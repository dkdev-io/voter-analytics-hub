
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
        body * {
          visibility: hidden;
        }
        #report-container, #report-container *, #report-title, #report-title * {
          visibility: visible;
        }
        #report-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        #report-title {
          display: block !important;
          margin: 20px 0;
          text-align: center;
          position: relative;
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
