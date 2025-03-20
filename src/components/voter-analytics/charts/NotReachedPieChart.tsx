
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

interface NotReachedPieChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  total: number;
}

export const NotReachedPieChart: React.FC<NotReachedPieChartProps> = ({ data, total }) => {
  // Calculate the total directly from the data to ensure accuracy
  const calculatedTotal = data.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  
  // Use calculated total rather than the passed total which might be incorrect
  const actualTotal = calculatedTotal > 0 ? calculatedTotal : total;
  
  // Log data for debugging
  console.log('NotReachedPieChart data:', data);
  console.log('NotReachedPieChart calculated total:', calculatedTotal);
  console.log('NotReachedPieChart passed total:', total);
  
  // Add total to each data point for percentage calculation
  const dataWithTotal = data.map(item => ({
    ...item,
    value: Number(item.value) || 0, // Make sure this is a number
    total: actualTotal,
    percent: actualTotal > 0 ? ((Number(item.value) / actualTotal) * 100).toFixed(1) : '0.0'
  }));

  // Custom legend that includes percentages
  const renderLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <ul className="text-xs flex flex-col items-start mt-2">
        {payload.map((entry: any, index: number) => (
          <li key={`legend-item-${index}`} className="flex items-center mb-1">
            <span
              className="inline-block w-3 h-3 mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="whitespace-nowrap">
              {entry.value}: {Number(entry.payload.value).toLocaleString()} 
              ({actualTotal > 0 ? ((entry.payload.value / actualTotal) * 100).toFixed(1) : '0.0'}%)
            </span>
          </li>
        ))}
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
