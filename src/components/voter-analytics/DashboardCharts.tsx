
import { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { CHART_COLORS, type VoterMetrics, type QueryParams } from '@/types/analytics';
import { fetchVoterMetrics } from '@/lib/voter-data';

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
      <h2 className="text-xl font-semibold mb-4">Analytics {showFilteredData ? '(Filtered Results)' : '(Overall)'}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Chart 1: Tactics Distribution */}
        <div className="h-72 bg-white rounded-lg border border-gray-200 flex flex-col">
          <h3 className="text-sm font-medium p-2 text-center">Tactic Distribution</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tacticsData}
                  cx="50%"
                  cy="45%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {tacticsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center pb-2 font-semibold">
            Total: {totalAttempts}
          </div>
        </div>
        
        {/* Chart 2: Contact Results */}
        <div className="h-72 bg-white rounded-lg border border-gray-200 flex flex-col">
          <h3 className="text-sm font-medium p-2 text-center">Contact Results</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contactsData}
                  cx="50%"
                  cy="45%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {contactsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center pb-2 font-semibold">
            Total: {totalContacts}
          </div>
        </div>
        
        {/* Chart 3: Not Reached Breakdown */}
        <div className="h-72 bg-white rounded-lg border border-gray-200 flex flex-col">
          <h3 className="text-sm font-medium p-2 text-center">Not Reached Breakdown</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={notReachedData}
                  cx="50%"
                  cy="45%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {notReachedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center pb-2 font-semibold">
            Total: {totalNotReached}
          </div>
        </div>
      </div>
      
      {/* Line chart showing attempts, contacts, and issues by date */}
      <div className="mt-8 h-80 bg-white rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium p-2 text-center">Activity Over Time</h3>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart
            data={lineChartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="attempts"
              stroke={CHART_COLORS.LINE.ATTEMPTS}
              activeDot={{ r: 8 }}
              strokeWidth={2}
              name="Attempts"
            />
            <Line
              type="monotone"
              dataKey="contacts"
              stroke={CHART_COLORS.LINE.CONTACTS}
              activeDot={{ r: 6 }}
              strokeWidth={2}
              name="Contacts"
            />
            <Line
              type="monotone"
              dataKey="issues"
              stroke={CHART_COLORS.LINE.ISSUES}
              activeDot={{ r: 6 }}
              strokeWidth={2}
              name="Issues"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Custom tooltip component for the charts
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = payload[0].payload.total || 
                 (typeof data.value === 'number' ? data.value : 0);
    
    return (
      <div className="bg-white p-2 border border-gray-200 shadow-md rounded text-xs">
        <p className="font-semibold">{payload[0].name}</p>
        <p style={{ color: payload[0].payload.color }}>
          Value: {payload[0].value}
        </p>
        {total > 0 && (
          <p>
            Percentage: {((payload[0].value / total) * 100).toFixed(1)}%
          </p>
        )}
      </div>
    );
  }

  return null;
};
