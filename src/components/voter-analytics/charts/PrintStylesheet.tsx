
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
        /* Hide all UI elements first */
        body > *:not(#root),
        #root > *:not(.dashboard-container),
        .dashboard-container > *:not(.print-container),
        .print-hidden {
          display: none !important;
        }
        
        /* Only show the report container and its children */
        .print-container,
        .print-container * {
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
        .print-hidden {
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
        
        /* Adjust pie charts layout to fit on one page */
        #pie-charts-row {
          display: flex !important;
          flex-direction: row !important;
          justify-content: space-between !important;
          width: 100% !important;
          margin-bottom: 5px !important;
          transform: scale(0.9) !important;
          transform-origin: top center !important;
        }
        
        .pie-chart-container {
          width: 32% !important;
          max-width: 32% !important;
          min-width: 32% !important;
          margin: 0 !important;
        }
        
        /* Enhance line charts to fill horizontal space */
        #line-chart-container,
        #cumulative-line-chart-container {
          width: 100% !important;
          margin-top: 5px !important;
          height: auto !important;
        }
        
        /* Make all charts fill available width */
        .recharts-wrapper {
          width: 100% !important;
          max-width: none !important;
        }
        
        /* Ensure SVGs expand properly */
        svg.recharts-surface {
          width: 100% !important;
          height: 100% !important;
          max-width: none !important;
          max-height: none !important;
        }
        
        /* Make sure axes expand properly */
        .recharts-cartesian-axis {
          transform: none !important;
        }
        
        /* Ensure chart height is sufficient */
        .h-72, .h-80 {
          height: 250px !important;
          max-height: 250px !important;
          min-height: 250px !important;
        }
        
        /* Make Y-axis expand to full height */
        .recharts-yAxis {
          height: 100% !important;
        }
        
        /* Enhance visibility of chart elements */
        .recharts-cartesian-axis-line,
        .recharts-cartesian-axis-tick-line,
        .recharts-cartesian-axis-domain {
          stroke-width: 1.5px !important;
          stroke: #333 !important;
        }
        
        .recharts-cartesian-grid-horizontal line,
        .recharts-cartesian-grid-vertical line {
          stroke-width: 1px !important;
          stroke: #e0e0e0 !important;
        }
        
        /* Ensure curves and lines are prominent */
        .recharts-curve,
        .recharts-line {
          stroke-width: 2.5px !important;
        }
        
        /* Make dots more visible */
        .recharts-dot {
          r: 5 !important;
        }
        
        /* Reduce spacing */
        .mt-6 {
          margin-top: 10px !important;
        }
        
        /* Set page size and orientation */
        @page {
          size: letter portrait;
          margin: 0.5cm;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
      if (onCleanup) onCleanup();
    };
  }, [onCleanup]);
  
  return null;
};
