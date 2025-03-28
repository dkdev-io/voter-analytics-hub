
import type { QueryParams, VoterMetrics } from '@/types/analytics';
import { filterVoterData } from './filterService';

/**
 * Calculates the result value based on filtered data and query type
 */
export const calculateResult = (filteredData: any[], resultType: string | undefined) => {
	if (filteredData.length === 0) {
		return 0;
	}
	console.log(filteredData.splice(0, 10));

	// Map the display result type to the actual property name in the data
	let propertyName = resultType ?
		resultType.toLowerCase().replace(/ /g, "_") :
		"attempts";

	// Special handling for specific property names
	if (propertyName === "not_home") {
		propertyName = "not_home";
	} else if (propertyName === "bad_data") {
		propertyName = "bad_data";
	} else if (propertyName === "supporters") {
		propertyName = "support";
	} else if (propertyName === "refused") {
		propertyName = "refusal";
	}

	// Calculate the sum with detailed logging for each record
	let total = 0;

	for (const item of filteredData) {
		const value = Number(item[propertyName as keyof typeof item]) || 0;
		total += value;
	}

	console.log(`Final total for ${resultType} query: ${total}`);
	return total;
};

/**
 * Aggregates voter data into metrics
 */
export const aggregateVoterMetrics = (filteredData: any[]): VoterMetrics => {
	// Initialize metrics structure
	const metrics: VoterMetrics = {
		tactics: {
			sms: 0,
			phone: 0,
			canvas: 0
		},
		contacts: {
			support: 0,
			oppose: 0,
			undecided: 0
		},
		notReached: {
			notHome: 0,
			refusal: 0,
			badData: 0
		},
		teamAttempts: {},
		byDate: []
	};

	// Get unique dates
	const uniqueDates = [...new Set(filteredData.map(item => item.date))].sort();

	// Create byDate data structure
	const dateData = uniqueDates.map(date => {
		const dateItems = filteredData.filter(item => item.date === date);
		const attempts = dateItems.reduce((sum, item) => sum + (Number(item.attempts) || 0), 0);
		const contacts = dateItems.reduce((sum, item) => sum + (Number(item.contacts) || 0), 0);
		// "issues" are the sum of not_home, refusal, and bad_data
		const issues = dateItems.reduce((sum, item) =>
			sum + (Number(item.not_home) || 0) + (Number(item.refusal) || 0) + (Number(item.bad_data) || 0), 0);

		return {
			date,
			attempts,
			contacts,
			issues
		};
	});

	metrics.byDate = dateData;

	// Aggregate data - ensure we're parsing string values to numbers with explicit conversion
	filteredData.forEach(item => {
		// Aggregate by tactic
		if (item.tactic && item.tactic.toLowerCase() === 'sms') {
			metrics.tactics.sms += Number(item.attempts) || 0;
		} else if (item.tactic && item.tactic.toLowerCase() === 'phone') {
			metrics.tactics.phone += Number(item.attempts) || 0;
		} else if (item.tactic && item.tactic.toLowerCase() === 'canvas') {
			metrics.tactics.canvas += Number(item.attempts) || 0;
		}

		// Aggregate contacts by result - explicit Number conversion for all values
		metrics.contacts.support += Number(item.support) || 0;
		metrics.contacts.oppose += Number(item.oppose) || 0;
		metrics.contacts.undecided += Number(item.undecided) || 0;

		// Actually sum the not reached metrics from filtered data
		// instead of using hardcoded values
		metrics.notReached.notHome += Number(item.not_home) || 0;
		metrics.notReached.refusal += Number(item.refusal) || 0;
		metrics.notReached.badData += Number(item.bad_data) || 0;
	});

	// Log the not reached metrics for debugging with detailed breakdown
	console.log("Not Reached aggregation details:", {
		notHome: metrics.notReached.notHome,
		refusal: metrics.notReached.refusal,
		badData: metrics.notReached.badData,
		total: metrics.notReached.notHome + metrics.notReached.refusal + metrics.notReached.badData
	});

	return metrics;
};
