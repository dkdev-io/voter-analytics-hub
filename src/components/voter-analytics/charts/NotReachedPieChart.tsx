
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

interface NotReachedPieChartProps {
	data: Array<{ name: string; value: number; color: string }>;
	total: number;
}

export const NotReachedPieChart: React.FC<NotReachedPieChartProps> = ({ data, total }) => {
	const { logDataIssue } = useErrorLogger();
	const { reportPieChartCalculationIssue } = useReportIssue();
	// Filter out any zero value data points
	const filteredData = data.filter(item => item.value > 0);

	useEffect(() => {
		console.log(filteredData.splice(0, 10));
	}, [filteredData]);

	// Calculate the total directly from the filtered data for consistency
	const calculatedTotal = filteredData.reduce((sum, item) => sum + (Number(item.value) || 0), 0);

	const actualTotal = calculatedTotal > 0 ? calculatedTotal : 1; // Avoid division by zero

	// Add total to each data point for percentage calculation
	const dataWithTotal = filteredData.map(item => {
		const value = Number(item.value) || 0;

		return {
			...item,
			value,
			total: actualTotal,
			percent: actualTotal > 0 ? ((value / actualTotal) * 100).toFixed(1) : '0.0'
		};
	});

	// Only report issues if there's a significant discrepancy
	useEffect(() => {
		if (Math.abs(calculatedTotal - total) > 100) {
			// Log the data issue for debugging
			logDataIssue("NotReachedPieChart data issue", {
				receivedData: data,
				calculatedTotal: calculatedTotal,
				passedTotal: total
			});

			// Report the issue to the issue log
			reportPieChartCalculationIssue("Not Reached",
				data.reduce((acc, item) => ({ ...acc, [item.name]: item.value }), {}), // expected values
				data.reduce((acc, item) => ({ ...acc, [item.name]: item.value }), {}) // actual values
			);
		}
	}, [data, logDataIssue, reportPieChartCalculationIssue, calculatedTotal, total]);

	// Custom legend that includes percentages
	const renderLegend = (props: any) => {
		const { payload } = props;

		if (!payload || payload.length === 0) {
			return <div className="text-xs text-center mt-2">No data available</div>;
		}

		return (
			<ul className="text-xs flex flex-col items-start mt-2">
				{payload.map((entry: any, index: number) => {
					// Find the correct data point with the corrected values
					const matchedItem = dataWithTotal.find(item => item.name === entry.value);

					// If we found a match, use its corrected value, otherwise default to zero
					const value = matchedItem ? matchedItem.value : 0;
					const percentage = actualTotal > 0 ? ((value / actualTotal) * 100).toFixed(1) : '0.0';

					return (
						<li key={`legend-item-${index}`} className="flex items-center mb-1">
							<span
								className="inline-block w-3 h-3 mr-2"
								style={{ backgroundColor: entry.color }}
							/>
							<span className="whitespace-nowrap">
								{entry.value}: {value.toLocaleString()} ({percentage}%)
							</span>
						</li>
					);
				})}
			</ul>
		);
	};

	// If there's no data, show an empty state
	if (filteredData.length === 0) {
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
