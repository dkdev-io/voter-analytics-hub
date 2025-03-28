
import { getTestData } from './migrationService';
import { supabase } from '@/integrations/supabase/client';

// Function to fetch all available tactics from the test data
export const fetchTactics = async (): Promise<string[]> => {
	try {

		// Try to fetch directly from Supabase first
		const { data: tacticsData, error } = await supabase
			.from('voter_contacts')
			.select('tactic')
			.limit(1000);

		if (error) {
			throw error;
		}

		if (tacticsData && tacticsData.length > 0) {
			// Extract unique tactics from the database result
			const tactics = [...new Set(tacticsData.map(item => item.tactic))].filter(Boolean).sort();
			return tactics;
		}

		// Return empty array if no data is found - no fallbacks
		return [];
	} catch (error) {
		console.error("Error fetching tactics:", error);
		// Return empty array instead of fallbacks
		return [];
	}
};

// Function to fetch all available teams from the test data
export const fetchTeams = async (): Promise<string[]> => {
	try {

		// Try to fetch directly from Supabase first
		const { data: teamsData, error } = await supabase
			.from('voter_contacts')
			.select('team')
			.limit(1000);

		if (error) {
			throw error;
		}

		if (teamsData && teamsData.length > 0) {
			// Extract unique teams from the database result
			const teams = [...new Set(teamsData.map(item => item.team).filter(Boolean))];

			return teams.sort();
		}

		// Return empty array if no data is found - no fallbacks
		return [];
	} catch (error) {
		console.error("Error fetching teams:", error);
		// Return empty array instead of fallbacks
		return [];
	}
};

// Function to fetch people by team
export const fetchPeopleByTeam = async (team: string): Promise<string[]> => {
	try {

		// Try to fetch directly from Supabase first
		const { data: peopleData, error } = await supabase
			.from('voter_contacts')
			.select('first_name, last_name')
			.eq('team', team)
			.limit(1000);

		if (error) {
			throw error;
		}

		if (peopleData && peopleData.length > 0) {
			// Map to full names and get unique entries
			const peopleInTeam = peopleData
				.map(item => {
					if (!item.first_name || !item.last_name) {
						return null;
					}
					return `${item.first_name} ${item.last_name}`;
				})
				.filter(Boolean) as string[];

			// Get unique people (in case there are duplicates)
			const uniquePeople = [...new Set(peopleInTeam)].sort();
			return uniquePeople;
		}

		// Return empty array if no data is found - no fallbacks
		return [];
	} catch (error) {
		console.error(`Error fetching people for team ${team}:`, error);
		// Return empty array instead of fallbacks
		return [];
	}
};

// Function to fetch all people
export const fetchAllPeople = async (): Promise<string[]> => {
	try {

		// Try to fetch directly from Supabase first
		const { data: peopleData, error } = await supabase
			.from('voter_contacts')
			.select('first_name, last_name')
			.limit(1000);

		if (error) {
			throw error;
		}

		if (peopleData && peopleData.length > 0) {
			// Map to full names and get unique entries
			const allPeople = peopleData
				.map(item => {
					if (!item.first_name || !item.last_name) {
						console.warn("Missing name data:", item);
						return null;
					}
					return `${item.first_name} ${item.last_name}`;
				})
				.filter(Boolean) as string[];

			// Make sure we get unique names only and sort them
			const uniquePeople = [...new Set(allPeople)].sort();
			return uniquePeople;
		}

		// Return empty array if no data is found - no fallbacks
		return [];
	} catch (error) {
		console.error("Error fetching all people:", error);
		// Return empty array instead of fallbacks
		return [];
	}
};

// Function to fetch all available dates from the test data
export const fetchDates = async (): Promise<string[]> => {
	try {

		// Try to fetch directly from Supabase first
		const { data: datesData, error } = await supabase
			.from('voter_contacts')
			.select('date')
			.limit(1000);

		if (error) {
			throw error;
		}

		if (datesData && datesData.length > 0) {
			// Extract unique dates from the database result and sort chronologically
			const dates = [...new Set(datesData.map(item => item.date).filter(Boolean))].sort((a, b) => {
				return new Date(a).getTime() - new Date(b).getTime();
			});

			return dates;
		}

		// Return empty array if no data is found - no fallbacks
		return [];
	} catch (error) {
		console.error("Error fetching dates:", error);
		// Return empty array instead of fallbacks
		return [];
	}
};
