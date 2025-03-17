
import { getTestData } from './migrationService';
import { supabase } from '@/integrations/supabase/client';

// Function to fetch all available tactics from the test data
export const fetchTactics = async (): Promise<string[]> => {
  try {
    console.log("Fetching tactics...");
    
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
      console.log("Available tactics from database:", tactics);
      return tactics;
    }
    
    // Fall back to getTestData if no data from direct query
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
      
      // Always include our expected teams
      const expectedTeams = ["Team Tony", "Local Party", "Candidate"];
      const allTeams = [...new Set([...teams, ...expectedTeams])].sort();
      
      console.log("Available teams from database:", allTeams);
      return allTeams;
    }
    
    // Fall back to getTestData if no data from direct query
    const data = await getTestData();
    console.log(`Fetching teams from ${data.length} records`);
    
    if (!data || data.length === 0) {
      console.log("No data available for teams, using fallback values");
      // Fallback to default teams if no data is available
      return ["Team Tony", "Local Party", "Candidate"];
    }
    
    // Extract unique teams from the data - ensure we use the actual data
    const teams = [...new Set(data.map(item => item.team).filter(Boolean))];
    
    // Always include our expected teams
    const expectedTeams = ["Team Tony", "Local Party", "Candidate"];
    const allTeams = [...new Set([...teams, ...expectedTeams])].sort();
    
    console.log("Available teams:", allTeams);
    return allTeams;
  } catch (error) {
    console.error("Error fetching teams:", error);
    // Return default teams as fallback
    return ["Team Tony", "Local Party", "Candidate"];
  }
};

// Function to fetch people by team
export const fetchPeopleByTeam = async (team: string): Promise<string[]> => {
  try {
    console.log(`Fetching people for team: ${team}`);
    
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
            console.warn("Missing name data:", item);
            return null;
          }
          return `${item.first_name} ${item.last_name}`;
        })
        .filter(Boolean) as string[];
      
      // Get unique people (in case there are duplicates)
      const uniquePeople = [...new Set(peopleInTeam)].sort();
      console.log(`Found ${uniquePeople.length} unique people in team ${team} from database`);
      return uniquePeople;
    }
    
    // Fall back to getTestData if no data from direct query
    const data = await getTestData();
    console.log(`Fetching people from ${data.length} records for team: ${team}`);
    
    if (!data || data.length === 0) {
      console.log("No data available for people, using fallback values");
      if (team === "Team Tony") {
        return ["John Smith", "Jane Doe", "Alex Johnson", "Maria Martinez", "Chris Brown"];
      } else if (team === "Candidate") {
        return ["Candidate Carter"];
      } else {
        // Local Party or any other team
        return ["Ava King", "Evelyn Nelson", "James White", "Owen Torres", "David Kim"];
      }
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
    // Return appropriate fallback people based on the team
    if (team === "Team Tony") {
      return ["John Smith", "Jane Doe", "Alex Johnson", "Maria Martinez", "Chris Brown"];
    } else if (team === "Candidate") {
      return ["Candidate Carter"];
    } else {
      // Local Party or any other team
      return ["Ava King", "Evelyn Nelson", "James White", "Owen Torres", "David Kim"];
    }
  }
};

// Function to fetch all people
export const fetchAllPeople = async (): Promise<string[]> => {
  try {
    console.log("Fetching all people...");
    
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
      console.log("All unique people count from database:", uniquePeople.length);
      console.log("Sample people:", uniquePeople.slice(0, 5));
      return uniquePeople;
    }
    
    // Fall back to getTestData if no data from direct query
    const data = await getTestData();
    console.log(`Fetching all people from ${data.length} records`);
    
    if (!data || data.length === 0) {
      console.log("No data available for people");
      // Fallback to default people that match the dataset
      return [
        "John Smith", "Jane Doe", "Alex Johnson", "Maria Martinez", "Chris Brown",
        "Candidate Carter", "Ava King", "Evelyn Nelson", "James White", "Owen Torres"
      ];
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
    
    // Expected default names
    const expectedNames = [
      "John Smith", "Jane Doe", "Alex Johnson", "Maria Martinez", "Chris Brown",
      "Candidate Carter", "Ava King", "Evelyn Nelson", "James White", "Owen Torres"
    ];
    
    // Make sure we get unique names only and sort them
    const uniquePeople = [...new Set([...allPeople, ...expectedNames])].sort();
    console.log("All unique people count:", uniquePeople.length);
    console.log("Sample people:", uniquePeople.slice(0, 5));
    
    return uniquePeople;
  } catch (error) {
    console.error("Error fetching all people:", error);
    // Return default people that match the dataset as fallback
    return [
      "John Smith", "Jane Doe", "Alex Johnson", "Maria Martinez", "Chris Brown",
      "Candidate Carter", "Ava King", "Evelyn Nelson", "James White", "Owen Torres"
    ];
  }
};

// Function to fetch all available dates from the test data
export const fetchDates = async (): Promise<string[]> => {
  try {
    console.log("Fetching dates...");
    
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
      
      console.log("Available unique dates from database count:", dates.length);
      console.log("Sample dates from database:", dates.slice(0, 5));
      return dates;
    }
    
    // Fall back to getTestData if no data from direct query
    const data = await getTestData();
    console.log(`Fetching dates from ${data.length} records`);
    
    if (!data || data.length === 0) {
      console.log("No data available for dates");
      // Return January 2025 dates as fallback, to match the format in the real data
      const fallbackDates = [];
      for (let day = 1; day <= 31; day++) {
        const formattedDay = day.toString().padStart(2, '0');
        fallbackDates.push(`2025-01-${formattedDay}`);
      }
      return fallbackDates;
    }
    
    // Extract unique dates from the data and sort chronologically
    const dates = [...new Set(data.map(item => item.date).filter(Boolean))].sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });
    
    console.log("Available unique dates count:", dates.length);
    console.log("Sample dates:", dates.slice(0, 5));
    
    return dates;
  } catch (error) {
    console.error("Error fetching dates:", error);
    // Return January 2025 dates as fallback, to match the format in the real data
    const fallbackDates = [];
    for (let day = 1; day <= 31; day++) {
      const formattedDay = day.toString().padStart(2, '0');
      fallbackDates.push(`2025-01-${formattedDay}`);
    }
    return fallbackDates;
  }
};
