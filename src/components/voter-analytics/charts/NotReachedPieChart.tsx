
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
	// Always show all slices.
	const categories = [
		{ name: 'Not Home', color: CHART_COLORS.NOT_REACHED.NOT_HOME },
		{ name: 'Refusal', color: CHART_COLORS.NOT_REACHED.REFUSAL },
		{ name: 'Bad Data', color: CHART_COLORS.NOT_REACHED.BAD_DATA }
	];

	// Map category labels to the passed-in data, filling in zero if not present
	const displayData = categories.map(cat => {
		const found = data.find(item => item.name === cat.name);
		return {
			name: cat.name,
			value: found ? Number(found.value) || 0 : 0,
			color: cat.color
		};
	});

	const actualTotal = displayData.reduce((sum, item) => sum + Number(item.value || 0), 0);

	const dataWithTotal = displayData.map(item => ({
		...item,
		total: actualTotal,
		percent: actualTotal > 0 ? ((item.value / actualTotal) * 100).toFixed(1) : "0.0"
	}));

	const renderLegend = (props: any) => {
		const { payload } = props;
		if (!payload || payload.length === 0) {
			return <div className="text-xs text-center mt-2">No data available</div>;
		}
		return (
			<ul className="text-xs flex flex-col items-start mt-2">
				{dataWithTotal.map((item, index) => (
					<li key={`legend-item-${index}`} className="flex items-center mb-1">
						<span
							className="inline-block w-3 h-3 mr-2"
							style={{ backgroundColor: item.color }}
						/>
						<span className="whitespace-nowrap">
							{item.name}: {item.value.toLocaleString()} ({item.percent}%)
						</span>
					</li>
				))}
			</ul>
		);
	};

	if (actualTotal === 0) {
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
