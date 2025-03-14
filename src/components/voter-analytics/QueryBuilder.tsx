
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
  // Use query.team directly without duplicating state
  // This eliminates a major source of the infinite re-render issue
  
  // Use our custom hook to fetch metadata - pass query.team directly 
  const { tactics, teams, filteredPeople, availableDates, isLoading: metadataIsLoading } = useMetadata(isDataMigrated, query.team || null);
  
  const isLoading = parentIsLoading || metadataIsLoading;

  // Memoize the team change handler
  const handleTeamChange = useCallback((value: string) => {
    // Update query with team change and remove person in one update
    setQuery(prev => {
      // Only update if there's an actual change
      if (value === prev.team) {
        return prev;
      }
      
      const newQuery = { ...prev, team: value };
      // Reset person when team changes
      delete newQuery.person;
      return newQuery;
    });
    
    setError(null);
  }, [setQuery, setError]);

  // Memoize handlers to prevent recreating functions on each render
  const handleDateSelect = useCallback((value: string) => {
    setQuery(prev => {
      if (prev.date === value) return prev;
      return { ...prev, date: value };
    });
    setError(null);
  }, [setQuery, setError]);

  const handlePersonChange = useCallback((value: string) => {
    setQuery(prev => {
      if (prev.person === value) return prev;
      return { ...prev, person: value };
    });
    setError(null);
  }, [setQuery, setError]);

  const handleTacticChange = useCallback((value: string) => {
    setQuery(prev => {
      if (prev.tactic === value) return prev;
      return { ...prev, tactic: value };
    });
    setError(null);
  }, [setQuery, setError]);

  const handleResultTypeChange = useCallback((value: string) => {
    setQuery(prev => {
      if (prev.resultType === value) return prev;
      return { ...prev, resultType: value };
    });
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
          value={query.team || null}
          onChange={handleTeamChange}
          teams={teams}
          isLoading={isLoading}
        />
        
        <PersonSelector 
          value={query.person}
          onChange={handlePersonChange}
          people={filteredPeople}
          disabled={!query.team}
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
