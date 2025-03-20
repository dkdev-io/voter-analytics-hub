
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
  // Filter out any data points with invalid dates
  const validData = data.filter(item => {
    // Check if the date is valid
    const isValidDate = item.date && isValid(parseISO(item.date));
    return isValidDate;
  });

  // Sort dates chronologically to ensure proper cumulative calculation
  validData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Transform the data to create cumulative totals from valid data points
  const cumulativeData = validData.reduce((acc, current, index) => {
    if (index === 0) {
      // First item starts the cumulative totals
      acc.push({
        ...current,
        displayDate: format(new Date(current.date), 'MM/dd'),
        cumulativeAttempts: current.attempts || 0,
        cumulativeContacts: current.contacts || 0,
        cumulativeIssues: current.issues || 0
      });
    } else {
      // Add current values to previous cumulative totals
      const prevCumulative = acc[index - 1];
      acc.push({
        ...current,
        displayDate: format(new Date(current.date), 'MM/dd'),
        cumulativeAttempts: prevCumulative.cumulativeAttempts + (current.attempts || 0),
        cumulativeContacts: prevCumulative.cumulativeContacts + (current.contacts || 0),
        cumulativeIssues: prevCumulative.cumulativeIssues + (current.issues || 0)
      });
    }
    return acc;
  }, [] as Array<any>);

  // Calculate the maximum cumulative value for Y-axis scaling
  const maxCumulativeValue = cumulativeData.length > 0 
    ? Math.max(
        cumulativeData[cumulativeData.length - 1].cumulativeAttempts,
        cumulativeData[cumulativeData.length - 1].cumulativeContacts,
        cumulativeData[cumulativeData.length - 1].cumulativeIssues
      )
    : 0;

  return (
    <div className="mt-8 h-80 bg-white rounded-lg border border-gray-200">
      <h3 className="text-sm font-bold p-2 text-center">Cumulative Progress Over Time</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={cumulativeData}
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
            tickFormatter={formatNumber} 
            domain={[0, Math.ceil(maxCumulativeValue * 1.1)]} // Add 10% padding to the top
            tick={{ fontSize: 10 }}
          />
          <Tooltip formatter={(value) => [formatNumber(value as number), '']} />
          <Legend />
          <Line
            type="monotone"
            dataKey="cumulativeAttempts"
            stroke={CHART_COLORS.LINE.ATTEMPTS}
            activeDot={{ r: 8 }}
            strokeWidth={2}
            name="Cumulative Attempts"
            dot={false}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="cumulativeContacts"
            stroke={CHART_COLORS.LINE.CONTACTS}
            activeDot={{ r: 6 }}
            strokeWidth={2}
            name="Cumulative Contacts"
            dot={false}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="cumulativeIssues"
            stroke={CHART_COLORS.LINE.ISSUES}
            activeDot={{ r: 6 }}
            strokeWidth={2}
            name="Cumulative Issues"
            dot={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
