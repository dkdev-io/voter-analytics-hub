
import { useState, useEffect } from 'react';
import { format } from "date-fns";
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
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  
  // Use our custom hook to fetch metadata
  const { tactics, teams, filteredPeople, allPeople, availableDates, isLoading: metadataIsLoading } = useMetadata(isDataMigrated, selectedTeam);
  
  const isLoading = parentIsLoading || metadataIsLoading;

  // Clear person selection when team changes
  useEffect(() => {
    if (selectedTeam) {
      setQuery(prev => {
        const newQuery = { ...prev };
        delete newQuery.person;
        return newQuery;
      });
    }
  }, [selectedTeam, setQuery]);

  const handleDateSelect = (value: string) => {
    setQuery(prev => ({ ...prev, date: value }));
    setError(null);
  };

  const handleTeamChange = (value: string) => {
    setSelectedTeam(value === "All" ? null : value);
    setQuery(prev => ({ ...prev, team: value }));
    setError(null);
  };

  const handlePersonChange = (value: string) => {
    setQuery(prev => ({ ...prev, person: value }));
    setError(null);
  };

  const handleTacticChange = (value: string) => {
    setQuery(prev => ({ ...prev, tactic: value }));
    setError(null);
  };

  const handleResultTypeChange = (value: string) => {
    setQuery(prev => ({ ...prev, resultType: value }));
    setError(null);
  };

  // Determine which people list to use - if a team is selected, use filtered people, otherwise use all people
  const peopleToShow = selectedTeam ? filteredPeople : allPeople;

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
          people={peopleToShow}
          disabled={false}
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
