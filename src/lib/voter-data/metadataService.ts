import { getTestData } from './migrationService';
import { supabase } from '@/integrations/supabase/client';

// Function to normalize tactic name for consistency
const normalizeTacticName = (tactic: string): string => {
	const normalizedTactic = String(tactic || '').trim().toLowerCase();
	
	// Standardize common variations
	if (/sms|text/i.test(normalizedTactic)) return 'SMS';
	if (/phone|call/i.test(normalizedTactic)) return 'Phone';
	if (/canvas|door|knock/i.test(normalizedTactic)) return 'Canvas';
	
	// If it doesn't match any standard categories, return as-is but properly capitalized
	return normalizedTactic.charAt(0).toUpperCase() + normalizedTactic.slice(1) || 'Unknown';
};

// Function to check if a string is a standard team name
const isStandardTeam = (team: string): boolean => {
	const standardTeams = ['Team Tony', 'Local Party', 'Candidate'];
	return standardTeams.includes(team);
};

// Function to normalize team name for consistency
const normalizeTeamName = (team: string): string => {
	const normalizedTeam = String(team || '').trim();
	
	// Standardize common variations
	if (/tony/i.test(normalizedTeam)) return 'Team Tony';
	if (/local|party/i.test(normalizedTeam)) return 'Local Party';
	if (/candidate/i.test(normalizedTeam)) return 'Candidate';
	
	return normalizedTeam || 'Unknown Team';
};

// Format a person's name from first and last name
const formatPersonName = (firstName: string, lastName: string): string => {
	// Handle null/undefined values
	const first = firstName || '';
	const last = lastName || '';
	
	// If both values are empty, return empty string
	if (!first && !last) return '';
	
	// Return properly formatted name
	return `${first} ${last}`.trim();
};

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
			// Extract unique tactics from the database result and normalize them
			let tactics = [...new Set(
				tacticsData
					.map(item => normalizeTacticName(item.tactic))
					.filter(Boolean)
			)];
			
			// Make sure standard tactics are always included
			const standardTactics = ['SMS', 'Phone', 'Canvas'];
			standardTactics.forEach(tactic => {
				if (!tactics.includes(tactic)) {
					tactics.push(tactic);
				}
			});
			
			tactics.sort();
			console.log("Fetched normalized tactics:", tactics);
			return tactics;
		}

		// Return default tactics if no data is found
		return ['SMS', 'Phone', 'Canvas'];
	} catch (error) {
		console.error("Error fetching tactics:", error);
		// Return default tactics on error
		return ['SMS', 'Phone', 'Canvas'];
	}
};

// Function to fetch all available teams from the test data - ONLY standard teams
export const fetchTeams = async (): Promise<string[]> => {
	try {
		// Always return only the standard teams
		const standardTeams = ['Team Tony', 'Local Party', 'Candidate'];
		return standardTeams;
	} catch (error) {
		console.error("Error fetching teams:", error);
		// Return default teams on error
		return ['Team Tony', 'Local Party', 'Candidate'];
	}
};

// Function to fetch people by team
export const fetchPeopleByTeam = async (team: string): Promise<string[]> => {
	try {
		console.log(`Fetching people for team ${team} from database...`);
		
		// Query Supabase for people in the specified team
		const { data: peopleData, error } = await supabase
			.from('voter_contacts')
			.select('first_name, last_name')
			.eq('team', team)
			.limit(1000);

		if (error) {
			throw error;
		}

		if (!peopleData || peopleData.length === 0) {
			console.log(`No people found for team ${team}`);
			return [];
		}

		// Create full names from first and last names
		const peopleNames = peopleData.map(item => {
			const fullName = formatPersonName(item.first_name, item.last_name);
			return fullName;
		}).filter(name => name && name.trim() !== '');
		
		// Get unique names (remove duplicates)
		const uniqueNames = [...new Set(peopleNames)].sort();
		
		console.log(`Found ${uniqueNames.length} unique people for team ${team}`);
		return uniqueNames;
	} catch (error) {
		console.error(`Error fetching people for team ${team}:`, error);
		return [];
	}
};

// Function to fetch all people
export const fetchAllPeople = async (): Promise<string[]> => {
	try {
		console.log("Fetching all unique people from the database...");
		
		// Query Supabase for all people
		const { data: peopleData, error } = await supabase
			.from('voter_contacts')
			.select('first_name, last_name')
			.limit(1000);

		if (error) {
			throw error;
		}

		if (!peopleData || peopleData.length === 0) {
			console.log("No people data found in database");
			return [];
		}

		// Create full names from first and last names
		const allPeopleNames = peopleData.map(item => {
			const fullName = formatPersonName(item.first_name, item.last_name);
			return fullName;
		}).filter(name => name && name.trim() !== '');
		
		// Get unique names (remove duplicates)
		const uniqueNames = [...new Set(allPeopleNames)].sort();
		
		console.log(`Found ${uniqueNames.length} unique people (from ${allPeopleNames.length} total entries)`);
		console.log("Unique people names sample:", uniqueNames.slice(0, 5));
		
		return uniqueNames;
	} catch (error) {
		console.error("Error fetching all people:", error);
		return [];
	}
};

// Function to check if a string is a valid date
const isValidDate = (dateString: string): boolean => {
  // Return false for empty strings
  if (!dateString || typeof dateString !== 'string' || dateString.trim() === '') {
    return false;
  }
  
  // Try to parse the date
  const timestamp = Date.parse(dateString);
  
  // If timestamp is not a number, it's not a valid date
  if (isNaN(timestamp)) {
    return false;
  }
  
  // Return true if we have a valid date
  return true;
};

// Function to fetch all available dates from the test data
export const fetchDates = async (): Promise<string[]> => {
  try {
    console.log("Fetching dates from database...");
    
    // Try to fetch directly from Supabase first
    const { data: datesData, error } = await supabase
      .from('voter_contacts')
      .select('date')
      .limit(1000);

    if (error) {
      throw error;
    }

    if (datesData && datesData.length > 0) {
      // Extract all date strings from the data
      const rawDates = datesData.map(item => item.date);
      
      // Filter to only valid dates
      const validDates = rawDates
        .filter(date => isValidDate(date))
        .sort((a, b) => {
          return new Date(a).getTime() - new Date(b).getTime();
        });
      
      // Get unique dates
      const uniqueDates = [...new Set(validDates)];
      
      console.log(`Found ${uniqueDates.length} unique valid dates from ${datesData.length} records`);
      console.log("Sample dates:", uniqueDates.slice(0, 5));
      return uniqueDates;
    }

    console.log("No dates found in database");
    return [];
  } catch (error) {
    console.error("Error fetching dates:", error);
    return [];
  }
};
