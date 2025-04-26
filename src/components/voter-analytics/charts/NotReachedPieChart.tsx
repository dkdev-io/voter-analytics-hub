
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

// Defines the three not reached categories and their color association
const NOT_REACHED_CATEGORIES = [
	{
		name: 'Not Home',
		key: 'notHome',
		color: CHART_COLORS.NOT_REACHED.NOT_HOME
	},
	{
		name: 'Refusal',
		key: 'refusal',
		color: CHART_COLORS.NOT_REACHED.REFUSAL
	},
	{
		name: 'Bad Data',
		key: 'badData',
		color: CHART_COLORS.NOT_REACHED.BAD_DATA
	}
];

interface NotReachedPieChartProps {
	data: Array<{ name: string; value: number | string; color: string }>;
	total: number;
}

export const NotReachedPieChart: React.FC<NotReachedPieChartProps> = ({ data, total }) => {
	const { logDataIssue } = useErrorLogger();
	const { reportPieChartCalculationIssue } = useReportIssue();

	// Always build data to guarantee 3 slices present even if 0
	const normalizedData = NOT_REACHED_CATEGORIES.map(cat => {
		const found = data.find(d => d.name === cat.name);
		return {
			name: cat.name,
			value: found ? Number(found.value) || 0 : 0,
			color: cat.color
		};
	});

	// Calculate the total directly from normalizedData
	const actualTotal = normalizedData.reduce((sum, item) => sum + (Number(item.value) || 0), 0);

	// Add total/percent and ensure all entries are numeric
	const dataWithTotal = normalizedData.map(item => ({
		...item,
		value: Number(item.value) || 0,
		total: actualTotal > 0 ? actualTotal : 1,
		percent: actualTotal > 0 ? ((Number(item.value) / actualTotal) * 100).toFixed(1) : '0.0'
	}));

	useEffect(() => {
		// Diagnostic log for the chart input
		console.log('NotReachedPieChart (CORRECTED) data:', dataWithTotal, 'actualTotal:', actualTotal, 'expected total:', total);
	}, [dataWithTotal, actualTotal, total]);

	// Issue reporting if there's a significant mismatch
	useEffect(() => {
		if (Math.abs(actualTotal - total) > 100) {
			logDataIssue("NotReachedPieChart data issue", {
				receivedData: data,
				calculatedTotal: actualTotal,
				passedTotal: total
			});
			reportPieChartCalculationIssue("Not Reached",
				normalizedData.reduce((acc, item) => ({ ...acc, [item.name]: item.value }), {}),
				data.reduce((acc, item) => ({ ...acc, [item.name]: item.value }), {})
			);
		}
	}, [data, logDataIssue, reportPieChartCalculationIssue, actualTotal, total, normalizedData]);

	// Custom legend that includes percentages and always 3 entries
	const renderLegend = () => (
		<ul className="text-xs flex flex-col items-start mt-2">
			{dataWithTotal.map((entry, idx) => (
				<li key={`legend-item-${entry.name}`} className="flex items-center mb-1">
					<span className="inline-block w-3 h-3 mr-2" style={{ backgroundColor: entry.color }} />
					<span className="whitespace-nowrap">
						{entry.name}: {entry.value.toLocaleString()} ({entry.percent}%)
					</span>
				</li>
			))}
		</ul>
	);

	// If all values are 0, show empty state
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
