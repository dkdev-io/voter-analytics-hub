
import { QueryBuilder } from "../QueryBuilder";

interface QuerySectionProps {
  query: any;
  setQuery: (query: any) => void;
  setError: (error: string | null) => void;
  isLoading: boolean;
  isDataMigrated: boolean;
  onRefresh?: () => Promise<void>;
}

export function QuerySection({
  query,
  setQuery,
  setError,
  isLoading,
  isDataMigrated,
  onRefresh
}: QuerySectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <QueryBuilder
        query={query || {}} // Ensure query is never undefined
        setQuery={setQuery}
        setError={setError}
        isLoading={isLoading}
        isDataMigrated={isDataMigrated}
        onRefresh={onRefresh}
      />
    </div>
  );
}
