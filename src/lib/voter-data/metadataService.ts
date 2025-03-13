
import { supabase } from '@/integrations/supabase/client';

// Function to fetch tactics from Supabase
export const fetchTactics = async () => {
  try {
    console.log("Fetching tactics...");
    // Query to fetch all tactics
    const { data, error } = await supabase
      .from('voter_contacts')
      .select('tactic');

    if (error) {
      console.error('Error fetching tactics:', error);
      throw error;
    }
    
    console.log("Raw tactic data received:", data);
    
    // Extract unique tactics and filter out null/empty values
    const tactics = Array.from(new Set(data.map(item => item.tactic)))
      .filter(Boolean)
      .sort();
      
    console.log("Processed tactics:", tactics.length > 0 ? tactics : "No tactics found");
    return tactics;
  } catch (error) {
    console.error('Error fetching tactics:', error);
    return [];
  }
};

// Function to fetch teams from Supabase
export const fetchTeams = async () => {
  try {
    console.log("Fetching teams...");
    // Fetch all teams
    const { data, error } = await supabase
      .from('voter_contacts')
      .select('team');

    if (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
    
    console.log("Raw team data received:", data);
    
    // Extract unique teams and filter out null/empty values
    const teams = Array.from(new Set(data.map(item => item.team)))
      .filter(Boolean)
      .sort();
      
    console.log("Processed teams:", teams.length > 0 ? teams : "No teams found");
    return teams;
  } catch (error) {
    console.error('Error fetching teams:', error);
    return [];
  }
};

// Function to fetch people by team
export const fetchPeopleByTeam = async (selectedTeam: string | null) => {
  try {
    console.log("Fetching people for team:", selectedTeam);
    let query = supabase
      .from('voter_contacts')
      .select('first_name, last_name, team');
    
    if (selectedTeam && selectedTeam !== 'All') {
      query = query.eq('team', selectedTeam);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching people by team:', error);
      throw error;
    }
    
    console.log("Raw people data received:", data);
    
    if (!data || data.length === 0) {
      console.log("No people data found for team:", selectedTeam);
      return [];
    }
    
    // Transform data and extract unique people
    const peopleMap = new Map<string, string[]>();
    
    data.forEach(entry => {
      if (!entry.first_name || !entry.last_name) return;
      
      const fullName = `${entry.first_name} ${entry.last_name}`;
      const team = entry.team || 'Unknown';
      
      if (!peopleMap.has(team)) {
        peopleMap.set(team, []);
      }
      
      const teamMembers = peopleMap.get(team) || [];
      if (!teamMembers.includes(fullName)) {
        teamMembers.push(fullName);
      }
    });
    
    // Handle team-specific filtering
    if (selectedTeam && selectedTeam !== 'All') {
      const teamMembers = peopleMap.get(selectedTeam) || [];
      console.log(`Found ${teamMembers.length} team members for ${selectedTeam}`);
      return teamMembers.sort();
    }
    
    // If no team selected, return all people
    const allPeople = Array.from(peopleMap.values())
      .flat()
      .filter((name, index, self) => self.indexOf(name) === index)
      .sort();
      
    console.log("People fetched:", allPeople.length > 0 ? `${allPeople.length} people` : "No people found");
    return allPeople;
  } catch (error) {
    console.error('Error fetching people by team:', error);
    return [];
  }
};

// Function to fetch available dates
export const fetchDates = async () => {
  try {
    console.log("Fetching dates...");
    // Fetch all dates
    const { data, error } = await supabase
      .from('voter_contacts')
      .select('date');

    if (error) {
      console.error('Error fetching dates:', error);
      throw error;
    }
    
    console.log("Raw date data received:", data);
    
    if (!data || data.length === 0) {
      console.log("No date data found");
      return [];
    }
    
    // Extract unique dates and filter out null/empty values
    const dates = Array.from(new Set(data.map(item => item.date)))
      .filter(Boolean)
      .sort();
      
    console.log("Processed dates:", dates.length > 0 ? dates : "No dates found");
    return dates;
  } catch (error) {
    console.error('Error fetching dates:', error);
    return [];
  }
};
