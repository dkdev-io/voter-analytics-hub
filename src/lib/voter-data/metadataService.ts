
import { getTestData } from './migrationService';

// Get all unique tactics from the data
export const fetchTactics = async (): Promise<string[]> => {
  try {
    const data = getTestData();
    const tactics = [...new Set(data.map(item => item.tactic))].sort();
    console.log("Fetched tactics:", tactics);
    return tactics;
  } catch (error) {
    console.error('Error fetching tactics:', error);
    return [];
  }
};

// Get all unique teams from the data
export const fetchTeams = async (): Promise<string[]> => {
  try {
    const data = getTestData();
    const teams = [...new Set(data.map(item => item.team))].sort();
    console.log("Fetched teams:", teams);
    return teams;
  } catch (error) {
    console.error('Error fetching teams:', error);
    return [];
  }
};

// Get all people belonging to a specific team
export const fetchPeopleByTeam = async (team: string): Promise<string[]> => {
  try {
    const data = getTestData();
    const filteredPeople = data
      .filter(item => team === 'All' || item.team === team)
      .map(item => `${item.first_name} ${item.last_name}`);
    
    // Return unique names
    const uniquePeople = [...new Set(filteredPeople)].sort();
    console.log(`Fetched people for team ${team}:`, uniquePeople);
    return uniquePeople;
  } catch (error) {
    console.error('Error fetching people by team:', error);
    return [];
  }
};

// Get all unique dates from the data
export const fetchDates = async (): Promise<string[]> => {
  try {
    const data = getTestData();
    const dates = [...new Set(data.map(item => item.date))].sort();
    console.log("Fetched dates:", dates);
    return dates;
  } catch (error) {
    console.error('Error fetching dates:', error);
    return [];
  }
};
