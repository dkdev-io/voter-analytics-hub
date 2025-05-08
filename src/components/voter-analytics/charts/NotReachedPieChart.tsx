
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { CHART_COLORS } from "@/types/analytics";
import { CustomPieTooltip } from "./CustomTooltip";

interface NotReachedPieChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  total: number;
}

export const NotReachedPieChart: React.FC<NotReachedPieChartProps> = ({
  data,
  total,
}) => {
  console.log("[NotReachedPieChart] Received data:", data);
  console.log("[NotReachedPieChart] Received total:", total);

  // Always show the three categories, even if some values are 0
  const fullData = [
    {
      name: "Not Home",
      value:
        data.find((d) => d.name === "Not Home")?.value ?? 0,
      color: CHART_COLORS.NOT_REACHED.NOT_HOME,
    },
    {
      name: "Refusal",
      value:
        data.find((d) => d.name === "Refusal")?.value ?? 0,
      color: CHART_COLORS.NOT_REACHED.REFUSAL,
    },
    {
      name: "Bad Data",
      value:
        data.find((d) => d.name === "Bad Data")?.value ?? 0,
      color: CHART_COLORS.NOT_REACHED.BAD_DATA,
    },
  ];

  console.log("[NotReachedPieChart] Processed fullData:", fullData);

  // Filter out all-0 data for display check, but always render all for the legend
  const hasData = fullData.some((item) => item.value > 0);
  const sumTotal = fullData.reduce((sum, item) => sum + (item.value || 0), 0) || 0;
  const displayTotal = sumTotal; // the sum is the not reached total

  console.log("[NotReachedPieChart] hasData:", hasData, "sumTotal:", sumTotal);

  // Prepare for percentage display, possibly showing 0%
  const dataWithPercent = fullData.map((item) => ({
    ...item,
    percent:
      displayTotal > 0
        ? ((item.value / displayTotal) * 100).toFixed(1)
        : "0.0",
  }));

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="text-xs flex flex-col items-start mt-2">
        {fullData.map((entry, idx) => (
          <li key={`legend-item-${idx}`} className="flex items-center mb-1">
            <span
              className="inline-block w-3 h-3 mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="whitespace-nowrap">
              {entry.name} - {entry.value.toLocaleString()} ({dataWithPercent[idx].percent}%)
            </span>
          </li>
        ))}
      </ul>
    );
  };

  if (!hasData) {
    return (
      <div className="h-72 rounded-lg border border-gray-200 flex flex-col">
        <h3 className="text-sm font-bold p-2 text-center">Not Reached</h3>
        <div className="text-center text-sm font-medium pb-4">
          Total: 0
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 rounded-lg border border-gray-200 flex flex-col">
      <h3 className="text-sm font-bold p-2 text-center">Not Reached</h3>
      <div className="text-center text-sm font-medium pb-4">
        Total: {displayTotal.toLocaleString()}
      </div>
      <div className="flex-1 py-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={fullData}
              cx="50%"
              cy="45%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={5}
              dataKey="value"
              startAngle={90}
              endAngle={450}
            >
              {fullData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
            <Legend content={renderLegend} layout="horizontal" align="center" verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
