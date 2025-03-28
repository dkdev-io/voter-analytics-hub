import React, { useEffect } from 'react';
import { ReportTitle } from './ReportTitle';
import { ReportFooter } from './ReportFooter';
import { type QueryParams } from '@/types/analytics';
import { format } from 'date-fns';

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
		// Create a clone of the chart to print
		const originalChart = document.getElementById(chartId);
		if (!originalChart) {
			console.error(`Chart with ID ${chartId} not found`);
			if (onCleanup) onCleanup();
			return;
		}

		// Create a new container for the print view that fills the entire page
		const printContainer = document.createElement('div');
		printContainer.id = 'print-single-chart-container';
		printContainer.style.position = 'fixed';
		printContainer.style.left = '0';
		printContainer.style.top = '0';
		printContainer.style.width = '100vw';
		printContainer.style.height = '100vh';
		printContainer.style.zIndex = '9999';
		printContainer.style.backgroundColor = 'white';
		printContainer.style.display = 'flex';
		printContainer.style.flexDirection = 'column';
		document.body.appendChild(printContainer);

		// Create header with ReportTitle component to match Print All Charts format
		const headerContainer = document.createElement('div');
		headerContainer.style.padding = '15px 20px';
		headerContainer.style.borderBottom = '1px solid #eee';

		// Create a container for the ReportTitle React component
		const titleContainer = document.createElement('div');
		titleContainer.id = 'print-chart-title-container';
		headerContainer.appendChild(titleContainer);

		// Add chart-specific subtitle
		const subtitleElement = document.createElement('p');
		subtitleElement.style.fontSize = '14px';
		subtitleElement.style.fontWeight = '500';
		subtitleElement.style.textAlign = 'center';
		subtitleElement.style.marginTop = '4px';
		subtitleElement.textContent = chartTitle;
		headerContainer.appendChild(subtitleElement);

		printContainer.appendChild(headerContainer);

		// Create container for the chart that takes up most of the page
		const chartContainer = document.createElement('div');
		chartContainer.style.flexGrow = '1';
		chartContainer.style.display = 'flex';
		chartContainer.style.alignItems = 'center';
		chartContainer.style.justifyContent = 'center';
		chartContainer.style.padding = '20px'; // Add padding for better spacing
		chartContainer.style.width = '100%';
		chartContainer.style.height = '75%'; // Reduced height to prevent overflow
		chartContainer.style.position = 'relative';
		chartContainer.style.overflow = 'visible'; // Important - allow content to be visible
		printContainer.appendChild(chartContainer);

		// Clone the chart and add to chart container
		const chartClone = originalChart.cloneNode(true) as HTMLElement;
		chartClone.id = 'print-chart-clone';
		chartClone.style.width = '100%';
		chartClone.style.height = '100%';
		chartClone.style.maxWidth = 'none';
		chartClone.style.maxHeight = 'none';
		chartClone.style.transform = 'none'; // Remove scaling
		chartClone.style.transformOrigin = 'center center';
		chartClone.style.overflow = 'visible';
		chartContainer.appendChild(chartClone);

		// Find and resize all SVG elements to ensure they fill the available space
		const svgElements = chartClone.querySelectorAll('svg');
		svgElements.forEach(svg => {
			svg.setAttribute('width', '100%');
			svg.setAttribute('height', '100%');
			svg.style.width = '100%';
			svg.style.height = '100%';
			svg.style.maxWidth = 'none';
			svg.style.maxHeight = 'none';
			svg.style.overflow = 'visible';

			// Keep the viewBox if it exists to maintain proportions
			// but set preserveAspectRatio to xMidYMid meet to maintain aspect ratio
			svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
		});

		// Enhance all Recharts components to fill the space completely
		const rechartsWrapper = chartClone.querySelector('.recharts-wrapper');
		if (rechartsWrapper) {
			(rechartsWrapper as HTMLElement).style.width = '100%';
			(rechartsWrapper as HTMLElement).style.height = '100%';
			(rechartsWrapper as HTMLElement).style.maxWidth = 'none';
			(rechartsWrapper as HTMLElement).style.maxHeight = 'none';
			(rechartsWrapper as HTMLElement).style.overflow = 'visible';
		}

		const rechartsSurface = chartClone.querySelector('.recharts-surface');
		if (rechartsSurface) {
			(rechartsSurface as SVGElement).style.width = '100%';
			(rechartsSurface as SVGElement).style.height = '100%';
			(rechartsSurface as SVGElement).style.overflow = 'visible';
			// Keep the viewBox but ensure preserveAspectRatio
			(rechartsSurface as SVGElement).setAttribute('preserveAspectRatio', 'xMidYMid meet');
		}

		// Force the cartesian grid to fill the entire chart area
		const cartesianGrid = chartClone.querySelector('.recharts-cartesian-grid');
		if (cartesianGrid) {
			(cartesianGrid as SVGElement).style.width = '100%';
			(cartesianGrid as SVGElement).style.height = '100%';
		}

		// Make sure X axis extends full width
		const xAxis = chartClone.querySelector('.recharts-xAxis');
		if (xAxis) {
			(xAxis as SVGElement).style.width = '100%';
		}

		// Make the Y-axis stretch to fill the full container height
		const yAxisElements = chartClone.querySelectorAll('.recharts-yAxis');
		yAxisElements.forEach(yAxis => {
			// Force y-axis to take full height
			(yAxis as SVGElement).style.height = '100%';

			// Adjust the Y-axis width to accommodate labels
			(yAxis as SVGElement).style.width = '60px';
		});

		// Create footer container
		const footerContainer = document.createElement('div');
		footerContainer.style.padding = '10px 20px';
		footerContainer.style.borderTop = '1px solid #eee';

		// Create a container for the ReportFooter React component
		const footerContentContainer = document.createElement('div');
		footerContentContainer.id = 'print-chart-footer-container';
		footerContainer.appendChild(footerContentContainer);

		printContainer.appendChild(footerContainer);

		// Add print-specific stylesheet
		const style = document.createElement('style');
		style.innerHTML = `
      @media print {
        /* Hide everything except our print container */
        body > *:not(#print-single-chart-container) {
          display: none !important;
        }
        
        /* Set landscape orientation and adjust margins */
        @page {
          size: landscape;
          margin: 0.5in;
        }
        
        /* Ensure the print container is visible and takes up the full page */
        #print-single-chart-container {
          display: flex !important;
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background-color: white !important;
          padding: 0 !important;
          margin: 0 !important;
          overflow: visible !important;
        }
        
        /* Center the chart container horizontally */
        #print-chart-clone {
          width: 100% !important;
          height: 100% !important;
          overflow: visible !important;
        }
        
        /* Force Recharts components to expand fully */
        #print-chart-clone .recharts-wrapper {
          width: 100% !important;
          height: 100% !important;
          overflow: visible !important;
        }
        
        #print-chart-clone .recharts-surface {
          width: 100% !important;
          height: 100% !important;
          overflow: visible !important;
        }

        /* Make sure all SVG elements are properly displayed */
        #print-chart-clone svg {
          width: 100% !important;
          height: 100% !important;
          overflow: visible !important;
        }
        
        /* Ensure legends are visible */
        #print-chart-clone .recharts-legend-wrapper {
          overflow: visible !important;
          display: flex !important;
					height: 90px;
          justify-content: center !important;
          width: 100% !important;
          margin-top: 10px !important;
          transform: scale(0.8) !important; /* Scale down the entire legend */
        }
        
				#print-chart-clone .recharts-legend-icon {
          display: none !important;
        }
        /* Adjust legend item sizes */
        #print-chart-clone .recharts-legend-item {
          display: flex !important;
          align-items: center !important;
          margin: 0 10px !important;
        }

        /* Fix legend symbol sizes */
        #print-chart-clone .recharts-legend-item-symbol {
          width: 10px !important;
          height: 10px !important;
          margin-right: 4px !important;
        }

        /* Adjust legend text */
        #print-chart-clone .recharts-legend-item-text {
          font-size: 12px !important;
          font-weight: 500 !important;
        }
        
        /* Enhance visibility of elements when printed */
        #print-chart-clone .recharts-cartesian-axis-line,
        #print-chart-clone .recharts-cartesian-axis-tick-line,
        #print-chart-clone .recharts-cartesian-axis-domain {
          stroke-width: 1.5px !important;
          stroke: #333 !important;
        }
        
        #print-chart-clone .recharts-cartesian-grid-horizontal line,
        #print-chart-clone .recharts-cartesian-grid-vertical line {
          stroke-width: 0.75px !important;
          stroke: #e0e0e0 !important;
        }
        
        /* Ensure curves and lines are prominent */
        #print-chart-clone .recharts-curve,
        #print-chart-clone .recharts-line,
        #print-chart-clone .recharts-bar,
        #print-chart-clone .recharts-area {
          stroke-width: 2.5px !important;
        }
        
        #print-chart-clone .recharts-dot {
          r: 4 !important;
        }

        /* Improve tick label readability */
        #print-chart-clone .recharts-cartesian-axis-tick text {
          font-size: 10px !important;
          font-weight: 500 !important;
        }
      }
    `;
		document.head.appendChild(style);

		// Change document title for the print job
		const originalTitle = document.title;
		document.title = `${chartTitle} - VoterContact.io Report`;

		// Render React components into their containers
		import('react-dom/client').then(({ createRoot }) => {
			// Render the ReportTitle component
			const titleRoot = createRoot(titleContainer);
			titleRoot.render(<ReportTitle query={query} singleChartTitle={chartTitle} />);

			// Render the ReportFooter component
			const footerRoot = createRoot(footerContentContainer);
			footerRoot.render(
				<ReportFooter
					userEmail={userEmail}
					datasetName={datasetName}
				/>
			);

			// Apply final transforms after React components are rendered
			setTimeout(() => {
				// Print the chart
				window.print();

				// Cleanup after printing
				const cleanupFunction = () => {
					try {
						// Make sure all elements exist before trying to remove them
						if (document.head.contains(style)) {
							document.head.removeChild(style);
						}

						if (document.body.contains(printContainer)) {
							document.body.removeChild(printContainer);
						}

						document.title = originalTitle;

						// Unmount React components
						titleRoot.unmount();
						footerRoot.unmount();

						if (onCleanup) onCleanup();
					} catch (error) {
						console.error('Error during PrintChart cleanup:', error);
					}
				};

				// Short delay before cleanup to ensure printing is complete
				setTimeout(cleanupFunction, 1000);
			}, 500);
		});

		// Cleanup if component unmounts before printing completes
		return () => {
			try {
				if (document.head.contains(style)) {
					document.head.removeChild(style);
				}

				if (document.body.contains(printContainer)) {
					document.body.removeChild(printContainer);
				}

				document.title = originalTitle;

				if (onCleanup) onCleanup();
			} catch (error) {
				console.error('Error during PrintChart unmount cleanup:', error);
			}
		};
	}, [chartId, chartTitle, query, userEmail, datasetName, onCleanup]);

	return null; // This component doesn't render anything visible in the UI
};
