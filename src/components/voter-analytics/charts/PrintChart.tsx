
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
    chartContainer.style.padding = '0 15px'; 
    chartContainer.style.width = '100%';
    chartContainer.style.height = '85%'; // Adjusted to give more room for the chart
    chartContainer.style.overflow = 'hidden'; // Prevent scrolling
    printContainer.appendChild(chartContainer);

    // Clone the chart and add to chart container
    const chartClone = originalChart.cloneNode(true) as HTMLElement;
    chartClone.id = 'print-chart-clone';
    chartClone.style.width = '100%';
    chartClone.style.height = '100%';
    chartClone.style.maxWidth = 'none';
    chartClone.style.maxHeight = 'none';
    chartClone.style.transform = 'scale(1.0)'; // Start with no scaling
    chartClone.style.transformOrigin = 'center center';
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
      
      // Force ViewBox to ensure proper scaling
      // Get the computed size of the container for accurate scaling
      const containerWidth = chartContainer.clientWidth;
      const containerHeight = chartContainer.clientHeight;
      
      // Set viewBox to use the full container dimensions
      svg.setAttribute('viewBox', `0 0 ${containerWidth} ${containerHeight}`);
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    });

    // Find all Recharts components and ensure they expand properly
    const rechartsWrapper = chartClone.querySelector('.recharts-wrapper');
    if (rechartsWrapper) {
      (rechartsWrapper as HTMLElement).style.width = '100%';
      (rechartsWrapper as HTMLElement).style.height = '100%';
      (rechartsWrapper as HTMLElement).style.maxWidth = 'none';
      (rechartsWrapper as HTMLElement).style.maxHeight = 'none';
    }

    const rechartsSurface = chartClone.querySelector('.recharts-surface');
    if (rechartsSurface) {
      (rechartsSurface as HTMLElement).style.width = '100%';
      (rechartsSurface as HTMLElement).style.height = '100%';
    }

    // Find and adjust axes to fill the available space
    const axes = chartClone.querySelectorAll('.recharts-cartesian-axis');
    axes.forEach(axis => {
      (axis as SVGElement).style.transform = 'none'; // Remove any transforms that might be limiting scaling
    });

    // Make the Y-axis stretch to fill the full container height
    const yAxisElements = chartClone.querySelectorAll('.recharts-yAxis');
    yAxisElements.forEach(yAxis => {
      // Force y-axis to take full height
      (yAxis as SVGElement).style.height = '100%';
      
      // Stretch the y-axis line to full height
      const yAxisLine = yAxis.querySelector('.recharts-cartesian-axis-line');
      if (yAxisLine) {
        (yAxisLine as SVGElement).style.strokeWidth = '2px';
        (yAxisLine as SVGElement).style.stroke = '#333';
        (yAxisLine as SVGElement).style.height = '100%';
      }
      
      // Also stretch domain line (if it exists)
      const yAxisDomain = yAxis.querySelector('.recharts-cartesian-axis-domain');
      if (yAxisDomain) {
        (yAxisDomain as SVGElement).style.strokeWidth = '2px';
        (yAxisDomain as SVGElement).style.stroke = '#333';
        (yAxisDomain as SVGElement).style.height = '100%';
      }
    });

    // Make all axis lines and ticks more visible
    const axisLines = chartClone.querySelectorAll('.recharts-cartesian-axis-line, .recharts-cartesian-axis-tick-line, .recharts-cartesian-axis-domain');
    axisLines.forEach(line => {
      (line as SVGElement).style.strokeWidth = '2px';
      (line as SVGElement).style.stroke = '#333';
    });

    // Enhance grid lines
    const gridLines = chartClone.querySelectorAll('.recharts-cartesian-grid-horizontal line, .recharts-cartesian-grid-vertical line');
    gridLines.forEach(line => {
      (line as SVGElement).style.strokeWidth = '1px';
      (line as SVGElement).style.stroke = '#e0e0e0';
    });

    // Make chart plots and lines more prominent
    const plotElements = chartClone.querySelectorAll('.recharts-curve, .recharts-line, .recharts-bar, .recharts-area');
    plotElements.forEach(element => {
      (element as SVGElement).style.strokeWidth = '3px';
    });
    
    // Make dots bigger for better visibility
    const dots = chartClone.querySelectorAll('.recharts-dot');
    dots.forEach(dot => {
      const currentR = dot.getAttribute('r');
      const newR = currentR ? Math.max(parseFloat(currentR), 6) : 6;
      dot.setAttribute('r', newR.toString());
    });

    // Ensure the chart container fills maximum available space
    const chartArea = chartClone.querySelector('.recharts-cartesian-grid');
    if (chartArea) {
      (chartArea as SVGElement).style.width = '100%';
      (chartArea as SVGElement).style.height = '100%';
    }

    // Create footer container using ReportFooter component to match Print All Charts format
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
          margin: 0.5cm;
        }
        
        /* Ensure the print container is visible and takes up the full page */
        #print-single-chart-container {
          display: flex !important;
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 9999 !important;
          background-color: white !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        
        /* Make sure chart is maximized */
        #print-chart-clone {
          width: 100% !important;
          height: 100% !important;
          max-width: none !important;
          max-height: none !important;
        }
        
        /* Ensure Recharts components expand properly */
        #print-chart-clone .recharts-wrapper {
          width: 100% !important;
          height: 100% !important;
          max-width: none !important;
          max-height: none !important;
        }
        
        #print-chart-clone .recharts-surface {
          width: 100% !important;
          height: 100% !important;
        }

        /* Ensure Y axis extends fully */
        #print-chart-clone .recharts-yAxis {
          height: 100% !important;
        }
        
        #print-chart-clone .recharts-cartesian-axis-line,
        #print-chart-clone .recharts-cartesian-axis-tick-line,
        #print-chart-clone .recharts-cartesian-axis-domain {
          stroke-width: 2px !important;
          stroke: #333 !important;
        }
        
        #print-chart-clone .recharts-cartesian-grid-horizontal line,
        #print-chart-clone .recharts-cartesian-grid-vertical line {
          stroke-width: 1px !important;
          stroke: #e0e0e0 !important;
        }
        
        /* Ensure curves and lines are prominent */
        #print-chart-clone .recharts-curve,
        #print-chart-clone .recharts-line,
        #print-chart-clone .recharts-bar,
        #print-chart-clone .recharts-area {
          stroke-width: 3px !important;
        }
        
        #print-chart-clone .recharts-dot {
          r: 6 !important;
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
      titleRoot.render(<ReportTitle query={query} />);
      
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
        // Find the optimal scale factor based on container dimensions
        const chartBox = chartClone.getBoundingClientRect();
        const containerBox = chartContainer.getBoundingClientRect();
        
        // Calculate scale factors
        const scaleX = containerBox.width / chartBox.width;
        const scaleY = containerBox.height / chartBox.height;
        
        // Use the smaller scale factor to ensure the chart fits completely
        const scale = Math.min(scaleX, scaleY) * 0.95; // 95% to add a small margin
        
        // Apply the scaling
        chartClone.style.transform = `scale(${scale})`;
        
        // Trigger print dialog after everything is rendered
        setTimeout(() => {
          window.print();
          
          // Cleanup after printing
          setTimeout(() => {
            document.head.removeChild(style);
            document.body.removeChild(printContainer);
            document.title = originalTitle;
            
            // Unmount React components
            titleRoot.unmount();
            footerRoot.unmount();
            
            if (onCleanup) onCleanup();
          }, 1000);
        }, 500);
      }, 100);
    });
    
    // Cleanup if component unmounts before printing completes
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
      if (document.body.contains(printContainer)) {
        document.body.removeChild(printContainer);
      }
      document.title = originalTitle;
    };
  }, [chartId, chartTitle, query, userEmail, datasetName, onCleanup]);
  
  return null; // This component doesn't render anything visible in the UI
};
