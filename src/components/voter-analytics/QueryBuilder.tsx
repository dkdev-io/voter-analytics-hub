
import { useState, useEffect, useCallback, useRef } from 'react';
import { type QueryParams } from '@/types/analytics';
import { useMetadata } from '@/hooks/use-metadata';
import { TacticSelector } from './TacticSelector';
import { ResultTypeSelector } from './ResultTypeSelector';
import { TeamSelector } from './TeamSelector';
import { PersonSelector } from './PersonSelector';
import { DateSelector } from './DateSelector';

interface QueryBuilderProps {
  query: Partial<QueryParams>;
  setQuery: React.Dispatch<React.SetStateAction<Partial<QueryParams>>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  isLoading: boolean;
  isDataMigrated: boolean;
}

export const QueryBuilder = ({ 
  query, 
  setQuery, 
  setError,
  isLoading: parentIsLoading,
  isDataMigrated 
}: QueryBuilderProps) => {
  // Track previous team to prevent unnecessary updates
  const prevTeamRef = useRef<string | null>(query.team || null);
  
  // Initialize selectedTeam with query.team if it exists, otherwise null
  const [selectedTeam, setSelectedTeam] = useState<string | null>(query.team || null);
  
  // Use our custom hook to fetch metadata
  const { tactics, teams, filteredPeople, availableDates, isLoading: metadataIsLoading } = useMetadata(isDataMigrated, selectedTeam);
  
  const isLoading = parentIsLoading || metadataIsLoading;

  // Handle team changes - this is a critical path that could cause infinite loops
  const handleTeamChange = useCallback((value: string) => {
    // Only update if the team has actually changed
    if (value !== prevTeamRef.current) {
      prevTeamRef.current = value;
      setSelectedTeam(value);
      
      // Update query with team change and remove person
      setQuery(prev => {
        const newQuery = { ...prev, team: value };
        delete newQuery.person;
        return newQuery;
      });
      
      setError(null);
    }
  }, [setQuery, setError]);

  // Clear person selection when team changes - removed since we handle this in handleTeamChange
  
  // Memoize handlers to prevent recreating functions on each render
  const handleDateSelect = useCallback((value: string) => {
    setQuery(prev => ({ ...prev, date: value }));
    setError(null);
  }, [setQuery, setError]);

  const handlePersonChange = useCallback((value: string) => {
    setQuery(prev => ({ ...prev, person: value }));
    setError(null);
  }, [setQuery, setError]);

  const handleTacticChange = useCallback((value: string) => {
    setQuery(prev => ({ ...prev, tactic: value }));
    setError(null);
  }, [setQuery, setError]);

  const handleResultTypeChange = useCallback((value: string) => {
    setQuery(prev => ({ ...prev, resultType: value }));
    setError(null);
  }, [setQuery, setError]);

  return (
    <div className="space-y-6">
      <div className="text-lg text-gray-700 flex flex-wrap items-center gap-2">
        <span>I want to know how many</span>
        
        <TacticSelector 
          value={query.tactic}
          onChange={handleTacticChange}
          tactics={tactics}
          isLoading={isLoading}
        />
        
        <ResultTypeSelector 
          value={query.resultType}
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
          value={query.person}
          onChange={handlePersonChange}
          people={filteredPeople}
          disabled={!selectedTeam}
          isLoading={isLoading}
        />
        
        <span>on</span>
        
        <DateSelector 
          value={query.date}
          onChange={handleDateSelect}
          availableDates={availableDates}
          isLoading={isLoading}
        />
        
        <span>.</span>
      </div>
    </div>
  );
};
