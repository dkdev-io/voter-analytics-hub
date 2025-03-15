
import { getTestData } from './migrationService';

// Function to fetch all available tactics from the test data
export const fetchTactics = async (): Promise<string[]> => {
  try {
    console.log("Fetching tactics...");
    const data = await getTestData();
    console.log(`Fetching tactics from ${data.length} records`);
    
    if (!data || data.length === 0) {
      console.log("No data available for tactics, using fallback values");
      // Fallback to default tactics if no data is available
      return ["SMS", "Phone", "Canvas"];
    }
    
    // Extract unique tactics from the data
    const tactics = [...new Set(data.map(item => item.tactic))];
    console.log("Available tactics:", tactics);
    return tactics;
  } catch (error) {
    console.error("Error fetching tactics:", error);
    // Return default tactics as fallback
    return ["SMS", "Phone", "Canvas"];
  }
};

// Function to fetch all available teams from the test data
export const fetchTeams = async (): Promise<string[]> => {
  try {
    console.log("Fetching teams...");
    const data = await getTestData();
    console.log(`Fetching teams from ${data.length} records`);
    
    if (!data || data.length === 0) {
      console.log("No data available for teams, using fallback values");
      // Fallback to default teams if no data is available
      return ["Team Tony", "Team Maria", "Team John"];
    }
    
    // Extract unique teams from the data
    const teams = [...new Set(data.map(item => item.team))];
    console.log("Available teams:", teams);
    return teams;
  } catch (error) {
    console.error("Error fetching teams:", error);
    // Return default teams as fallback
    return ["Team Tony", "Team Maria", "Team John"];
  }
};

// Function to fetch people by team
export const fetchPeopleByTeam = async (team: string): Promise<string[]> => {
  try {
    console.log(`Fetching people for team: ${team}`);
    const data = await getTestData();
    console.log(`Fetching people from ${data.length} records`);
    
    if (!data || data.length === 0) {
      console.log("No data available for people, using fallback values");
      // Fallback to default people if no data is available
      return ["John Smith", "Jane Doe", "Alex Johnson"];
    }
    
    // Filter data by team and extract unique full names
    const peopleInTeam = data
      .filter(item => item.team === team)
      .map(item => `${item.first_name} ${item.last_name}`);
    
    // Get unique people (in case there are duplicates)
    const uniquePeople = [...new Set(peopleInTeam)];
    console.log(`People in team ${team}:`, uniquePeople);
    return uniquePeople;
  } catch (error) {
    console.error(`Error fetching people for team ${team}:`, error);
    // Return default people as fallback
    return ["John Smith", "Jane Doe", "Alex Johnson"];
  }
};

// Function to fetch all people
export const fetchAllPeople = async (): Promise<string[]> => {
  try {
    console.log("Fetching all people...");
    const data = await getTestData();
    console.log(`Fetching all people from ${data.length} records`);
    
    if (!data || data.length === 0) {
      console.log("No data available for people");
      // Fallback to default people if no data is available
      return ["John Smith", "Jane Doe", "Alex Johnson", "Maria Martinez", "Chris Brown"];
    }
    
    // Extract unique full names from the data
    const allPeople = data.map(item => `${item.first_name} ${item.last_name}`);
    const uniquePeople = [...new Set(allPeople)];
    console.log("All people:", uniquePeople);
    return uniquePeople;
  } catch (error) {
    console.error("Error fetching all people:", error);
    // Return default people as fallback
    return ["John Smith", "Jane Doe", "Alex Johnson", "Maria Martinez", "Chris Brown"];
  }
};

// Function to fetch all available dates from the test data
export const fetchDates = async (): Promise<string[]> => {
  try {
    console.log("Fetching dates...");
    const data = await getTestData();
    console.log(`Fetching dates from ${data.length} records`);
    
    if (!data || data.length === 0) {
      console.log("No data available for dates");
      // Fallback to default dates if no data is available
      return ["2025-01-01", "2025-01-02", "2025-01-03"];
    }
    
    // Extract unique dates from the data
    const dates = [...new Set(data.map(item => item.date))];
    console.log("Available dates:", dates);
    return dates.sort(); // Sort dates in ascending order
  } catch (error) {
    console.error("Error fetching dates:", error);
    // Return default dates as fallback
    return ["2025-01-01", "2025-01-02", "2025-01-03"];
  }
};
