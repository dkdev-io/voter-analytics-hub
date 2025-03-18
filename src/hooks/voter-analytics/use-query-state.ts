
import { useState } from 'react';
import { type QueryParams } from '@/types/analytics';

export const useQueryState = () => {
  const [query, setQuery] = useState<Partial<QueryParams>>({});
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilteredData, setShowFilteredData] = useState(false);

  return {
    query,
    setQuery,
    error,
    setError,
    result,
    setResult,
    searchQuery,
    setSearchQuery,
    showFilteredData,
    setShowFilteredData
  };
};
