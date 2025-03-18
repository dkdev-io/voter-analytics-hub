
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
    
    // Return empty array if no data is found - no fallbacks
    console.log("No tactics data found, returning empty array");
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
      
      console.log("Available teams from database:", teams);
      return teams.sort();
    }
    
    // Return empty array if no data is found - no fallbacks
    console.log("No teams data found, returning empty array");
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
    
    // Return empty array if no data is found - no fallbacks
    console.log(`No people data found for team ${team}, returning empty array`);
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
    
    // Return empty array if no data is found - no fallbacks
    console.log("No people data found, returning empty array");
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
    
    // Return empty array if no data is found - no fallbacks
    console.log("No dates data found, returning empty array");
    return [];
  } catch (error) {
    console.error("Error fetching dates:", error);
    // Return empty array instead of fallbacks
    return [];
  }
};
