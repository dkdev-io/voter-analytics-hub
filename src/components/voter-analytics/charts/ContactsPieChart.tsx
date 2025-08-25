
import {
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	Tooltip,
	Legend
} from 'recharts';
import { CustomPieTooltip } from './CustomTooltip';

interface ContactsPieChartProps {
	data: Array<{ name: string; value: number; color: string }>;
	total: number;
}

export const ContactsPieChart: React.FC<ContactsPieChartProps> = ({ data, total }) => {
	// Filter out zero value data points and ensure colors
	const filteredData = data.filter(item => item.value > 0).map(item => ({
		...item,
		color: item.color || `hsl(${Math.random() * 360}, 70%, 50%)` // Fallback color
	}));
	const calculatedTotal = filteredData.reduce((sum, item) => sum + Number(item.value || 0), 0);
	const actualTotal = calculatedTotal > 0 ? calculatedTotal : 1; // Avoid division by zero

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
			<div className="h-96 rounded-lg border border-gray-200 flex flex-col">
				<h3 className="text-sm font-bold p-4 text-center border-b">Contact Results</h3>
				<div className="text-center text-sm font-medium py-2">
					Total: 0
				</div>
				<div className="flex-1 flex items-center justify-center">
					<p className="text-gray-500">No contact results available</p>
				</div>
			</div>
		);
	}

	return (
		<div className="h-96 rounded-lg border border-gray-200 flex flex-col">
			<h3 className="text-sm font-bold p-4 text-center border-b">Contact Results</h3>
			<div className="text-center text-sm font-medium py-2">
				Total: {actualTotal.toLocaleString()}
			</div>
			<div className="flex-1 p-2">
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie
							data={dataWithTotal}
							cx="50%"
							cy="45%"
							innerRadius={40}
							outerRadius={70}
							paddingAngle={Math.min(5, Math.max(1, 15 / filteredData.length))}
							dataKey="value"
							labelLine={false}
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
							wrapperStyle={{ paddingTop: '10px', maxHeight: '120px', overflow: 'auto' }}
						/>
					</PieChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
};
