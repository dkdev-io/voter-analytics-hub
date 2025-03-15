
import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { fetchTactics, fetchTeams, fetchDates } from '@/lib/voter-data';

interface DashboardChartsProps {
  isLoading: boolean;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ isLoading }) => {
  const [tacticData, setTacticData] = useState<any[]>([]);
  const [teamData, setTeamData] = useState<any[]>([]);
  const [dateData, setDateData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setLoading(true);
        
        // Fetch data for charts
        const tactics = await fetchTactics();
        const teams = await fetchTeams();
        const dates = await fetchDates();
        
        // Create sample data for the charts - in a real app, you'd use actual aggregated data
        const tacticChartData = tactics.map((tactic, index) => ({
          name: tactic,
          value: Math.floor(Math.random() * 100) + 20
        }));
        
        const teamChartData = teams.map((team, index) => ({
          name: team,
          value: Math.floor(Math.random() * 80) + 10
        }));
        
        const dateChartData = dates.slice(0, 7).map((date, index) => ({
          name: date,
          contacts: Math.floor(Math.random() * 50) + 5,
          attempts: Math.floor(Math.random() * 100) + 20
        }));
        
        setTacticData(tacticChartData);
        setTeamData(teamChartData);
        setDateData(dateChartData);
      } catch (error) {
        console.error('Error loading chart data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadChartData();
  }, []);
  
  if (loading || isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Chart 1: Tactics Distribution */}
        <div className="h-64 bg-white rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium p-2 text-center">Tactics Distribution</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={tacticData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={60}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {tacticData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Chart 2: Team Performance */}
        <div className="h-64 bg-white rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium p-2 text-center">Team Performance</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart
              data={teamData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Chart 3: Activity Over Time */}
        <div className="h-64 bg-white rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium p-2 text-center">Activity Over Time</h3>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart
              data={dateData}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="contacts" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="attempts" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Custom tooltip component for the charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 shadow-md rounded text-xs">
        <p className="font-semibold">{`${label || payload[0].name}`}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} style={{ color: item.color }}>
            {`${item.name || item.dataKey}: ${item.value}`}
          </p>
        ))}
      </div>
    );
  }

  return null;
};
