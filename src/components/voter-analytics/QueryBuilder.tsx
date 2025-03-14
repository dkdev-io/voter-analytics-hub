
import { useCallback, useRef } from 'react';
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
  console.log("QueryBuilder rendering with query:", query);
  
  // Add a render counter for debugging
  const renderCount = useRef(0);
  renderCount.current++;
  console.log(`QueryBuilder render #${renderCount.current}`);
  
  // Use our custom hook to fetch metadata - pass query.team directly 
  const { tactics, teams, filteredPeople, availableDates, isLoading: metadataIsLoading } = useMetadata(isDataMigrated, query.team || null);
  
  const isLoading = parentIsLoading || metadataIsLoading;

  // Memoize the team change handler
  const handleTeamChange = useCallback((value: string) => {
    console.log("QueryBuilder: Team changed to:", value, "current:", query.team);
    
    // Skip if no actual change to prevent re-renders
    if (value === query.team) {
      console.log("QueryBuilder: Team value unchanged, skipping update");
      return;
    }
    
    // Update query with team change and remove person in one update
    setQuery(prev => {
      // Create a new query object to trigger state update
      const newQuery = { ...prev, team: value };
      
      // Reset person when team changes
      if (prev.person) {
        delete newQuery.person;
      }
      
      console.log("QueryBuilder: Setting new query", newQuery);
      return newQuery;
    });
    
    setError(null);
  }, [setQuery, setError, query.team]);

  // Memoize handlers to prevent recreating functions on each render
  const handleDateSelect = useCallback((value: string) => {
    if (value === query.date) return;
    
    setQuery(prev => ({ ...prev, date: value }));
    setError(null);
  }, [setQuery, setError, query.date]);

  const handlePersonChange = useCallback((value: string) => {
    if (value === query.person) return;
    
    setQuery(prev => ({ ...prev, person: value }));
    setError(null);
  }, [setQuery, setError, query.person]);

  const handleTacticChange = useCallback((value: string) => {
    if (value === query.tactic) return;
    
    setQuery(prev => ({ ...prev, tactic: value }));
    setError(null);
  }, [setQuery, setError, query.tactic]);

  const handleResultTypeChange = useCallback((value: string) => {
    if (value === query.resultType) return;
    
    setQuery(prev => ({ ...prev, resultType: value }));
    setError(null);
  }, [setQuery, setError, query.resultType]);

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
