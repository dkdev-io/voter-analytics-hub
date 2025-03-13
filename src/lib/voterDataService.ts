
import { supabase } from './supabase';
import { TEST_DATA } from '@/types/analytics';
import type { QueryParams } from '@/types/analytics';

// Function to migrate test data to Supabase (run once)
export const migrateTestDataToSupabase = async () => {
  try {
    // Transform TEST_DATA to match Supabase schema
    const transformedData = TEST_DATA.map(item => ({
      first_name: item.firstName,
      last_name: item.lastName,
      team: item.team,
      date: item.date,
      tactic: item.tactic,
      attempts: item.attempts,
      contacts: item.contacts,
      not_home: item.notHome,
      refusal: item.refusal,
      bad_data: item.badData,
      support: item.support,
      oppose: item.oppose,
      undecided: item.undecided
    }));

    // Add Dan Kelly if not already in the data
    const danKellyExists = TEST_DATA.some(
      d => d.firstName === "Dan" && d.lastName === "Kelly"
    );
    
    if (!danKellyExists) {
      transformedData.push({
        first_name: "Dan",
        last_name: "Kelly",
        team: "Local Party",
        date: "2025-01-31",
        tactic: "Phone",
        attempts: 7,
        contacts: 3,
        not_home: 2,
        refusal: 1,
        bad_data: 1,
        support: 2,
        oppose: 0,
        undecided: 1
      });
    }

    // Insert data into Supabase
    const { error } = await supabase
      .from('voter_contacts')
      .insert(transformedData);

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error migrating data to Supabase:', error);
    return { success: false, error };
  }
};

// Function to fetch tactics from Supabase
export const fetchTactics = async () => {
  try {
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
    
    // Handle Dan Kelly presence specifically for the filtering case
    if (selectedTeam) {
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

// Function to calculate result based on query parameters
export const calculateResultFromSupabase = async (query: Partial<QueryParams>) => {
  try {
    if (!query.tactic && !query.resultType && !query.person && !query.date) {
      return { error: "Please select at least one field", result: null };
    }

    // Start building the Supabase query
    let supabaseQuery = supabase.from('voter_contacts').select('*');
    
    // Add filters based on query parameters
    if (query.tactic && query.tactic !== 'All') {
      supabaseQuery = supabaseQuery.eq('tactic', query.tactic);
    }
    
    if (query.date && query.date !== 'All') {
      supabaseQuery = supabaseQuery.eq('date', query.date);
    }
    
    if (query.person && query.person !== 'All') {
      let firstName, lastName;
      
      if (query.person === "Candidate Carter") {
        firstName = "Candidate";
        lastName = "Carter";
      } else if (query.person === "Dan Kelly") {
        firstName = "Dan";
        lastName = "Kelly";
      } else {
        const nameParts = query.person.split(" ");
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(" ");
      }
      
      supabaseQuery = supabaseQuery
        .eq('first_name', firstName)
        .eq('last_name', lastName);
    }
    
    // Execute the query
    const { data, error } = await supabaseQuery;
    
    if (error) throw error;
    
    // Map the display result type to the actual property name in the data
    let resultType = query.resultType ? 
      query.resultType.toLowerCase().replace(/ /g, "_") : 
      "attempts";
    
    // Special handling for "Not Home" to map to "not_home" property
    if (resultType === "not_home") {
      resultType = "not_home";
    } else if (resultType === "bad_data") {
      resultType = "bad_data";
    }
    
    if (data.length === 0) {
      return { result: 0, error: null };
    } else {
      const total = data.reduce((sum, item) => {
        return sum + (item[resultType as keyof typeof item] as number || 0);
      }, 0);
      
      return { result: total, error: null };
    }
  } catch (error) {
    console.error("Error calculating result:", error);
    return { error: "Unknown error", result: null };
  }
};
