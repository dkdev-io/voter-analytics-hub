
import { SearchField } from "../SearchField";

interface SearchSectionProps {
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
  setQuery: any;
  setShowFilteredData?: (show: boolean) => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  searchQuery,
  setSearchQuery,
  isLoading,
  onSubmit,
  setQuery,
  setShowFilteredData
}) => {
  return (
    <div>
      <SearchField
        value={searchQuery}
        onChange={setSearchQuery}
        isLoading={isLoading}
        onSubmit={onSubmit}
        setQuery={setQuery}
        setShowFilteredData={setShowFilteredData}
      />
    </div>
  );
};
