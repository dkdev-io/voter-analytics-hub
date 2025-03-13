
import { useState, useEffect } from 'react';
import { 
  fetchTactics, 
  fetchTeams, 
  fetchPeopleByTeam, 
  fetchDates 
} from '@/lib/voter-data';

export const useMetadata = (isDataMigrated: boolean, selectedTeam: string | null) => {
  const [tactics, setTactics] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<string[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  
  // Fetch initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const tacticsList = await fetchTactics();
        const teamsList = await fetchTeams();
        const datesList = await fetchDates();
        
        setTactics(tacticsList);
        setTeams(teamsList);
        setAvailableDates(datesList);
      } catch (err) {
        console.error("Error loading initial data:", err);
      }
    };
    
    if (isDataMigrated) {
      loadInitialData();
    }
  }, [isDataMigrated]);

  // Fetch people based on selected team
  useEffect(() => {
    const loadPeopleByTeam = async () => {
      try {
        const people = await fetchPeopleByTeam(selectedTeam);
        setFilteredPeople(people);
      } catch (err) {
        console.error("Error loading people by team:", err);
      }
    };
    
    if (isDataMigrated && selectedTeam) {
      loadPeopleByTeam();
    }
  }, [selectedTeam, isDataMigrated]);

  return {
    tactics,
    teams,
    filteredPeople,
    availableDates
  };
};
