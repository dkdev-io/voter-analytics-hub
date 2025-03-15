
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
        
        console.log("Loading initial metadata...");
        
        // Fetch all metadata in parallel for better performance
        const [tacticsResult, teamsResult, datesResult, allPeopleResult] = await Promise.all([
          fetchTactics(),
          fetchTeams(),
          fetchDates(),
          fetchAllPeople()
        ]);
        
        console.log("Initial data loaded:", {
          tactics: tacticsResult?.length || 0,
          teams: teamsResult?.length || 0,
          dates: datesResult?.length || 0,
          allPeople: allPeopleResult?.length || 0
        });
        
        // Set state with fetched data
        setTactics(tacticsResult || []);
        setTeams(teamsResult || []);
        setAvailableDates(datesResult || []);
        setAllPeople(allPeopleResult || []);
        
        // Initialize filteredPeople with all people when no team is selected
        if (!selectedTeam || selectedTeam === "All") {
          setFilteredPeople(allPeopleResult || []);
        }
      } catch (err) {
        console.error("Error loading initial data:", err);
        // Set fallback values if fetch fails
        setTactics(["SMS", "Phone", "Canvas"]);
        setTeams(["Team Tony", "Team Maria", "Team John"]);
        setAvailableDates(["2025-01-01", "2025-01-02", "2025-01-03"]);
        const fallbackPeople = ["John Smith", "Jane Doe", "Alex Johnson", "Maria Martinez", "Chris Brown"];
        setAllPeople(fallbackPeople);
        setFilteredPeople(fallbackPeople);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, [isDataMigrated]);

  // Fetch people based on selected team
  useEffect(() => {
    const loadPeopleByTeam = async () => {
      if (!isDataMigrated) return;
      
      try {
        // Don't set loading to true here to avoid UI flicker when switching teams
        console.log(`Loading people for team: ${selectedTeam || "All"}`);
        
        if (selectedTeam && selectedTeam !== "All") {
          // If a specific team is selected, fetch people from that team
          const teamPeople = await fetchPeopleByTeam(selectedTeam);
          console.log(`Loaded ${teamPeople?.length || 0} people for team ${selectedTeam}`);
          setFilteredPeople(teamPeople || []);
        } else {
          // If "All" is selected or no team is selected, use allPeople
          // Only fetch again if allPeople is empty
          if (allPeople.length === 0) {
            console.log("No cached people data, fetching all people...");
            const allPeopleData = await fetchAllPeople();
            console.log(`Loaded ${allPeopleData?.length || 0} people (all teams)`);
            setFilteredPeople(allPeopleData || []);
            setAllPeople(allPeopleData || []);
          } else {
            console.log(`Using ${allPeople.length} cached people for all teams`);
            setFilteredPeople(allPeople);
          }
        }
      } catch (err) {
        console.error("Error loading people by team:", err);
        // Fallback to at least showing something
        const fallbackPeople = ["John Smith", "Jane Doe", "Alex Johnson", "Maria Martinez", "Chris Brown"];
        setFilteredPeople(fallbackPeople);
      }
    };
    
    loadPeopleByTeam();
  }, [selectedTeam, isDataMigrated, allPeople]);

  return {
    tactics,
    teams,
    filteredPeople,
    allPeople,
    availableDates,
    isLoading
  };
};
