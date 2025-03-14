
import { getTestData } from './migrationService';

// Get all unique tactics from the data
export const fetchTactics = async (): Promise<string[]> => {
  try {
    const data = getTestData();
    const tactics = [...new Set(data.map(item => item.tactic))];
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
    const teams = [...new Set(data.map(item => item.team))];
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
    return [...new Set(filteredPeople)];
  } catch (error) {
    console.error('Error fetching people by team:', error);
    return [];
  }
};

// Get all unique dates from the data
export const fetchDates = async (): Promise<string[]> => {
  try {
    const data = getTestData();
    const dates = [...new Set(data.map(item => item.date))];
    return dates;
  } catch (error) {
    console.error('Error fetching dates:', error);
    return [];
  }
};
