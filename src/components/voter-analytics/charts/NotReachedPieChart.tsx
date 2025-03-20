
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { CHART_COLORS } from '@/types/analytics';
import { CustomPieTooltip } from './CustomTooltip';
import { useErrorLogger } from '@/hooks/useErrorLogger';
import { useReportIssue } from '@/lib/issue-log/useReportIssue';
import { useEffect } from 'react';

interface NotReachedPieChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  total: number;
}

export const NotReachedPieChart: React.FC<NotReachedPieChartProps> = ({ data, total }) => {
  const { logDataIssue } = useErrorLogger();
  const { reportPieChartCalculationIssue } = useReportIssue();
  
  // Calculate the total directly from the data to ensure accuracy
  const calculatedTotal = data.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  
  // Use calculated total rather than the passed total which might be incorrect
  const actualTotal = calculatedTotal > 0 ? calculatedTotal : total;
  
  // Enhanced logging to diagnose the issue
  console.log('NotReachedPieChart data with types:', data.map(item => ({
    name: item.name,
    value: item.value,
    valueType: typeof item.value,
    color: item.color
  })));
  console.log('NotReachedPieChart calculated total:', calculatedTotal);
  console.log('NotReachedPieChart passed total:', total);
  
  // Add total to each data point for percentage calculation
  const dataWithTotal = data.map(item => ({
    ...item,
    value: Number(item.value) || 0, // Make sure this is a number
    total: actualTotal,
    percent: actualTotal > 0 ? ((Number(item.value) / actualTotal) * 100).toFixed(1) : '0.0'
  }));

  // Report issue if there's a suspected data mismatch
  useEffect(() => {
    // Check if there's a data issue: Not Home should be the first item with value 561
    const expectedValues = {
      "Not Home": 561,
      "Refusal": 0,
      "Bad Data": 0
    };
    
    const actualValues = {
      "Not Home": data.find(item => item.name === "Not Home")?.value || 0,
      "Refusal": data.find(item => item.name === "Refusal")?.value || 0, 
      "Bad Data": data.find(item => item.name === "Bad Data")?.value || 0
    };
    
    const hasIssue = actualValues["Not Home"] !== expectedValues["Not Home"] || 
                     actualValues["Refusal"] !== expectedValues["Refusal"];
    
    if (hasIssue) {
      // Log the data issue for debugging
      logDataIssue("NotReachedPieChart data mismatch", {
        expectedValues,
        actualValues,
        rawData: data
      });
      
      // Report the issue to the issue log
      reportPieChartCalculationIssue("Not Reached", expectedValues, actualValues);
    }
  }, [data, logDataIssue, reportPieChartCalculationIssue]);

  // Custom legend that includes percentages
  const renderLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <ul className="text-xs flex flex-col items-start mt-2">
        {payload.map((entry: any, index: number) => {
          // Find the correct data point by matching names
          const matchedItem = data.find(item => item.name === entry.value);
          
          // If we found a match, use its value, otherwise default to zero
          const value = matchedItem ? matchedItem.value : 0;
          const percentage = actualTotal > 0 ? ((value / actualTotal) * 100).toFixed(1) : '0.0';
          
          return (
            <li key={`legend-item-${index}`} className="flex items-center mb-1">
              <span
                className="inline-block w-3 h-3 mr-2"
                style={{ backgroundColor: entry.color }}
              />
              <span className="whitespace-nowrap">
                {entry.value}: {value.toLocaleString()} 
                ({percentage}%)
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="h-72 bg-white rounded-lg border border-gray-200 flex flex-col">
      <div className="flex justify-between items-center p-2">
        <h3 className="text-sm font-bold">Not Reached</h3>
      </div>
      <div className="text-center text-sm font-medium pb-3">
        Total: {actualTotal.toLocaleString()}
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataWithTotal}
              cx="50%"
              cy="45%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={5}
              dataKey="value"
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
            <Legend 
              content={renderLegend}
              layout="horizontal"
              align="center"
              verticalAlign="bottom"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
