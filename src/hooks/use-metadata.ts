
import { useState, useEffect, useRef } from 'react';
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
  
  // Use a ref to track component mounted state
  const isMountedRef = useRef(true);
  const previousTeamRef = useRef<string | null>(null);
  
  // Set up cleanup function
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Fetch initial data
  useEffect(() => {
    if (!isDataMigrated) {
      console.log("Data not migrated yet, skipping metadata fetch");
      setIsLoading(false);
      return;
    }
    
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching metadata, isDataMigrated:", isDataMigrated);
        
        // Fetch all metadata in parallel
        const results = await Promise.allSettled([
          fetchTactics(),
          fetchTeams(),
          fetchDates()
        ]);
        
        // Prevent state updates if component is unmounted
        if (!isMountedRef.current) return;
        
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
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };
    
    loadInitialData();
  }, [isDataMigrated]);

  // Fetch people based on selected team
  useEffect(() => {
    // Skip if team hasn't changed
    if (previousTeamRef.current === selectedTeam) {
      return;
    }
    
    // Update previous team ref
    previousTeamRef.current = selectedTeam;
    
    // Early return if conditions aren't met
    if (!isDataMigrated || !selectedTeam) {
      if (!selectedTeam && isMountedRef.current) {
        setFilteredPeople([]);
      }
      return;
    }
    
    const loadPeopleByTeam = async () => {
      try {
        setIsLoading(true);
        console.log("Loading people for team:", selectedTeam);
        
        const people = await fetchPeopleByTeam(selectedTeam);
        
        if (isMountedRef.current) {
          console.log("People loaded:", people);
          setFilteredPeople(people || []);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error loading people by team:", err);
        if (isMountedRef.current) {
          setFilteredPeople([]);
          setIsLoading(false);
        }
      }
    };
    
    loadPeopleByTeam();
  }, [selectedTeam, isDataMigrated]);

  return {
    tactics,
    teams,
    filteredPeople,
    availableDates,
    isLoading
  };
};
