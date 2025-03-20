
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { CHART_COLORS } from '@/types/analytics';
import { format, isValid, parseISO } from 'date-fns';

interface ActivityLineChartProps {
  data: Array<{
    date: string;
    attempts: number;
    contacts: number;
    issues: number;
  }>;
}

export const ActivityLineChart: React.FC<ActivityLineChartProps> = ({ data }) => {
  // Filter out any data points with invalid dates
  const validData = data.filter(item => {
    // Check if the date is valid
    const isValidDate = item.date && isValid(parseISO(item.date));
    return isValidDate;
  });
  
  // Sort dates chronologically
  validData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Format dates to MM/DD format for display
  const formattedData = validData.map(item => ({
    ...item,
    displayDate: format(new Date(item.date), 'MM/dd'),
    // Ensure all values are at least 0 (not undefined/null)
    attempts: item.attempts || 0,
    contacts: item.contacts || 0,
    issues: item.issues || 0
  }));

  // Calculate the maximum value for Y-axis scaling
  const maxValue = formattedData.reduce((max, item) => {
    const itemMax = Math.max(item.attempts, item.contacts, item.issues);
    return itemMax > max ? itemMax : max;
  }, 0);

  return (
    <div className="mt-8 h-80 bg-white rounded-lg border border-gray-200">
      <h3 className="text-sm font-bold p-2 text-center">Activity Over Time</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={formattedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="displayDate" 
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
            tick={{ fontSize: 8 }}
          />
          <YAxis 
            domain={[0, Math.ceil(maxValue * 1.1)]} // Add 10% padding to the top
            tick={{ fontSize: 10 }}
          />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="attempts"
            stroke={CHART_COLORS.LINE.ATTEMPTS}
            activeDot={{ r: 8 }}
            strokeWidth={2}
            name="Attempts"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="contacts"
            stroke={CHART_COLORS.LINE.CONTACTS}
            activeDot={{ r: 6 }}
            strokeWidth={2}
            name="Contacts"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="issues"
            stroke={CHART_COLORS.LINE.ISSUES}
            activeDot={{ r: 6 }}
            strokeWidth={2}
            name="Issues"
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
