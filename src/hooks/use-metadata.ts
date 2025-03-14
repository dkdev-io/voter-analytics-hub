
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
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch initial data
  useEffect(() => {
    let isMounted = true;
    
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching metadata, isDataMigrated:", isDataMigrated);
        
        if (!isDataMigrated) {
          console.log("Data not migrated yet, skipping metadata fetch");
          return;
        }
        
        // Fetch all metadata in parallel
        const results = await Promise.allSettled([
          fetchTactics(),
          fetchTeams(),
          fetchDates()
        ]);
        
        // Prevent state updates if component is unmounted
        if (!isMounted) return;
        
        // Process results even if some promises were rejected
        const [tacticsResult, teamsResult, datesResult] = results;
        
        if (tacticsResult.status === 'fulfilled') {
          console.log("Tactics loaded successfully:", tacticsResult.value);
          setTactics(tacticsResult.value || []);
        } else {
          console.error("Error loading tactics:", tacticsResult.reason);
        }
        
        if (teamsResult.status === 'fulfilled') {
          console.log("Teams loaded successfully:", teamsResult.value);
          setTeams(teamsResult.value || []);
        } else {
          console.error("Error loading teams:", teamsResult.reason);
        }
        
        if (datesResult.status === 'fulfilled') {
          console.log("Dates loaded successfully:", datesResult.value);
          setAvailableDates(datesResult.value || []);
        } else {
          console.error("Error loading dates:", datesResult.reason);
        }
      } catch (err) {
        console.error("Error loading initial data:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    if (isDataMigrated) {
      loadInitialData();
    } else {
      console.log("Data not migrated, skipping metadata load");
      setIsLoading(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, [isDataMigrated]);

  // Fetch people based on selected team
  useEffect(() => {
    let isMounted = true;
    
    const loadPeopleByTeam = async () => {
      if (!isDataMigrated || !selectedTeam) return;
      
      try {
        setIsLoading(true);
        console.log("Loading people for team:", selectedTeam);
        
        const people = await fetchPeopleByTeam(selectedTeam);
        
        if (isMounted) {
          console.log("People loaded:", people);
          setFilteredPeople(people || []);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error loading people by team:", err);
        if (isMounted) {
          setFilteredPeople([]);
          setIsLoading(false);
        }
      }
    };
    
    if (isDataMigrated && selectedTeam) {
      loadPeopleByTeam();
    } else {
      console.log("Not loading people: isDataMigrated=", isDataMigrated, "selectedTeam=", selectedTeam);
      if (isMounted && selectedTeam === null) {
        setFilteredPeople([]);
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [selectedTeam, isDataMigrated]);

  return {
    tactics,
    teams,
    filteredPeople,
    availableDates,
    isLoading
  };
};
