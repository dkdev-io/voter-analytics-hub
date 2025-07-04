
import type { QueryParams, VoterMetrics } from '@/types/analytics';
import { filterVoterData } from './filterService';

// Helper function to normalize tactic names for consistent calculation
const normalizeTactic = (tactic: string): string => {
  const normalized = (tactic || '').toLowerCase().trim();
  if (normalized.includes('sms')) return 'sms';
  if (normalized.includes('phone') || normalized.includes('call')) return 'phone';
  if (normalized.includes('canvas') || normalized.includes('knock') || normalized.includes('door')) return 'canvas';
  return normalized || 'unknown';
};

/**
 * Calculates the result value based on filtered data and query type
 */
export const calculateResult = (filteredData: any[], resultType: string | undefined) => {
	if (!filteredData || filteredData.length === 0) {
		return 0;
	}
	// Use slice (not splice) to avoid modifying the original array
	console.log("Sample filtered data for calculation:", filteredData.slice(0, 10));

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
	// Log the data amount we're aggregating
	console.log(`[aggregateVoterMetrics] Processing ${filteredData?.length || 0} records for metrics`);
	
	if (!filteredData || !Array.isArray(filteredData)) {
		filteredData = [];
	}
	
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
	const uniqueDates = [...new Set(filteredData.map(item => item.date))].filter(date => date).sort();
	console.log("[calculationService] Found uniqueDates:", uniqueDates.length, "dates");
	console.log("[calculationService] Sample dates:", uniqueDates.slice(0, 5));

	// Create byDate data structure
	const dateData = uniqueDates.map(date => {
		const dateItems = filteredData.filter(item => item.date === date);
		console.log(`[calculationService] Date ${date} has ${dateItems.length} items`);

		// Ensure numbers and handle nulls/undefined
		const attempts = dateItems.reduce((sum, item) => sum + (Number(item.attempts) || 0), 0);
		const contacts = dateItems.reduce((sum, item) => sum + (Number(item.contacts) || 0), 0);
		
		// "issues" are the sum of not_home, refusal, and bad_data
		const issues = dateItems.reduce((sum, item) => {
			const notHome = Number(item.not_home) || 0;
			const refusal = Number(item.refusal) || 0;
			const badData = Number(item.bad_data) || 0;
			return sum + notHome + refusal + badData;
		}, 0);

		console.log(`[calculationService] Date ${date} totals:`, { attempts, contacts, issues });

		return {
			date,
			attempts,
			contacts,
			issues
		};
	});

	// This logging is important for debugging date issues
	console.log("[calculationService] Date-based data generated:", dateData.length, "entries");
	console.log("[calculationService] Sample date data:", dateData.slice(0, 3));

	metrics.byDate = dateData;

	// Log raw data for debugging
	console.log("[calculationService] First few records:", filteredData.slice(0, 3));

	// Aggregate data - ensure we're parsing string values to numbers with explicit conversion
	filteredData.forEach(item => {
		// Normalize the tactic for consistent aggregation
		const normalizedTactic = normalizeTactic(item.tactic);
		
		// Record the actual tactic for debugging
		console.log(`[calculationService] Normalizing tactic "${item.tactic}" to "${normalizedTactic}"`);
		
		// Aggregate by normalized tactic
		if (normalizedTactic === 'sms') {
			metrics.tactics.sms += Number(item.attempts) || 0;
		} else if (normalizedTactic === 'phone') {
			metrics.tactics.phone += Number(item.attempts) || 0;
		} else if (normalizedTactic === 'canvas') {
			metrics.tactics.canvas += Number(item.attempts) || 0;
		}

		// Aggregate contacts by result - explicit Number conversion for all values
		metrics.contacts.support += Number(item.support) || 0;
		metrics.contacts.oppose += Number(item.oppose) || 0;
		metrics.contacts.undecided += Number(item.undecided) || 0;

		// Debug logging for individual record not_home values
		if (Number(item.not_home) > 0) {
			console.log(`Found not_home value: ${item.not_home} for ${item.first_name} ${item.last_name}`);
		}

		// Actually sum the not reached metrics from filtered data
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
	
	// Log the tactics aggregation for debugging
	console.log("Tactics aggregation details:", {
		sms: metrics.tactics.sms,
		phone: metrics.tactics.phone,
		canvas: metrics.tactics.canvas,
		total: metrics.tactics.sms + metrics.tactics.phone + metrics.tactics.canvas
	});

	// Also log the byDate data to verify it's being processed correctly
	console.log("Final byDate data count:", metrics.byDate.length);
	console.log("Final byDate data sample:", metrics.byDate.slice(0, 3));

	return metrics;
};
