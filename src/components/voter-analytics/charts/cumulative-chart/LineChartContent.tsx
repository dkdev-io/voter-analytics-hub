
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

interface LineChartContentProps {
  data: Array<any>;
  showDailyData: boolean;
  maxValue: number;
}

export const LineChartContent: React.FC<LineChartContentProps> = ({ 
  data, 
  showDailyData, 
  maxValue 
}) => {
  return (
    <ResponsiveContainer width="100%" height="90%">
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="displayDate"
          interval={0}
          angle={-45}
          textAnchor="end"
          height={60}
          tick={{ fontSize: 9 }}
          tickLine={{ strokeWidth: 1.5 }}
          axisLine={{ strokeWidth: 1.5 }}
        />
        <YAxis
          domain={[0, Math.ceil(maxValue * 1.1)]} // Add 10% padding to the top
          tick={{ fontSize: 11 }}
          tickLine={{ strokeWidth: 1.5 }}
          axisLine={{ strokeWidth: 1.5 }}
          width={50} // Ensure Y-axis has enough width for labels
        />
        <Tooltip 
          formatter={(value, name) => {
            // Format the value as a number with commas
            return [Number(value).toLocaleString(), name];
          }}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Legend
          verticalAlign="top"
          height={36}
          layout="horizontal"
          align="center"
          wrapperStyle={{
            display: "flex",
            justifyContent: "center",
            paddingTop: "5px"
          }}
        />
        <Line
          type="monotone"
          dataKey={showDailyData ? "dailyAttempts" : "cumulativeAttempts"}
          stroke={CHART_COLORS.LINE.ATTEMPTS}
          activeDot={{ r: 8 }}
          strokeWidth={2}
          name="Attempts"
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey={showDailyData ? "dailyContacts" : "cumulativeContacts"}
          stroke={CHART_COLORS.LINE.CONTACTS}
          activeDot={{ r: 6 }}
          strokeWidth={2}
          name="Contacts"
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey={showDailyData ? "dailyIssues" : "cumulativeIssues"}
          stroke={CHART_COLORS.LINE.ISSUES}
          activeDot={{ r: 6 }}
          strokeWidth={2}
          name="Issues"
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
