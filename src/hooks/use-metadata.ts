
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
  
  // Use refs to track component mounted state and prevent unnecessary fetches
  const isMountedRef = useRef(true);
  const previousTeamRef = useRef<string | null>(null);
  const initialLoadCompletedRef = useRef(false);
  
  // Set up cleanup function
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Fetch initial data only once
  useEffect(() => {
    if (!isDataMigrated || initialLoadCompletedRef.current) {
      return;
    }
    
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching initial metadata, isDataMigrated:", isDataMigrated);
        
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
        
        initialLoadCompletedRef.current = true;
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

  // Fetch people based on selected team - with safeguards to prevent unnecessary fetches
  useEffect(() => {
    // Skip if the team hasn't changed or if it's the initial load
    if (previousTeamRef.current === selectedTeam) {
      return;
    }
    
    // Early return if conditions aren't met
    if (!isDataMigrated || !selectedTeam) {
      if (!selectedTeam && isMountedRef.current) {
        setFilteredPeople([]);
      }
      previousTeamRef.current = selectedTeam;
      return;
    }
    
    const loadPeopleByTeam = async () => {
      try {
        if (isMountedRef.current) {
          setIsLoading(true);
        }
        
        console.log("Loading people for team:", selectedTeam);
        const people = await fetchPeopleByTeam(selectedTeam);
        
        if (isMountedRef.current) {
          console.log("People loaded:", people);
          setFilteredPeople(people || []);
          setIsLoading(false);
          // Only update the previous team ref after successful fetch
          previousTeamRef.current = selectedTeam;
        }
      } catch (err) {
        console.error("Error loading people by team:", err);
        if (isMountedRef.current) {
          setFilteredPeople([]);
          setIsLoading(false);
          // Still update the ref to prevent repeated fetch attempts
          previousTeamRef.current = selectedTeam;
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
