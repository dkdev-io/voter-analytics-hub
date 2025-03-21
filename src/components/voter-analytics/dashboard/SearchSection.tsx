
import { SearchField } from '../SearchField';
import { QueryParams } from '@/types/analytics';

interface SearchSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
  setQuery?: (query: Partial<QueryParams>) => void;
}

export function SearchSection({
  searchQuery,
  setSearchQuery,
  isLoading,
  onSubmit,
  setQuery
}: SearchSectionProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-600 mb-2">
        Ask a question below about your voter contact data.
      </p>
      
      <SearchField
        value={searchQuery}
        onChange={setSearchQuery}
        isLoading={isLoading}
        onSubmit={onSubmit}
        setQuery={setQuery}
      />
    </div>
  );
}
