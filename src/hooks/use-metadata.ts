
import { useState, useEffect } from 'react';
import { 
  fetchTactics, 
  fetchTeams, 
  fetchPeopleByTeam, 
  fetchAllPeople,
  fetchDates 
} from '@/lib/voter-data';

export const useMetadata = (isDataMigrated: boolean, selectedTeam: string | null) => {
  const [tactics, setTactics] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<string[]>([]);
  const [allPeople, setAllPeople] = useState<string[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        if (!isDataMigrated) {
          return;
        }
        
        // Fetch all metadata in parallel
        const results = await Promise.allSettled([
          fetchTactics(),
          fetchTeams(),
          fetchDates(),
          fetchAllPeople()
        ]);
        
        // Process results even if some promises were rejected
        const [tacticsResult, teamsResult, datesResult, allPeopleResult] = results;
        
        if (tacticsResult.status === 'fulfilled') {
          setTactics(tacticsResult.value || []);
        } else {
          console.error("Error loading tactics:", tacticsResult.reason);
        }
        
        if (teamsResult.status === 'fulfilled') {
          setTeams(teamsResult.value || []);
        } else {
          console.error("Error loading teams:", teamsResult.reason);
        }
        
        if (datesResult.status === 'fulfilled') {
          setAvailableDates(datesResult.value || []);
        } else {
          console.error("Error loading dates:", datesResult.reason);
        }

        if (allPeopleResult.status === 'fulfilled') {
          setAllPeople(allPeopleResult.value || []);
        } else {
          console.error("Error loading all people:", allPeopleResult.reason);
        }
      } catch (err) {
        console.error("Error loading initial data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isDataMigrated) {
      loadInitialData();
    } else {
      setIsLoading(false);
    }
  }, [isDataMigrated]);

  // Fetch people based on selected team
  useEffect(() => {
    const loadPeopleByTeam = async () => {
      if (!isDataMigrated || !selectedTeam) return;
      
      try {
        setIsLoading(true);
        
        const people = await fetchPeopleByTeam(selectedTeam);
        
        setFilteredPeople(people || []);
      } catch (err) {
        console.error("Error loading people by team:", err);
        setFilteredPeople([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isDataMigrated && selectedTeam) {
      loadPeopleByTeam();
    } else {
      setFilteredPeople([]);
    }
  }, [selectedTeam, isDataMigrated]);

  return {
    tactics,
    teams,
    filteredPeople,
    allPeople,
    availableDates,
    isLoading
  };
};
