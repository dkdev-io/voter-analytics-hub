
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
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <SearchField
        value={searchQuery}
        onChange={setSearchQuery}
        isLoading={isLoading}
        onSubmit={onSubmit}
      />
    </div>
  );
}
