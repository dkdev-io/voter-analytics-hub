
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

// Standard Not Reached categories, mapping labels to metric keys
const NOT_REACHED_CATEGORIES = [
	{ name: 'Not Home', key: 'notHome', color: CHART_COLORS.NOT_REACHED.NOT_HOME },
	{ name: 'Refusal', key: 'refusal', color: CHART_COLORS.NOT_REACHED.REFUSAL },
	{ name: 'Bad Data', key: 'badData', color: CHART_COLORS.NOT_REACHED.BAD_DATA }
];

interface NotReachedPieChartProps {
	data: Array<{ name: string; value: number; color: string }>;
	total: number;
}

export const NotReachedPieChart: React.FC<NotReachedPieChartProps> = ({ data, total }) => {
	// Find value for each mandatory category
	const normalizedData = NOT_REACHED_CATEGORIES.map(cat => {
		const found = data.find(d => d.name === cat.name);
		return {
			name: cat.name,
			value: found ? Number(found.value) || 0 : 0,
			color: cat.color
		};
	});

	const calculatedTotal = normalizedData.reduce((sum, item) => sum + item.value, 0);
	const actualTotal = calculatedTotal > 0 ? calculatedTotal : 0;

	// For chart, always include all slices, even if 0
	const dataWithTotal = normalizedData.map(item => ({
		...item,
		percent: actualTotal > 0 ? ((item.value / actualTotal) * 100).toFixed(1) : '0.0'
	}));

	// Custom legend
	const renderLegend = (props: any) => {
		const { payload } = props;
		return (
			<ul className="text-xs flex flex-col items-start mt-2">
				{dataWithTotal.map((item, index) => (
					<li key={`legend-item-${index}`} className="flex items-center mb-1">
						<span className="inline-block w-3 h-3 mr-2" style={{ backgroundColor: item.color }} />
						<span className="whitespace-nowrap">{item.name}: {item.value.toLocaleString()} ({item.percent}%)</span>
					</li>
				))}
			</ul>
		);
	};

	if (actualTotal === 0) {
		return (
			<div className="h-72 rounded-lg border border-gray-200 flex flex-col">
				<div className="flex justify-between items-center p-2">
					<h3 className="text-sm font-bold w-full text-center">Not Reached</h3>
				</div>
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
			<div className="flex justify-between items-center p-2">
				<h3 className="text-sm font-bold w-full text-center">Not Reached</h3>
			</div>
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
							{dataWithTotal.map((entry, idx) => (
								<Cell key={`cell-${idx}`} fill={entry.color} />
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
