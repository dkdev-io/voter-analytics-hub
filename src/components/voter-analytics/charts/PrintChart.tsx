
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
    printContainer.id = 'print-only-container';
    printContainer.style.position = 'absolute';
    printContainer.style.left = '-9999px';
    printContainer.style.top = '0';
    printContainer.style.width = '100%';
    printContainer.style.backgroundColor = 'white';
    document.body.appendChild(printContainer);

    // Create title element with minimal margins
    const titleElement = document.createElement('div');
    titleElement.id = 'print-title';
    titleElement.style.textAlign = 'center';
    titleElement.style.margin = '5px 0';
    titleElement.innerHTML = `
      <h1 style="font-size: 24px; font-weight: bold; margin: 0;">VoterContact.io Report</h1>
      <h2 style="font-size: 20px; font-weight: bold; margin: 3px 0;">${chartTitle}</h2>
      <p style="font-size: 14px; margin: 3px 0;">${formatSubtitle(query)}</p>
    `;
    printContainer.appendChild(titleElement);

    // Clone the chart and add to print container with maximized dimensions
    const chartClone = originalChart.cloneNode(true) as HTMLElement;
    chartClone.id = 'print-chart-clone';
    chartClone.style.height = '750px'; // Significantly increased height
    chartClone.style.width = '100%';
    chartClone.style.margin = '5px 0';
    chartClone.style.display = 'block';
    printContainer.appendChild(chartClone);

    // Create compact footer element
    const footerElement = document.createElement('div');
    footerElement.id = 'print-footer';
    footerElement.style.borderTop = '1px solid #eee';
    footerElement.style.padding = '5px 0';
    footerElement.style.margin = '5px 0';
    footerElement.style.textAlign = 'center';
    footerElement.style.fontSize = '10px';
    footerElement.style.color = '#666';
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    footerElement.textContent = `Prepared for ${userEmail || 'user@example.com'} on ${currentDate}. From ${datasetName || 'Voter Contacts Dataset'}.`;
    printContainer.appendChild(footerElement);

    // Add enhanced print stylesheet for full-page chart
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body > * {
          display: none !important;
        }
        #print-only-container {
          display: block !important;
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          padding: 5px !important;
          margin: 0 !important;
          visibility: visible !important;
          background-color: white !important;
          box-sizing: border-box !important;
        }
        #print-only-container * {
          visibility: visible !important;
        }
        #print-chart-clone {
          height: 80vh !important;
          width: 98vw !important;
          max-width: 98vw !important;
          margin: 0 auto !important;
          transform-origin: top left !important;
        }
        #print-chart-clone .recharts-wrapper {
          width: 100% !important;
          height: 100% !important;
        }
        #print-chart-clone .recharts-surface {
          width: 100% !important;
          height: 100% !important;
        }
        #print-title {
          height: 10vh !important;
          margin: 0 !important;
          padding: 5px 0 !important;
        }
        #print-title h1 {
          margin: 0 !important;
          padding: 0 !important;
        }
        #print-title h2 {
          margin: 3px 0 !important;
          padding: 0 !important;
        }
        #print-title p {
          margin: 3px 0 !important;
          padding: 0 !important;
        }
        #print-footer {
          height: 5vh !important;
          margin: 0 !important;
          padding: 5px 0 !important;
        }
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
    
    // Give more time for the DOM to update and chart to render in print container
    setTimeout(() => {
      // Force all SVG elements in the chart to redraw at full width
      const svgElements = chartClone.querySelectorAll('svg');
      svgElements.forEach(svg => {
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('preserveAspectRatio', 'xMinYMin meet');
        svg.style.width = '100%';
        svg.style.height = '100%';
      });
      
      // Print with slightly longer delay to ensure SVG redrawing
      setTimeout(() => {
        window.print();
        
        // Clean up after printing
        setTimeout(() => {
          document.head.removeChild(style);
          document.body.removeChild(printContainer);
          document.title = originalTitle;
          if (onCleanup) onCleanup();
        }, 1000);
      }, 300);
    }, 700);
    
    return () => {
      // Ensure cleanup happens if component unmounts before printing completes
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
