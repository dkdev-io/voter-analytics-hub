
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
        setIsLoading(false);
      }
    };
    
    if (isDataMigrated) {
      loadInitialData();
    } else {
      console.log("Data not migrated, skipping metadata load");
      setIsLoading(false);
    }
  }, [isDataMigrated]);

  // Fetch people based on selected team
  useEffect(() => {
    const loadPeopleByTeam = async () => {
      if (!isDataMigrated || !selectedTeam) return;
      
      try {
        setIsLoading(true);
        console.log("Loading people for team:", selectedTeam);
        
        const people = await fetchPeopleByTeam(selectedTeam);
        console.log("People loaded:", people);
        
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
      console.log("Not loading people: isDataMigrated=", isDataMigrated, "selectedTeam=", selectedTeam);
    }
  }, [selectedTeam, isDataMigrated]);

  return {
    tactics,
    teams,
    filteredPeople,
    availableDates,
    isLoading
  };
};
