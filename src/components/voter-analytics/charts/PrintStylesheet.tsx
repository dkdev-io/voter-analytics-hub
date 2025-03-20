
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
        
        /* Force hide the left column and ResizablePanel */
        .ResizablePanelGroup,
        [data-panel="left"],
        [data-orientation="horizontal"] > div:first-child,
        div[style*="resize"],
        .ResizablePanel:first-child {
          display: none !important;
          visibility: hidden !important;
          width: 0 !important;
          height: 0 !important;
          overflow: hidden !important;
          position: absolute !important;
          pointer-events: none !important;
          opacity: 0 !important;
        }
        
        /* Force hide the ResizableHandle */
        [data-orientation="horizontal"] > div[role="separator"],
        [data-panel-handle],
        .ResizableHandle,
        div[style*="cursor: col-resize"] {
          display: none !important;
          visibility: hidden !important;
          width: 0 !important;
          opacity: 0 !important;
        }
        
        /* Hide the print button and "Analytics Overall" text */
        .hidden-print,
        h2:contains("Analytics"),
        button,
        [role="button"] {
          display: none !important;
          visibility: hidden !important;
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
        
        /* Footer styling */
        #report-footer {
          display: block !important;
          visibility: visible !important;
          margin-top: 30px !important;
          border-top: 1px solid #eee !important;
          padding-top: 10px !important;
          text-align: center !important;
          font-size: 11px !important;
          color: #666 !important;
        }
        
        /* Aggressively force hide everything except the report */
        body > *:not(:has(#report-container)),
        #root > *:not(:has(#report-container)),
        [data-orientation="horizontal"] > div:first-child,
        div:has(> [role="tablist"]),
        div[style*="resize"],
        button, 
        nav, 
        header, 
        footer, 
        .tabs-container, 
        [role="tablist"], 
        input, 
        select, 
        form, 
        .hidden-print {
          display: none !important;
          visibility: hidden !important;
          width: 0 !important;
          height: 0 !important;
          position: absolute !important;
          overflow: hidden !important;
          z-index: -9999 !important;
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
