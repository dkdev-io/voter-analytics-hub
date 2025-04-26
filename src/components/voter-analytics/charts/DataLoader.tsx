
import { useState, useEffect } from "react";
import {
	type VoterMetrics,
	type QueryParams,
	CHART_COLORS,
} from "@/types/analytics";
import { fetchVoterMetrics } from "@/lib/voter-data";
import { isValid, parseISO } from "date-fns";

interface UseDataLoaderProps {
	query: Partial<QueryParams>;
	showFilteredData: boolean;
}

export const useDataLoader = ({
	query,
	showFilteredData,
}: UseDataLoaderProps) => {
	const [tacticsData, setTacticsData] = useState<any[]>([]);
	const [contactsData, setContactsData] = useState<any[]>([]);
	const [notReachedData, setNotReachedData] = useState<any[]>([]);
	const [lineChartData, setLineChartData] = useState<any[]>([]);
	const [totalAttempts, setTotalAttempts] = useState(0);
	const [totalContacts, setTotalContacts] = useState(0);
	const [totalNotReached, setTotalNotReached] = useState(0);
	const [loading, setLoading] = useState(true);
	const [datasetName, setDatasetName] = useState<string>("");
	const [debugNotHome, setDebugNotHome] = useState<number | null>(null);
	const [debugRawRows, setDebugRawRows] = useState<any[]>([]);

	useEffect(() => {
		console.log("DataLoader state:", {
			query,
			showFilteredData,
		});
	}, [query, showFilteredData]);

	const safeQuery = query || {};

	useEffect(() => {
		let isMounted = true;

		const loadChartData = async () => {
			try {
				setLoading(true);
				const shouldFilter = showFilteredData || query.person || query.tactic;

				// ---- Fetch raw data for debugging ----
				let rawData: any[] = [];
				try {
					const { fetchVoterMetrics: fetchVM, getTestData } = await import("@/lib/voter-data");
					rawData = await getTestData();
					console.log("[DEBUG] Raw Supabase data sample (first 5):", rawData.slice(0, 5));
					const notHomeSum = rawData.reduce((sum, r) => sum + (Number(r.not_home) || 0), 0);
					console.log("[DEBUG] Sum of not_home in all records:", notHomeSum);
					if (isMounted) {
						setDebugNotHome(notHomeSum);
						setDebugRawRows(rawData.slice(0, 5));
					}
				} catch (e) {
					console.error("[DEBUG] Could not log raw Supabase data", e);
				}

				const metrics = await fetchVoterMetrics(
					shouldFilter ? query : undefined,
				);
				console.log("[DEBUG] Aggregated metrics.notReached:", metrics.notReached);

				let totalContactsValue =
					(metrics.contacts.support || 0) + (metrics.contacts.oppose || 0) + (metrics.contacts.undecided || 0);
				const contactsChartData = [
					{
						name: "Support",
						value: metrics.contacts.support || 0,
						color: CHART_COLORS.CONTACT.SUPPORT,
					},
					{
						name: "Oppose",
						value: metrics.contacts.oppose || 0,
						color: CHART_COLORS.CONTACT.OPPOSE,
					},
					{
						name: "Undecided",
						value: metrics.contacts.undecided || 0,
						color: CHART_COLORS.CONTACT.UNDECIDED,
					},
				];
				const tacticsChartData = [
					{
						name: "SMS",
						value: metrics.tactics.sms || 0,
						color: CHART_COLORS.TACTIC.SMS,
					},
					{
						name: "Phone",
						value: metrics.tactics.phone || 0,
						color: CHART_COLORS.TACTIC.PHONE,
					},
					{
						name: "Canvas",
						value: metrics.tactics.canvas || 0,
						color: CHART_COLORS.TACTIC.CANVAS,
					},
				];

				// ---- FIX: Directly aggregate Not Reached from rawData to avoid key mapping bug ----
				// Instead of relying on metrics.notReached, directly sum the rawData for each 
				// For the three pie segments, get the actual db fields
				const notHomeValue = rawData.reduce((sum, r) => sum + (Number(r.not_home) || 0), 0);
				const refusalValue = rawData.reduce((sum, r) => sum + (Number(r.refusal) || 0), 0);
				const badDataValue = rawData.reduce((sum, r) => sum + (Number(r.bad_data) || 0), 0);

				const totalNotReachedValue = notHomeValue + refusalValue + badDataValue;

				const notReachedChartData = [
					{
						name: "Not Home",
						value: notHomeValue,
						color: CHART_COLORS.NOT_REACHED.NOT_HOME,
					},
					{
						name: "Refusal",
						value: refusalValue,
						color: CHART_COLORS.NOT_REACHED.REFUSAL,
					},
					{
						name: "Bad Data",
						value: badDataValue,
						color: CHART_COLORS.NOT_REACHED.BAD_DATA,
					},
				];

				const totalTactics = tacticsChartData.reduce((sum, item) => sum + item.value, 0);
				totalContactsValue = contactsChartData.reduce((sum, item) => sum + item.value, 0);

				const validatedLineData = (metrics.byDate || [])
					.filter((item) => item.date && isValid(parseISO(item.date)))
					.map((item) => ({
						...item,
						attempts: item.attempts || 0,
						contacts: item.contacts || 0,
						issues: item.issues || 0,
					}));

				validatedLineData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

				const datasetNameValue = query.team
					? `${query.team} Team Dataset`
					: query.person
					? `${query.person}'s Dataset`
					: "Voter Contacts Dataset";

				setTacticsData(tacticsChartData);
				setContactsData(contactsChartData);
				setNotReachedData(notReachedChartData);
				setLineChartData(validatedLineData);
				setTotalAttempts(totalTactics);
				setTotalContacts(totalContactsValue);
				setTotalNotReached(totalNotReachedValue);
				setDatasetName(datasetNameValue);
			} catch (error) {
				console.error("Error loading chart data:", error);
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		loadChartData();

		return () => {
			isMounted = false;
		};
	}, [safeQuery, showFilteredData]);

	return {
		tacticsData,
		contactsData,
		notReachedData,
		lineChartData,
		totalAttempts,
		totalContacts,
		totalNotReached,
		loading,
		datasetName,
		debugNotHome,
		debugRawRows
	};
};
