
import { useState, useEffect } from 'react';
import { type QueryParams } from '@/types/analytics';
import { useMetadata } from '@/hooks/use-metadata';
import { TacticSelector } from './TacticSelector';
import { ResultTypeSelector } from './ResultTypeSelector';
import { TeamSelector } from './TeamSelector';
import { PersonSelector } from './PersonSelector';
import { DateSelector } from './DateSelector';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface QueryBuilderProps {
  query: Partial<QueryParams>;
  setQuery: React.Dispatch<React.SetStateAction<Partial<QueryParams>>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  isLoading: boolean;
  isDataMigrated: boolean;
  onRefresh?: () => Promise<void>;
}

export const QueryBuilder = ({ 
  query = {}, // Default value
  setQuery, 
  setError,
  isLoading: parentIsLoading,
  isDataMigrated,
  onRefresh
}: QueryBuilderProps) => {
  // Ensure query is never undefined
  const safeQuery = query || {};
  
  // Default to null if team is undefined or "All"
  const [selectedTeam, setSelectedTeam] = useState<string | null>(
    safeQuery.team && safeQuery.team !== "All" ? safeQuery.team : null
  );
  
  // Use our custom hook to fetch metadata
  const { 
    tactics, 
    teams, 
    filteredPeople, 
    allPeople, 
    availableDates, 
    isLoading: metadataIsLoading,
    refreshMetadata
  } = useMetadata(isDataMigrated, selectedTeam);
  
  const isLoading = parentIsLoading || metadataIsLoading;

  // Update selectedTeam when query.team changes
  useEffect(() => {
    // Only set selectedTeam if query.team exists and is different from current selectedTeam
    if (safeQuery.team !== undefined) {
      const newTeam = safeQuery.team === "All" ? null : safeQuery.team;
      if (newTeam !== selectedTeam) {
        console.log(`Updating selectedTeam from query: ${safeQuery.team}`);
        setSelectedTeam(newTeam);
      }
    }
  }, [safeQuery.team, selectedTeam]);

  // Clear person selection when team changes
  useEffect(() => {
    setQuery(prev => {
      const newQuery = { ...prev };
      // Only reset person when team changes and is different from the current query team
      if (selectedTeam !== prev.team && (selectedTeam || prev.team !== "All")) {
        console.log(`Team changed from ${prev.team} to ${selectedTeam}, resetting person selection`);
        delete newQuery.person;
      }
      return {
        ...newQuery,
        team: selectedTeam || "All"
      };
    });
  }, [selectedTeam, setQuery]);

  const handleDateSelect = (value: string) => {
    console.log("Date selected:", value);
    setQuery(prev => ({ ...prev, date: value }));
    setError(null);
  };

  const handleTeamChange = (value: string) => {
    console.log("Team selected:", value);
    const teamValue = value === "All" ? null : value;
    setSelectedTeam(teamValue);
    setQuery(prev => ({ ...prev, team: value }));
    setError(null);
  };

  const handlePersonChange = (value: string) => {
    console.log("Person selected:", value);
    setQuery(prev => ({ ...prev, person: value }));
    setError(null);
  };

  const handleTacticChange = (value: string) => {
    console.log("Tactic selected:", value);
    setQuery(prev => ({ ...prev, tactic: value }));
    setError(null);
  };

  const handleResultTypeChange = (value: string) => {
    console.log("Result type selected:", value);
    setQuery(prev => ({ ...prev, resultType: value }));
    setError(null);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
      await refreshMetadata();
    } finally {
      setIsLoading(false);
    }
  };

  console.log("QueryBuilder state:", {
    selectedTeam,
    teamsCount: teams.length,
    filteredPeopleCount: filteredPeople.length,
    allPeopleCount: allPeople.length,
    availableDatesCount: availableDates.length,
    dates: availableDates.slice(0, 5),
    people: filteredPeople.slice(0, 5),
    query: safeQuery,
    isLoading
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isLoading}
          className="text-xs"
        >
          <RefreshCw className="mr-1 h-3 w-3" />
          Refresh Data
        </Button>
      </div>
      
      <div className="text-lg text-gray-700 flex flex-wrap items-center gap-2">
        <span>I want to know how many</span>
        
        <TacticSelector 
          value={safeQuery.tactic}
          onChange={handleTacticChange}
          tactics={tactics}
          isLoading={isLoading}
        />
        
        <ResultTypeSelector 
          value={safeQuery.resultType}
          onChange={handleResultTypeChange}
          isLoading={isLoading}
        />
        
        <span>were done by</span>
        
        <TeamSelector 
          value={selectedTeam}
          onChange={handleTeamChange}
          teams={teams}
          isLoading={isLoading}
        />
        
        <PersonSelector 
          value={safeQuery.person}
          onChange={handlePersonChange}
          people={filteredPeople}
          disabled={false}
          isLoading={isLoading}
        />
        
        <span>on</span>
        
        <DateSelector 
          value={safeQuery.date}
          onChange={handleDateSelect}
          availableDates={availableDates}
          isLoading={isLoading}
        />
        
        <span>.</span>
      </div>
    </div>
  );
};
