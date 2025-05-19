
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

interface TacticsPieChartProps {
	data: Array<{ name: string; value: number; color: string }>;
	total: number;
}

export const TacticsPieChart: React.FC<TacticsPieChartProps> = ({ data, total }) => {
	console.log("TacticsPieChart received data:", data);
	console.log("TacticsPieChart received total:", total);
	
	// Filter out zero value data points
	const filteredData = (data || []).filter(item => item && Number(item.value) > 0);
	const calculatedTotal = filteredData.reduce((sum, item) => sum + Number(item.value || 0), 0);
	const actualTotal = calculatedTotal > 0 ? calculatedTotal : 1; // Avoid division by zero

	console.log("TacticsPieChart filtered data:", filteredData);
	console.log("TacticsPieChart calculated total:", calculatedTotal);

	// Add total to each data point for percentage calculation
	const dataWithTotal = filteredData.map(item => ({
		...item,
		total: actualTotal,
		percent: ((item.value / actualTotal) * 100).toFixed(1)
	}));

	// Custom legend that includes percentages
	const renderLegend = (props: any) => {
		const { payload } = props;

		if (!payload || payload.length === 0) {
			return <div className="text-xs text-center mt-2">No data available</div>;
		}

		return (
			<ul className="text-xs flex flex-col items-start mt-2">
				{payload.map((entry: any, index: number) => (
					<li key={`legend-item-${index}`} className="flex items-center mb-1">
						<span
							className="inline-block w-3 h-3 mr-2"
							style={{ backgroundColor: entry.color }}
						/>
						<span className="whitespace-nowrap">{entry.value} - {entry.payload.value.toLocaleString()} ({((entry.payload.value / actualTotal) * 100).toFixed(1)}%)</span>
					</li>
				))}
			</ul>
		);
	};

	// If there's no data, show an empty state
	if (filteredData.length === 0) {
		return (
			<div className="h-72 bg-white rounded-lg border border-gray-200 flex flex-col">
				<h3 className="text-sm font-bold p-2 text-center">Attempts</h3>
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
			<h3 className="text-sm font-bold p-2 text-center">Attempts</h3>
			<div className="text-center text-sm font-medium pb-4">
				Total: {actualTotal.toLocaleString()}
			</div>
			<div className="flex-1 py-2">
				<ResponsiveContainer className='py-2' width="100%" height="100%">
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
							{dataWithTotal.map((entry, index) => (
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
