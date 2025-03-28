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
        /* Reset and base styles */
        * {
          box-sizing: border-box !important;
        }
        
        html, body {
          width: 100% !important;
          height: auto !important;
          margin: 0 !important;
          padding: 0 !important;
          background-color: white !important;
          overflow: visible !important;
        }
        
        /* Hide all UI elements */
        body > *:not(#root),
        #root > *:not(.dashboard-container),
        .dashboard-container > *:not(.print-container),
        .print-hidden,
        button,
        header, 
        nav, 
        .sidebar,
        footer,
        .query-section,
        .search-section {
          display: none !important;
        }
        
        /* Show only the print container */
        .print-container {
          display: block !important;
          visibility: visible !important;
          position: relative !important;
          width: 100% !important;
          height: auto !important;
          padding: 0.5in !important;
          margin: 0 auto !important;
          background-color: white !important;
          overflow: visible !important;
        }
        
        .print-container * {
          visibility: visible !important;
          overflow: visible !important;
        }
        
        /* Fix page breaks for charts */
        #pie-charts-row,
        #activity-line-chart,
        #cumulative-line-chart {
          page-break-before: always !important;
          page-break-after: always !important;
          page-break-inside: avoid !important;
          break-before: page !important;
          break-after: page !important;
          break-inside: avoid !important;
          margin: 0 auto 0.5in auto !important;
          position: relative !important;
          height: auto !important;
          min-height: 7.5in !important;
          overflow: visible !important;
          display: block !important;
        }
        
        /* First chart doesn't need page break before */
        #pie-charts-row {
          page-break-before: auto !important;
          break-before: auto !important;
        }
        
        /* Pie charts layout */
        #pie-charts-row {
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: wrap !important;
          justify-content: space-around !important;
          width: 100% !important;
          height: auto !important;
          margin: 0 auto 0.5in auto !important;
        }
        
        .pie-chart-container {
          width: 32% !important;
          max-width: 32% !important;
          min-width: 32% !important;
          margin: 0 !important;
          display: inline-block !important;
        }
        
        /* Chart sizing */
        #activity-line-chart,
        #cumulative-line-chart {
          width: 100% !important;
          height: auto !important;
          min-height: 6in !important;
          position: relative !important;
          margin: 0 auto 1in auto !important;
          overflow: visible !important;
        }
        
        /* Fix chart containers */
        .activity-chart-container,
        .cumulative-chart-container {
          height: 6in !important;
          min-height: 6in !important;
          overflow: visible !important;
        }
        
        /* Make all charts fill available width */
        .recharts-wrapper {
          width: 100% !important;
          height: 5.5in !important;
          min-height: 5.5in !important;
          margin: 0 auto !important;
          overflow: visible !important;
        }
        
        /* Ensure SVGs expand properly */
        svg.recharts-surface {
          width: 100% !important;
          height: 100% !important;
          min-height: 5in !important;
          overflow: visible !important;
        }
        
        /* Fix axis scaling */
        .recharts-cartesian-axis {
          transform: none !important;
        }
        
        .recharts-yAxis {
          height: 100% !important;
        }
        
        /* Chart elements styling */
        .recharts-cartesian-axis-line,
        .recharts-cartesian-axis-tick-line {
          stroke-width: 1px !important;
          stroke: #333 !important;
        }
        
        .recharts-cartesian-grid-horizontal line,
        .recharts-cartesian-grid-vertical line {
          stroke-width: 0.5px !important;
          stroke: #e0e0e0 !important;
        }
        
        .recharts-curve,
        .recharts-line {
          stroke-width: 2px !important;
        }
        
        /* Chart titles */
        .chart-title {
          text-align: center !important;
          font-size: 16pt !important;
          font-weight: bold !important;
          margin-bottom: 0.25in !important;
          break-after: avoid !important;
        }
        
        /* Set page size and orientation */
        @page {
          size: letter portrait;
          margin: 0.5in;
        }
      }
    `;
		document.head.appendChild(style);

		return () => {
			document.head.removeChild(style);
			if (onCleanup) onCleanup();
		};
	}, [onCleanup]);

	return (
		<div className="hidden">
			{userEmail && <div id="user-email">{userEmail}</div>}
			{datasetName && <div id="dataset-name">{datasetName}</div>}
		</div>
	);
};
