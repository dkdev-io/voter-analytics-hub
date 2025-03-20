
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
  // Filter out any data points with invalid dates or zeros across all metrics
  const validData = data.filter(item => {
    // Check if the date is valid
    const isValidDate = item.date && isValid(parseISO(item.date));
    
    // Check if there's actual data (at least one metric has a value)
    const hasData = item.attempts > 0 || item.contacts > 0 || item.issues > 0;
    
    return isValidDate && hasData;
  });
  
  // Format dates to MM/DD format for display
  const formattedData = validData.map(item => ({
    ...item,
    displayDate: format(new Date(item.date), 'MM/dd')
  }));

  return (
    <div className="mt-8 h-80 bg-white rounded-lg border border-gray-200">
      <h3 className="text-sm font-bold p-2 text-center">Activity Over Time</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={formattedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="displayDate" />
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
  );
};
