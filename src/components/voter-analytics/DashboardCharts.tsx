
import { useState, useEffect } from 'react';
import { type VoterMetrics, type QueryParams } from '@/types/analytics';
import { fetchVoterMetrics } from '@/lib/voter-data';
import { TacticsPieChart } from './charts/TacticsPieChart';
import { ContactsPieChart } from './charts/ContactsPieChart';
import { NotReachedPieChart } from './charts/NotReachedPieChart';
import { ActivityLineChart } from './charts/ActivityLineChart';
import { PrintReport } from './PrintReport';
import { CHART_COLORS } from '@/types/analytics';

interface DashboardChartsProps {
  isLoading: boolean;
  query: Partial<QueryParams>;
  showFilteredData: boolean;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ 
  isLoading, 
  query, 
  showFilteredData 
}) => {
  const [tacticsData, setTacticsData] = useState<any[]>([]);
  const [contactsData, setContactsData] = useState<any[]>([]);
  const [notReachedData, setNotReachedData] = useState<any[]>([]);
  const [lineChartData, setLineChartData] = useState<any[]>([]);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalContacts, setTotalContacts] = useState(0);
  const [totalNotReached, setTotalNotReached] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setLoading(true);
        
        // Fetch aggregated metrics from our service - either overall or filtered
        const metrics = await fetchVoterMetrics(showFilteredData ? query : undefined);
        
        // Chart 1: Tactics breakdown (SMS, Phone, Canvas)
        const tacticsChartData = [
          { name: 'SMS', value: metrics.tactics.sms || 0, color: CHART_COLORS.TACTIC.SMS },
          { name: 'Phone', value: metrics.tactics.phone || 0, color: CHART_COLORS.TACTIC.PHONE },
          { name: 'Canvas', value: metrics.tactics.canvas || 0, color: CHART_COLORS.TACTIC.CANVAS }
        ];
        
        // Chart 2: Contacts breakdown (Support, Oppose, Undecided)
        const contactsChartData = [
          { name: 'Support', value: metrics.contacts.support || 0, color: CHART_COLORS.CONTACT.SUPPORT },
          { name: 'Oppose', value: metrics.contacts.oppose || 0, color: CHART_COLORS.CONTACT.OPPOSE },
          { name: 'Undecided', value: metrics.contacts.undecided || 0, color: CHART_COLORS.CONTACT.UNDECIDED }
        ];
        
        // Chart 3: Not Reached breakdown (Not Home, Refusal, Bad Data)
        const notReachedChartData = [
          { name: 'Not Home', value: metrics.notReached.notHome || 0, color: CHART_COLORS.NOT_REACHED.NOT_HOME },
          { name: 'Refusal', value: metrics.notReached.refusal || 0, color: CHART_COLORS.NOT_REACHED.REFUSAL },
          { name: 'Bad Data', value: metrics.notReached.badData || 0, color: CHART_COLORS.NOT_REACHED.BAD_DATA }
        ];
        
        // Line chart data
        const lineData = metrics.byDate || [];
        
        // Calculate totals
        const totalTactics = tacticsChartData.reduce((sum, item) => sum + item.value, 0);
        const totalContactsValue = contactsChartData.reduce((sum, item) => sum + item.value, 0);
        const totalNotReachedValue = notReachedChartData.reduce((sum, item) => sum + item.value, 0);
        
        setTacticsData(tacticsChartData);
        setContactsData(contactsChartData);
        setNotReachedData(notReachedChartData);
        setLineChartData(lineData);
        setTotalAttempts(totalTactics);
        setTotalContacts(totalContactsValue);
        setTotalNotReached(totalNotReachedValue);
      } catch (error) {
        console.error('Error loading chart data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadChartData();
  }, [query, showFilteredData]);
  
  // Handle print functionality
  const handlePrint = () => {
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
    
    // Trigger print
    window.print();
    
    // Clean up
    setTimeout(() => {
      document.head.removeChild(style);
    }, 1000);
  };
  
  if (loading || isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded"></div>
          ))}
        </div>
        <div className="mt-6 h-72 bg-gray-100 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Analytics {showFilteredData ? '(Filtered Results)' : '(Overall)'}</h2>
        <PrintReport query={query} onPrint={handlePrint} />
      </div>
      
      <div id="report-container">
        {/* Move the report title inside the report container for proper printing */}
        <div id="report-title" className="hidden">
          <pre className="text-xl font-bold whitespace-pre-line text-center">
            {formatTitle(query)}
          </pre>
        </div>
        
        {/* Pie charts row - normal responsive grid for screen, flex for print */}
        <div id="pie-charts-row" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Chart 1: Tactics Distribution */}
          <div className="pie-chart-container">
            <TacticsPieChart data={tacticsData} total={totalAttempts} />
          </div>
          
          {/* Chart 2: Contact Results */}
          <div className="pie-chart-container">
            <ContactsPieChart data={contactsData} total={totalContacts} />
          </div>
          
          {/* Chart 3: Not Reached Breakdown */}
          <div className="pie-chart-container">
            <NotReachedPieChart data={notReachedData} total={totalNotReached} />
          </div>
        </div>
        
        {/* Line chart showing attempts, contacts, and issues by date */}
        <div id="line-chart-container">
          <ActivityLineChart data={lineChartData} />
        </div>
      </div>
    </div>
  );
};

// Format the title based on query parameters - moved from PrintReport to here
const formatTitle = (query: Partial<QueryParams>) => {
  const { tactic, resultType, person, team, date, endDate } = query;
  
  let title = '';
  
  // First line: "Tactic ResultType"
  if (tactic && tactic !== 'All') {
    title += tactic;
  } else {
    title += "All Tactics";
  }
  
  if (resultType && resultType !== 'All') {
    title += ` ${resultType}`;
  } else {
    title += " Results";
  }
  
  // Second line: "Person by Team"
  title += "\n";
  if (person && person !== 'All') {
    title += `${person}`;
  } else {
    title += "All Canvassers";
  }
  
  title += " by ";
  
  if (team && team !== 'All') {
    title += `${team}`;
  } else {
    title += "All Teams";
  }
  
  // Third line: "Date to EndDate"
  title += "\n";
  if (date && date !== 'All') {
    title += `${date}`;
  } else {
    title += "All Dates";
  }
  
  if (endDate && endDate !== 'All') {
    title += ` to ${endDate}`;
  }
  
  return title;
};
