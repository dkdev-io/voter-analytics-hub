import React, { useEffect } from 'react';
import { ReportTitle } from './ReportTitle';
import { ReportFooter } from './ReportFooter';
import { type QueryParams } from '@/types/analytics';

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

    // Create title element
    const titleElement = document.createElement('div');
    titleElement.style.textAlign = 'center';
    titleElement.style.padding = '10px 0';
    titleElement.style.borderBottom = '1px solid #eee';
    titleElement.innerHTML = `
      <h1 style="font-size: 18px; font-weight: bold; margin: 0;">VoterContact.io Report: ${chartTitle}</h1>
      <p style="font-size: 12px; margin: 5px 0;">${formatSubtitle(query)}</p>
    `;
    printContainer.appendChild(titleElement);

    // Create container for the chart that takes up most of the page
    const chartContainer = document.createElement('div');
    chartContainer.style.flexGrow = '1';
    chartContainer.style.display = 'flex';
    chartContainer.style.alignItems = 'center';
    chartContainer.style.justifyContent = 'center';
    chartContainer.style.padding = '5px'; 
    chartContainer.style.width = '100%';
    chartContainer.style.height = '90%'; // Increased to give even more space to the chart
    printContainer.appendChild(chartContainer);

    // Clone the chart and add to chart container
    const chartClone = originalChart.cloneNode(true) as HTMLElement;
    chartClone.id = 'print-chart-clone';
    chartClone.style.width = '100%';
    chartClone.style.height = '100%';
    chartClone.style.maxWidth = 'none';
    chartClone.style.maxHeight = 'none';
    chartClone.style.transform = 'scale(1.1)'; // Slightly increased scale
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
      const bbox = svg.getBBox ? svg.getBBox() : {width: 800, height: 600};
      svg.setAttribute('viewBox', `0 0 ${bbox.width} ${bbox.height}`);
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
      (rechartsSurface as HTMLElement).style.maxWidth = 'none';
      (rechartsSurface as HTMLElement).style.maxHeight = 'none';
    }

    // Find and adjust Y axis specifically to ensure it spans the full height
    const yAxisElements = chartClone.querySelectorAll('.recharts-yAxis');
    yAxisElements.forEach(yAxis => {
      const yAxisLine = yAxis.querySelector('.recharts-cartesian-axis-line');
      if (yAxisLine) {
        (yAxisLine as SVGElement).style.strokeWidth = '2.5px';
        (yAxisLine as SVGElement).style.stroke = '#333';
      }
      
      // Adjust domain line height to stretch fully
      const yAxisDomain = yAxis.querySelector('.recharts-cartesian-axis-domain');
      if (yAxisDomain) {
        (yAxisDomain as SVGElement).style.strokeWidth = '2.5px';
        (yAxisDomain as SVGElement).style.stroke = '#333';
      }
    });

    // Make the axes extend fully with thicker lines for better visibility
    const axisLines = chartClone.querySelectorAll('.recharts-cartesian-axis-line, .recharts-cartesian-axis-tick-line, .recharts-cartesian-axis-domain');
    axisLines.forEach(line => {
      (line as SVGElement).style.strokeWidth = '2.5px';
      (line as SVGElement).style.stroke = '#333';
    });

    // Make grid lines more visible
    const gridLines = chartClone.querySelectorAll('.recharts-cartesian-grid-horizontal line, .recharts-cartesian-grid-vertical line');
    gridLines.forEach(line => {
      (line as SVGElement).style.strokeWidth = '1.2px';
      (line as SVGElement).style.stroke = '#e0e0e0';
    });

    // Ensure axis ticks are larger and more visible
    const axisTicks = chartClone.querySelectorAll('.recharts-cartesian-axis-tick');
    axisTicks.forEach(tick => {
      (tick as SVGElement).style.fontSize = '14px';
      const text = tick.querySelector('text');
      if (text) {
        (text as SVGElement).style.fill = '#333';
        (text as SVGElement).style.fontWeight = '600';
      }
    });

    // Find the y-axis and ensure it extends fully
    const yAxis = chartClone.querySelector('.recharts-yAxis');
    if (yAxis) {
      // Force y-axis to take full height
      (yAxis as SVGElement).style.height = '100%';
    }

    // Ensure the chart container fills maximum available space
    const chartArea = chartClone.querySelector('.recharts-cartesian-grid');
    if (chartArea) {
      (chartArea as SVGElement).style.width = '100%';
      (chartArea as SVGElement).style.height = '100%';
    }

    // Ensure y-axis text is properly spaced
    const yAxisTicks = chartClone.querySelectorAll('.recharts-yAxis .recharts-cartesian-axis-tick');
    const yAxisTickCount = yAxisTicks.length;
    if (yAxisTickCount > 0) {
      // Make sure y-axis labels are evenly distributed
      yAxisTicks.forEach((tick, index) => {
        const yPos = 100 - (index * (100 / (yAxisTickCount - 1)));
        (tick as SVGElement).style.transform = `translateY(${yPos}%)`;
      });
    }

    // Make the chart plots and lines more prominent
    const plotItems = chartClone.querySelectorAll('.recharts-curve, .recharts-line');
    plotItems.forEach(item => {
      (item as SVGElement).style.strokeWidth = '3px';
    });

    // Make dots bigger for better visibility
    const dots = chartClone.querySelectorAll('.recharts-dot');
    dots.forEach(dot => {
      const currentR = dot.getAttribute('r');
      const newR = currentR ? Math.max(parseFloat(currentR), 5) : 5;
      dot.setAttribute('r', newR.toString());
    });

    // Remove any overlay graphics or unwanted elements
    const overlayElements = chartClone.querySelectorAll('.chart-overlay, [style*="position: absolute"]');
    overlayElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });

    // Create footer
    const footerElement = document.createElement('div');
    footerElement.style.padding = '10px';
    footerElement.style.borderTop = '1px solid #eee';
    footerElement.style.fontSize = '10px';
    footerElement.style.color = '#666';
    footerElement.style.textAlign = 'center';
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    footerElement.textContent = `Prepared for ${userEmail || 'user@example.com'} on ${currentDate}. From ${datasetName || 'Voter Contacts Dataset'}.`;
    printContainer.appendChild(footerElement);

    // Add print-specific stylesheet
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        /* Hide everything except our print container */
        body > *:not(#print-single-chart-container) {
          display: none !important;
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
          transform: scale(1.1) !important;
          transform-origin: center center !important;
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
          max-width: none !important;
          max-height: none !important;
        }

        /* Ensure chart container is maximized */
        #print-chart-clone .recharts-cartesian-grid {
          width: 100% !important;
          height: 100% !important;
        }
        
        /* Specific styling for Y axis to make it stretch fully */
        #print-chart-clone .recharts-yAxis {
          height: 100% !important;
        }
        
        #print-chart-clone .recharts-yAxis .recharts-cartesian-axis-line,
        #print-chart-clone .recharts-yAxis .recharts-cartesian-axis-domain {
          stroke-width: 2.5px !important;
          stroke: #333 !important;
          height: 100% !important;
        }
        
        /* Ensure the axis lines and labels extend fully and are more visible */
        #print-chart-clone .recharts-cartesian-axis-line,
        #print-chart-clone .recharts-cartesian-axis-tick-line,
        #print-chart-clone .recharts-cartesian-axis-domain {
          stroke-width: 2.5px !important;
          stroke: #333 !important;
        }
        
        #print-chart-clone .recharts-cartesian-grid-horizontal line,
        #print-chart-clone .recharts-cartesian-grid-vertical line {
          stroke-width: 1.2px !important;
          stroke: #e0e0e0 !important;
        }
        
        #print-chart-clone .recharts-cartesian-axis-tick {
          font-size: 14px !important;
        }
        
        #print-chart-clone .recharts-cartesian-axis-tick text {
          fill: #333 !important;
          font-weight: 600 !important;
        }
        
        /* Ensure curves and data points are very visible */
        #print-chart-clone .recharts-curve,
        #print-chart-clone .recharts-line {
          stroke-width: 3px !important;
        }
        
        #print-chart-clone .recharts-dot {
          r: 5 !important;
        }
        
        /* Set landscape orientation and remove page margins */
        @page {
          size: landscape;
          margin: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Change document title for the print job
    const originalTitle = document.title;
    document.title = `${chartTitle} - VoterContact.io Report`;
    
    // Trigger print dialog after a slight delay to ensure everything is rendered
    setTimeout(() => {
      window.print();
      
      // Cleanup after printing
      setTimeout(() => {
        document.head.removeChild(style);
        document.body.removeChild(printContainer);
        document.title = originalTitle;
        if (onCleanup) onCleanup();
      }, 1000);
    }, 500);
    
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

// Format the subtitle for single chart printouts
const formatSubtitle = (query: Partial<QueryParams>) => {
  const { tactic, resultType, person, team } = query;
  
  let subtitle = '';
  
  if (team && team !== 'All') {
    subtitle += `${team} `;
  }
  
  if (person && person !== 'All') {
    subtitle += `${person}`;
  } else if (team && team !== 'All') {
    subtitle += "All Members";
  } else {
    subtitle += "All Teams";
  }
  
  // Add tactic and result type if present
  if ((tactic && tactic !== 'All') || (resultType && resultType !== 'All')) {
    subtitle += " - ";
    
    if (tactic && tactic !== 'All') {
      subtitle += tactic;
    }
    
    if (resultType && resultType !== 'All') {
      if (tactic && tactic !== 'All') {
        subtitle += " ";
      }
      subtitle += resultType;
    }
  }
  
  return subtitle;
};
