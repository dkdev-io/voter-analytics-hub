
import { SearchField } from '../SearchField';

interface SearchSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
}

export function SearchSection({
  searchQuery,
  setSearchQuery,
  isLoading,
  onSubmit
}: SearchSectionProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-600 mb-2">
        Ask a question about your voter data and get AI-powered insights.
      </p>
      
      <SearchField
        value={searchQuery}
        onChange={setSearchQuery}
        isLoading={isLoading}
        onSubmit={onSubmit}
      />
    </div>
  );
}
