
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
        
        /* Ensure the report title is visible and properly positioned */
        #report-title {
          display: block !important;
          margin: 0 0 30px !important;
          text-align: center !important;
          position: relative !important;
          visibility: visible !important;
          page-break-after: avoid !important;
        }
        
        /* Make pie charts appear on the same line when printing */
        #pie-charts-row {
          display: flex !important;
          flex-direction: row !important;
          justify-content: space-between !important;
          width: 100% !important;
          break-inside: avoid !important;
          margin-bottom: 20px !important;
        }
        
        .pie-chart-container {
          width: 32% !important;
          max-width: 32% !important;
          min-width: 32% !important;
          break-inside: avoid !important;
        }
        
        /* Line chart should be full width below */
        #line-chart-container {
          width: 100% !important;
          margin-top: 20px !important;
          break-before: auto !important;
          break-after: auto !important;
        }
        
        /* Make sure charts are properly sized and spaced */
        .recharts-wrapper {
          width: 100% !important;
          height: auto !important;
        }
        
        /* Aggressively hide every possible unwanted element */
        .welcome-section, 
        button, 
        nav, 
        header, 
        footer, 
        .tabs-container, 
        [role="tablist"], 
        input, 
        select, 
        form, 
        .hidden-print,
        h2:not(#report-title h2),
        .flex:not(#report-container .flex),
        .mb-4:not(#report-container .mb-4) {
          display: none !important;
          visibility: hidden !important;
        }
        
        /* Very strong selector to hide everything except the report */
        body > *:not(:has(#report-container)),
        #root > *:not(:has(#report-container)),
        div:has(> .welcome-section),
        div:has(> .tabs-container),
        div:has(button),
        div:has(> [role="tablist"]) {
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
