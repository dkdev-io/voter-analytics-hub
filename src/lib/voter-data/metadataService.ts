
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
      return ["SMS", "Phone", "Canvas", "Email"];
    }
    
    // Extract unique tactics from the data
    const tactics = [...new Set(data.map(item => item.tactic))].filter(Boolean).sort();
    console.log("Available tactics:", tactics);
    return tactics;
  } catch (error) {
    console.error("Error fetching tactics:", error);
    // Return default tactics as fallback
    return ["SMS", "Phone", "Canvas", "Email"];
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
      return ["Team Alpha", "Team Beta", "Team Gamma", "Team Delta", "Team Tony"];
    }
    
    // Extract unique teams from the data - ensure we use the actual data
    const teams = [...new Set(data.map(item => item.team).filter(Boolean))].sort();
    console.log("Available teams:", teams);
    return teams;
  } catch (error) {
    console.error("Error fetching teams:", error);
    // Return default teams as fallback
    return ["Team Alpha", "Team Beta", "Team Gamma", "Team Delta", "Team Tony"];
  }
};

// Function to fetch people by team
export const fetchPeopleByTeam = async (team: string): Promise<string[]> => {
  try {
    console.log(`Fetching people for team: ${team}`);
    const data = await getTestData();
    console.log(`Fetching people from ${data.length} records for team: ${team}`);
    
    if (!data || data.length === 0) {
      console.log("No data available for people, using fallback values");
      // Fallback to default people if no data is available
      return ["Michael Garcia", "Sarah Rodriguez", "David Smith", "John Smith", "Maria Williams"];
    }
    
    // Filter data by team and extract unique full names
    const peopleInTeam = data
      .filter(item => item.team === team)
      .map(item => {
        if (!item.first_name || !item.last_name) {
          console.warn("Missing name data:", item);
          return null;
        }
        return `${item.first_name} ${item.last_name}`;
      })
      .filter(Boolean) as string[];
    
    // Get unique people (in case there are duplicates)
    const uniquePeople = [...new Set(peopleInTeam)].sort();
    console.log(`Found ${uniquePeople.length} unique people in team ${team}`);
    console.log("Sample people in team:", uniquePeople.slice(0, 5));
    
    return uniquePeople;
  } catch (error) {
    console.error(`Error fetching people for team ${team}:`, error);
    // Return default people as fallback
    return ["Michael Garcia", "Sarah Rodriguez", "David Smith", "John Smith", "Maria Williams"];
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
      return ["Michael Garcia", "Sarah Rodriguez", "David Smith", "Emily Johnson", "Joshua Williams", "John Smith", "Maria Williams"];
    }
    
    // Extract unique full names from the data
    const allPeople = data
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
    console.log("All unique people count:", uniquePeople.length);
    console.log("Sample people:", uniquePeople.slice(0, 5));
    
    return uniquePeople;
  } catch (error) {
    console.error("Error fetching all people:", error);
    // Return default people as fallback
    return ["Michael Garcia", "Sarah Rodriguez", "David Smith", "Emily Johnson", "Joshua Williams", "John Smith", "Maria Williams"];
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
      return ["2023-01-01", "2023-02-01", "2023-03-01", "2023-04-01", "2023-05-01", "2025-01-01"];
    }
    
    // Extract unique dates from the data
    const dates = [...new Set(data.map(item => item.date).filter(Boolean))].sort();
    console.log("Available dates count:", dates.length);
    console.log("Sample dates:", dates.slice(0, 5));
    
    return dates;
  } catch (error) {
    console.error("Error fetching dates:", error);
    // Return default dates as fallback
    return ["2023-01-01", "2023-02-01", "2023-03-01", "2023-04-01", "2023-05-01", "2025-01-01"];
  }
};
