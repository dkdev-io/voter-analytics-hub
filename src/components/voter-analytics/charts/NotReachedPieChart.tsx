
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
  return (
    <div className="h-72 bg-white rounded-lg border border-gray-200 flex flex-col">
      <h3 className="text-sm font-medium p-2 text-center">Not Reached Breakdown</h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
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
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center pb-2 font-semibold">
        Total: {total}
      </div>
    </div>
  );
};
