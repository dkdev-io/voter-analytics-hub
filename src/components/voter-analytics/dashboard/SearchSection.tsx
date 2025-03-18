
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
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        Ask a question about your voter data and get AI-powered insights. For example, try asking about trends, performance comparisons, or specific metrics.
      </p>
      
      <SearchField
        value={searchQuery}
        onChange={setSearchQuery}
        isLoading={isLoading}
        onSubmit={onSubmit}
      />
      
      <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded text-sm text-blue-700">
        <p className="font-medium">Try these example questions:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>How many phone calls has Dan Kelly made?</li>
          <li>Show me Team Tony's canvas attempts in January</li>
          <li>Compare SMS vs Phone tactics performance</li>
        </ul>
      </div>
    </div>
  );
}
