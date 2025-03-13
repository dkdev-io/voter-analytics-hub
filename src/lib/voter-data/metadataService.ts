
import { supabase } from '@/integrations/supabase/client';
import { getTestData, isUsingMockData } from './migrationService';

// Function to fetch tactics from Supabase
export const fetchTactics = async () => {
  try {
    // Handle mock data if Supabase is not available
    if (isUsingMockData()) {
      const mockData = getTestData();
      const tactics = Array.from(new Set(mockData.map(item => item.tactic)));
      return tactics;
    }

    const { data, error } = await supabase
      .from('voter_contacts')
      .select('tactic')
      .order('tactic');

    if (error) throw error;
    
    // Extract unique tactics
    const tactics = Array.from(new Set(data.map(item => item.tactic)));
    return tactics;
  } catch (error) {
    console.error('Error fetching tactics:', error);
    return [];
  }
};

// Function to fetch teams from Supabase
export const fetchTeams = async () => {
  try {
    // Handle mock data if Supabase is not available
    if (isUsingMockData()) {
      const mockData = getTestData();
      const teams = Array.from(new Set(mockData.map(item => item.team)));
      return teams;
    }

    const { data, error } = await supabase
      .from('voter_contacts')
      .select('team')
      .order('team');

    if (error) throw error;
    
    // Extract unique teams
    const teams = Array.from(new Set(data.map(item => item.team)));
    return teams;
  } catch (error) {
    console.error('Error fetching teams:', error);
    return [];
  }
};

// Function to fetch people by team
export const fetchPeopleByTeam = async (selectedTeam: string | null) => {
  try {
    // Handle mock data if Supabase is not available
    if (isUsingMockData()) {
      const mockData = getTestData();
      let filteredData = mockData;
      
      if (selectedTeam && selectedTeam !== 'All') {
        filteredData = mockData.filter(item => item.team === selectedTeam);
      }
      
      const people = filteredData.map(item => `${item.first_name} ${item.last_name}`);
      return Array.from(new Set(people)).sort();
    }

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
    return Array.from(peopleMap.values())
      .flat()
      .filter((name, index, self) => self.indexOf(name) === index)
      .sort();
  } catch (error) {
    console.error('Error fetching people by team:', error);
    return [];
  }
};
