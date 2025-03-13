
import { supabase } from '@/integrations/supabase/client';

// Function to fetch tactics from Supabase
export const fetchTactics = async () => {
  try {
    console.log("Fetching tactics...");
    // Changed the query to select distinct values
    const { data, error } = await supabase
      .from('voter_contacts')
      .select('tactic')
      .is('tactic', null, { negate: true });

    if (error) throw error;
    
    // Extract unique tactics
    const tactics = Array.from(new Set(data.map(item => item.tactic)))
      .filter(Boolean)
      .sort();
      
    console.log("Tactics fetched:", tactics);
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
    // Changed the query to select distinct values
    const { data, error } = await supabase
      .from('voter_contacts')
      .select('team')
      .is('team', null, { negate: true });

    if (error) throw error;
    
    // Extract unique teams
    const teams = Array.from(new Set(data.map(item => item.team)))
      .filter(Boolean)
      .sort();
      
    console.log("Teams fetched:", teams);
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
    
    if (error) throw error;
    
    // Transform data and extract unique people
    const peopleMap = new Map<string, string[]>();
    
    data.forEach(entry => {
      const fullName = `${entry.first_name} ${entry.last_name}`;
      if (!peopleMap.has(entry.team)) {
        peopleMap.set(entry.team, []);
      }
      
      const teamMembers = peopleMap.get(entry.team) || [];
      if (!teamMembers.includes(fullName)) {
        teamMembers.push(fullName);
      }
    });
    
    // Handle team-specific filtering
    if (selectedTeam && selectedTeam !== 'All') {
      const teamMembers = peopleMap.get(selectedTeam) || [];
      return teamMembers.sort();
    }
    
    // If no team selected, return all people
    const allPeople = Array.from(peopleMap.values())
      .flat()
      .filter((name, index, self) => self.indexOf(name) === index)
      .sort();
      
    console.log("People fetched:", allPeople);
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
    // Changed the query to select distinct values
    const { data, error } = await supabase
      .from('voter_contacts')
      .select('date')
      .is('date', null, { negate: true });

    if (error) throw error;
    
    // Extract unique dates
    const dates = Array.from(new Set(data.map(item => item.date)))
      .filter(Boolean)
      .sort();
      
    console.log("Dates fetched:", dates);
    return dates;
  } catch (error) {
    console.error('Error fetching dates:', error);
    return [];
  }
};
