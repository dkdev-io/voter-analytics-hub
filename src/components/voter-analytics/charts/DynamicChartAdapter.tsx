import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
} from 'recharts';
import {
  generateAdaptiveChartConfig,
  generateCategoricalChartConfig,
  type DynamicChartConfig,
  type ChartDataPoint
} from '@/services/dynamicChartService';
import { CustomPieTooltip } from './CustomTooltip';

interface DynamicChartAdapterProps {
  data: Record<string, unknown>[];
  title?: string;
  primaryField?: string;
  valueField?: string;
  chartType?: 'pie' | 'bar' | 'line' | 'scatter' | 'auto';
  categoryType?: 'tactics' | 'contacts' | 'notReached' | 'teams' | 'general';
  theme?: 'light' | 'dark';
  height?: number;
  groupBy?: string;
  aggregationType?: 'sum' | 'count' | 'average';
}

export const DynamicChartAdapter: React.FC<DynamicChartAdapterProps> = ({
  data,
  title = 'Dynamic Chart',
  primaryField,
  valueField = 'attempts',
  chartType = 'auto',
  categoryType = 'general',
  theme = 'light',
  height = 400,
  groupBy,
  aggregationType = 'sum'
}) => {
  // Generate chart configuration based on data
  const getChartConfig = (): DynamicChartConfig => {
    if (!data || data.length === 0) {
      return {
        data: [],
        total: 0,
        categories: [],
        colorMap: {},
        chartType: 'pie'
      };
    }

    // If groupBy is specified, aggregate data first
    let processedData = data;
    if (groupBy && data.length > 0 && groupBy in data[0]) {
      const groups: Record<string, Record<string, unknown>[]> = {};
      
      data.forEach(item => {
        const groupValue = String(item[groupBy] || 'Unknown');
        if (!groups[groupValue]) {
          groups[groupValue] = [];
        }
        groups[groupValue].push(item);
      });

      processedData = Object.keys(groups).map(groupKey => {
        const groupItems = groups[groupKey];
        let aggregatedValue = 0;

        switch (aggregationType) {
          case 'sum':
            aggregatedValue = groupItems.reduce((sum, item) => sum + (Number(item[valueField]) || 0), 0);
            break;
          case 'count':
            aggregatedValue = groupItems.length;
            break;
          case 'average':
            const sum = groupItems.reduce((s, item) => s + (Number(item[valueField]) || 0), 0);
            aggregatedValue = groupItems.length > 0 ? sum / groupItems.length : 0;
            break;
        }

        return {
          [groupBy]: groupKey,
          [valueField]: aggregatedValue,
          name: groupKey,
          value: aggregatedValue
        };
      });
    }

    if (primaryField && chartType !== 'auto') {
      return generateCategoricalChartConfig(
        processedData, 
        primaryField, 
        valueField, 
        categoryType, 
        theme
      );
    }

    // Use adaptive configuration
    const config = generateAdaptiveChartConfig(processedData, primaryField, valueField, theme);
    
    // Override chart type if specified
    if (chartType !== 'auto') {
      config.chartType = chartType;
    }

    return config;
  };

  const chartConfig = getChartConfig();

  // Custom legend renderer with percentages
  const renderLegend = (props: any) => {
    const { payload } = props;

    if (!payload || payload.length === 0) {
      return <div className="text-xs text-center mt-2">No data available</div>;
    }

    return (
      <ul className="text-xs flex flex-col items-start mt-2 max-h-32 overflow-y-auto">
        {payload.map((entry: any, index: number) => (
          <li key={`legend-item-${index}`} className="flex items-center mb-1">
            <span
              className="inline-block w-3 h-3 mr-2 rounded-sm flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="whitespace-nowrap text-xs">
              {entry.value} - {entry.payload?.value?.toLocaleString() || 0}
              {chartConfig.total > 0 && (
                <span className="text-gray-500 ml-1">
                  ({(((entry.payload?.value || 0) / chartConfig.total) * 100).toFixed(1)}%)
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  // Render empty state
  if (!chartConfig.data || chartConfig.data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 flex flex-col" style={{ height }}>
        <h3 className="text-sm font-bold p-4 text-center border-b">{title}</h3>
        <div className="text-center text-sm font-medium py-2">
          Total: 0
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  // Render pie chart
  if (chartConfig.chartType === 'pie') {
    return (
      <div className="rounded-lg border border-gray-200 flex flex-col" style={{ height }}>
        <h3 className="text-sm font-bold p-4 text-center border-b">{title}</h3>
        <div className="text-center text-sm font-medium py-2">
          Total: {chartConfig.total.toLocaleString()}
        </div>
        <div className="flex-1 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartConfig.data}
                cx="50%"
                cy="45%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {chartConfig.data.map((entry, index) => (
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
  }

  // Render bar chart
  if (chartConfig.chartType === 'bar') {
    return (
      <div className="rounded-lg border border-gray-200 flex flex-col" style={{ height }}>
        <h3 className="text-sm font-bold p-4 text-center border-b">{title}</h3>
        <div className="text-center text-sm font-medium py-2">
          Total: {chartConfig.total.toLocaleString()}
        </div>
        <div className="flex-1 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartConfig.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value">
                {chartConfig.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // Render line chart
  if (chartConfig.chartType === 'line') {
    return (
      <div className="rounded-lg border border-gray-200 flex flex-col" style={{ height }}>
        <h3 className="text-sm font-bold p-4 text-center border-b">{title}</h3>
        <div className="text-center text-sm font-medium py-2">
          Data Points: {chartConfig.data.length}
        </div>
        <div className="flex-1 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartConfig.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              {chartConfig.categories.map((category, index) => (
                <Line
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stroke={chartConfig.colorMap[category] || `hsl(${index * 60}, 70%, 50%)`}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // Render scatter chart
  if (chartConfig.chartType === 'scatter') {
    return (
      <div className="rounded-lg border border-gray-200 flex flex-col" style={{ height }}>
        <h3 className="text-sm font-bold p-4 text-center border-b">{title}</h3>
        <div className="text-center text-sm font-medium py-2">
          Data Points: {chartConfig.data.length}
        </div>
        <div className="flex-1 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={chartConfig.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Scatter dataKey="value" fill={chartConfig.colorMap[chartConfig.categories[0]] || '#8884d8'} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // Fallback to pie chart
  return (
    <div className="rounded-lg border border-gray-200 flex flex-col" style={{ height }}>
      <h3 className="text-sm font-bold p-4 text-center border-b">{title}</h3>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Unsupported chart type</p>
      </div>
    </div>
  );
};