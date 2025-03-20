
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

interface TeamsPieChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  total: number;
}

export const TeamsPieChart: React.FC<TeamsPieChartProps> = ({ data, total }) => {
  // Add total to each data point for percentage calculation
  const dataWithTotal = data.map(item => ({
    ...item,
    total,
    percent: ((item.value / total) * 100).toFixed(1)
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
            <span>{entry.value} - {entry.payload.value} ({((entry.payload.value / total) * 100).toFixed(1)}%)</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="h-72 bg-white rounded-lg border border-gray-200 flex flex-col">
      <h3 className="text-sm font-bold p-2 text-center">Team Attempts</h3>
      <div className="text-center text-sm font-medium pb-1">
        Total: {total}
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
