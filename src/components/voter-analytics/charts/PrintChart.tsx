
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
    chartContainer.style.padding = '20px';
    printContainer.appendChild(chartContainer);

    // Clone the chart and add to chart container
    const chartClone = originalChart.cloneNode(true) as HTMLElement;
    chartClone.id = 'print-chart-clone';
    chartClone.style.width = '100%';
    chartClone.style.height = '100%';
    chartContainer.appendChild(chartClone);

    // Find and resize all SVG elements to ensure they fill the available space
    const svgElements = chartClone.querySelectorAll('svg');
    svgElements.forEach(svg => {
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.style.width = '100%';
      svg.style.height = '100%';
    });

    // Find all Recharts components and ensure they expand properly
    const rechartsWrapper = chartClone.querySelector('.recharts-wrapper');
    if (rechartsWrapper) {
      (rechartsWrapper as HTMLElement).style.width = '100%';
      (rechartsWrapper as HTMLElement).style.height = '100%';
    }

    const rechartsSurface = chartClone.querySelector('.recharts-surface');
    if (rechartsSurface) {
      (rechartsSurface as HTMLElement).style.width = '100%';
      (rechartsSurface as HTMLElement).style.height = '100%';
    }

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
          width: 100vw !important;
          height: 100vh !important;
          z-index: 9999 !important;
          background-color: white !important;
        }
        
        /* Make sure chart is maximized */
        #print-chart-clone {
          width: 100% !important;
          height: 100% !important;
        }
        
        /* Ensure Recharts components expand properly */
        #print-chart-clone .recharts-wrapper {
          width: 100% !important;
          height: 100% !important;
        }
        
        #print-chart-clone .recharts-surface {
          width: 100% !important;
          height: 100% !important;
        }
        
        /* Ensure the axis lines and labels extend fully */
        #print-chart-clone .recharts-cartesian-axis-line,
        #print-chart-clone .recharts-cartesian-axis-tick-line {
          stroke-width: 1px !important;
        }
        
        #print-chart-clone .recharts-cartesian-grid-horizontal line,
        #print-chart-clone .recharts-cartesian-grid-vertical line {
          stroke-width: 1px !important;
        }
        
        #print-chart-clone .recharts-cartesian-axis-tick {
          font-size: 12px !important;
        }
        
        /* Remove page margins */
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
