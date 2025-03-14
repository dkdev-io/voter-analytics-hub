
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

  // Fetch people based on selected team with strict equality check
  useEffect(() => {
    // Skip if conditions aren't met
    if (!isDataMigrated) return;
    
    // Convert null to empty string for comparison to avoid null !== null issues
    const prevTeam = previousTeamRef.current;
    const currentTeam = selectedTeam;
    
    // Skip if the team hasn't changed (strict equality)
    if (prevTeam === currentTeam) {
      console.log("useMetadata: Team unchanged, skipping people fetch", { prevTeam, currentTeam });
      return;
    }
    
    console.log("useMetadata: Team changed, updating people", { prevTeam, currentTeam });
    
    // Update previous team first to prevent duplicate calls
    previousTeamRef.current = currentTeam;
    
    // Clear people if no team is selected
    if (!currentTeam) {
      if (isMountedRef.current && filteredPeople.length > 0) {
        console.log("useMetadata: Clearing people list since no team selected");
        setFilteredPeople([]);
      }
      return;
    }
    
    const loadPeopleByTeam = async () => {
      // Only set loading if this isn't the first time or if we have previous people
      if (isMountedRef.current && (prevTeam !== null || filteredPeople.length > 0)) {
        setIsLoading(true);
      }
      
      try {
        console.log("Loading people for team:", currentTeam);
        const people = await fetchPeopleByTeam(currentTeam);
        
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
  }, [selectedTeam, isDataMigrated, filteredPeople.length]);

  return {
    tactics,
    teams,
    filteredPeople,
    availableDates,
    isLoading
  };
};
