
import React from 'react';
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

interface CumulativeLineChartProps {
  data: Array<{
    date: string;
    attempts: number;
    contacts: number;
    issues: number;
  }>;
}

const formatNumber = (value: number) => {
  return value.toLocaleString();
};

export const CumulativeLineChart: React.FC<CumulativeLineChartProps> = ({ data }) => {
  // Filter out any data points with invalid dates or zeros across all metrics
  const validData = data.filter(item => {
    // Check if the date is valid
    const isValidDate = item.date && isValid(parseISO(item.date));
    
    // Check if there's actual data (at least one metric has a value)
    const hasData = item.attempts > 0 || item.contacts > 0 || item.issues > 0;
    
    return isValidDate && hasData;
  });

  // Transform the data to create cumulative totals from valid data points
  const cumulativeData = validData.reduce((acc, current, index) => {
    if (index === 0) {
      // First item stays the same
      acc.push({
        ...current,
        displayDate: format(new Date(current.date), 'MM/dd'),
        cumulativeAttempts: current.attempts,
        cumulativeContacts: current.contacts,
        cumulativeIssues: current.issues
      });
    } else {
      // Add current values to previous cumulative totals
      const prevCumulative = acc[index - 1];
      acc.push({
        ...current,
        displayDate: format(new Date(current.date), 'MM/dd'),
        cumulativeAttempts: prevCumulative.cumulativeAttempts + current.attempts,
        cumulativeContacts: prevCumulative.cumulativeContacts + current.contacts,
        cumulativeIssues: prevCumulative.cumulativeIssues + current.issues
      });
    }
    return acc;
  }, [] as Array<any>);

  return (
    <div className="mt-8 h-80 bg-white rounded-lg border border-gray-200">
      <h3 className="text-sm font-bold p-2 text-center">Cumulative Progress Over Time</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={cumulativeData}
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="displayDate" />
          <YAxis tickFormatter={formatNumber} />
          <Tooltip formatter={(value) => [formatNumber(value as number), '']} />
          <Legend />
          <Line
            type="monotone"
            dataKey="cumulativeAttempts"
            stroke={CHART_COLORS.LINE.ATTEMPTS}
            activeDot={{ r: 8 }}
            strokeWidth={2}
            name="Cumulative Attempts"
            dot={true}
          />
          <Line
            type="monotone"
            dataKey="cumulativeContacts"
            stroke={CHART_COLORS.LINE.CONTACTS}
            activeDot={{ r: 6 }}
            strokeWidth={2}
            name="Cumulative Contacts"
            dot={true}
          />
          <Line
            type="monotone"
            dataKey="cumulativeIssues"
            stroke={CHART_COLORS.LINE.ISSUES}
            activeDot={{ r: 6 }}
            strokeWidth={2}
            name="Cumulative Issues"
            dot={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
