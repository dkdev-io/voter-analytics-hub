
import React from 'react';
import { QueryBuilder } from '../QueryBuilder';
import { type QueryParams } from '@/types/analytics';

interface QuerySectionProps {
  query: Partial<QueryParams>;
  setQuery: React.Dispatch<React.SetStateAction<Partial<QueryParams>>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  isLoading: boolean;
  isDataMigrated: boolean;
}

export const QuerySection: React.FC<QuerySectionProps> = ({ 
  query, 
  setQuery, 
  setError, 
  isLoading, 
  isDataMigrated 
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Build Your Query</h2>
      <QueryBuilder 
        query={query}
        setQuery={setQuery}
        setError={setError}
        isLoading={isLoading}
        isDataMigrated={isDataMigrated}
      />
    </div>
  );
};
