import { useState, useEffect } from 'react';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer
} from 'recharts';
import { CHART_COLORS } from '@/types/analytics';
import { format, isValid, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CumulativeLineChartProps {
	data: Array<{
		date: string;
		attempts: number;
		contacts: number;
		issues: number;
	}>;
	onPrintChart?: () => void;
}

export const CumulativeLineChart: React.FC<CumulativeLineChartProps> = ({ data, onPrintChart }) => {
	const [cumulativeData, setCumulativeData] = useState<any[]>([]);
	const [showDailyData, setShowDailyData] = useState(false);

	useEffect(() => {
		// Filter out any data points with invalid dates
		const validData = data.filter(item => {
			// Check if the date is valid
			const isValidDate = item.date && isValid(parseISO(item.date));
			return isValidDate;
		});

		// Sort dates chronologically
		validData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

		// Calculate cumulative values with small random variations to make it look more natural
		let cumulativeAttempts = 0;
		let cumulativeContacts = 0;
		let cumulativeIssues = 0;

		const processed = validData.map(item => {
			// Add the actual values for the current day
			const dailyAttempts = item.attempts || 0;
			const dailyContacts = item.contacts || 0;
			const dailyIssues = item.issues || 0;

			// Add each day's value to the cumulative total
			cumulativeAttempts += dailyAttempts;
			cumulativeContacts += dailyContacts;
			cumulativeIssues += dailyIssues;

			return {
				...item,
				displayDate: format(new Date(item.date), 'MM/dd'),
				cumulativeAttempts,
				cumulativeContacts,
				cumulativeIssues,
				// Include the daily values for potential future use
				dailyAttempts,
				dailyContacts,
				dailyIssues
			};
		});

		setCumulativeData(processed);
	}, [data]);

	// Calculate the maximum value for Y-axis scaling with 10% padding
	const maxValue = cumulativeData.length > 0 ?
		cumulativeData[cumulativeData.length - 1]?.cumulativeAttempts || 0 : 0;

	const maxDailyValue = cumulativeData.length > 0 ?
		Math.max(...cumulativeData.map(item => Math.max(item.dailyAttempts, item.dailyContacts, item.dailyIssues))) : 0;

	// If no data is available, show an empty state
	if (cumulativeData.length === 0) {
		return (
			<div id="cumulative-line-chart" className="mt-8 h-full rounded-lg border border-gray-200 relative flex items-center justify-center">
				<h3 className="text-sm font-bold p-2 text-center absolute top-0 left-0 right-0">Cumulative Progress</h3>
				<p className="text-gray-500 text-center">No data available for the selected filters.</p>
			</div>
		);
	}

	return (
		<div id="cumulative-line-chart" className="mt-8 h-full rounded-lg border border-gray-200 relative pb-5">
			<div className="flex justify-between items-center p-2">
				<h3 className="text-sm font-bold">{showDailyData ? "Daily Activity" : "Cumulative Progress"}</h3>
				<div className="flex items-center space-x-2">
					<Switch
						id="daily-toggle"
						checked={showDailyData}
						onCheckedChange={setShowDailyData}
					/>
					<Label htmlFor="daily-toggle" className="text-xs">Show Daily Data</Label>
				</div>
			</div>
			<ResponsiveContainer width="100%" height="90%">
				<LineChart
					data={cumulativeData}
					margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
				>
					<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
					<XAxis
						dataKey="displayDate"
						interval={0}
						angle={-45}
						textAnchor="end"
						height={60}
						tick={{ fontSize: 9 }}
						tickLine={{ strokeWidth: 1.5 }}
						axisLine={{ strokeWidth: 1.5 }}
					/>
					<YAxis
						domain={[0, Math.ceil((showDailyData ? maxDailyValue : maxValue) * 1.1)]} // Add 10% padding to the top
						tick={{ fontSize: 11 }}
						tickLine={{ strokeWidth: 1.5 }}
						axisLine={{ strokeWidth: 1.5 }}
						width={50} // Ensure Y-axis has enough width for labels
					/>
					<Tooltip />
					<Legend
						verticalAlign="top"
						height={36}
						layout="horizontal"
						align="center"
						wrapperStyle={{
							display: "flex",
							justifyContent: "center",
							paddingTop: "5px"
						}}
					/>
					<Line
						type="monotone"
						dataKey={showDailyData ? "dailyAttempts" : "cumulativeAttempts"}
						stroke={CHART_COLORS.LINE.ATTEMPTS}
						activeDot={{ r: 8 }}
						strokeWidth={2}
						name="Attempts"
					/>
					<Line
						type="monotone"
						dataKey={showDailyData ? "dailyContacts" : "cumulativeContacts"}
						stroke={CHART_COLORS.LINE.CONTACTS}
						activeDot={{ r: 6 }}
						strokeWidth={2}
						name="Contacts"
					/>
					<Line
						type="monotone"
						dataKey={showDailyData ? "dailyIssues" : "cumulativeIssues"}
						stroke={CHART_COLORS.LINE.ISSUES}
						activeDot={{ r: 6 }}
						strokeWidth={2}
						name="Issues"
					/>
				</LineChart>
			</ResponsiveContainer>

			{/* Print Chart Button */}
			{onPrintChart && (
				<div className="absolute bottom-2 right-2 print:hidden">
					<Button
						onClick={onPrintChart}
						variant="outline"
						size="sm"
						className="flex items-center gap-1 text-xs py-1 px-2 h-7"
						aria-label="Print This Chart"
					>
						<Printer className="h-3 w-3" />
						<span>Print This Chart</span>
					</Button>
				</div>
			)}
		</div>
	);
};
