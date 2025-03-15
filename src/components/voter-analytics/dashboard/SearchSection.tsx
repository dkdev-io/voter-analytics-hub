
import React from 'react';
import { SearchField } from '../SearchField';

interface SearchSectionProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  isLoading, 
  onSubmit 
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Search Records</h2>
      <SearchField 
        value={searchQuery}
        onChange={setSearchQuery}
        isLoading={isLoading}
        onSubmit={onSubmit}
      />
    </div>
  );
};
