
// This file contains functions for importing and migrating voter data into Supabase
import { supabase } from '@/integrations/supabase/client';

// Type for voter contact data
export interface VoterContactRow {
	id?: number;
	first_name: string;
	last_name: string;
	team: string;
	date: string;
	tactic: string;
	attempts: number;
	contacts: number;
	not_home: number;
	refusal: number;
	bad_data: number;
	support: number;
	oppose: number;
	undecided: number;
	user_id?: string | null;
	user_email?: string | null;
	label?: string | null;
}

// Return value for the migration function
interface MigrationResult {
	success: boolean;
	message: string;
}

// Function to get test voter data from Supabase
export const getTestData = async (): Promise<VoterContactRow[]> => {
	try {

		// Get the current user's ID and email
		const { data: sessionData } = await supabase.auth.getSession();
		const userId = sessionData.session?.user.id;

		let query = supabase
			.from('voter_contacts')
			.select('*')
			.limit(1000);

		// If user is logged in, fetch ONLY their data (no more mixing with system data)
		if (userId) {
			query = query.eq('user_id', userId);
		}

		const { data, error } = await query;

		if (error) {
			console.error("Error fetching voter data from Supabase:", error);
			return [];
		}

		if (!data || data.length === 0) {
			return [];
		}


		return data as VoterContactRow[];
	} catch (error) {
		console.error("Error in getTestData:", error);
		return [];
	}
};

// Function to check Supabase connection and create/migrate data
export const migrateTestDataToSupabase = async (forceRefresh = false): Promise<MigrationResult> => {
	try {

		// First, check if we can connect to Supabase
		const { data: testData, error: testError } = await supabase
			.from('voter_contacts')
			.select('*')
			.limit(1);

		if (testError && testError.code !== 'PGRST116') {
			// If it's not just an empty result error
			console.error("Supabase connection test failed:", testError);
			return {
				success: false,
				message: `Failed to connect to Supabase: ${testError.message}`
			};
		}


		// Get the current user's ID
		const { data: sessionData } = await supabase.auth.getSession();
		const userId = sessionData.session?.user.id;

		// Check if we have data in the table for this specific user
		const { count, error: countError } = await supabase
			.from('voter_contacts')
			.select('*', { count: 'exact', head: true })
			// Only check for the current user's data
			.eq('user_id', userId || '');

		if (countError) {
			console.error("Error checking data count:", countError);
			return {
				success: false,
				message: `Error checking data: ${countError.message}`
			};
		}

		if (count && count > 0 && !forceRefresh) {
			return {
				success: true,
				message: `Connected to Supabase. Found ${count} existing records.`
			};
		} else {
			return {
				success: true,
				message: "Connected to Supabase, but no data found for your account. Use the CSV upload or data import features."
			};
		}
	} catch (error: any) {
		console.error("Error in migrateTestDataToSupabase:", error);
		return {
			success: false,
			message: `Error connecting to Supabase: ${error.message}`
		};
	}
};
