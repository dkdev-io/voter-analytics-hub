
import { useEffect } from "react";
import { type QueryParams } from "@/types/analytics";
import { useMetadata } from "@/hooks/use-metadata";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQueryBuilder } from "@/hooks/voter-analytics/use-query-builder";
import { ShowSection } from "./query-builder/ShowSection";
import { BySection } from "./query-builder/BySection";
import { TimePeriodSection } from "./query-builder/TimePeriodSection";

interface QueryBuilderProps {
  query: Partial<QueryParams>;
  setQuery: React.Dispatch<React.SetStateAction<Partial<QueryParams>>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  isLoading: boolean;
  isDataMigrated: boolean;
  onRefresh?: () => Promise<void>;
  renderSubmitButton?: () => React.ReactNode;
}

export const QueryBuilder = ({
  query = {}, // Default value
  setQuery,
  setError,
  isLoading,
  isDataMigrated,
  onRefresh,
  renderSubmitButton,
}: QueryBuilderProps) => {
  // Use our custom hook to handle query building logic
  const {
    selectedTeam,
    handleDateSelect,
    handleEndDateSelect,
    handleTeamChange,
    handlePersonChange,
    handleTacticChange,
    handleResultTypeChange,
  } = useQueryBuilder({ query, setQuery, setError });

  // Use our custom hook to fetch metadata
  const {
    tactics,
    teams,
    filteredPeople,
    allPeople,
    availableDates,
    isLoading: metadataIsLoading,
    refreshMetadata,
  } = useMetadata(isDataMigrated, selectedTeam);

  // Log current state for debugging
  useEffect(() => {
    console.log("QueryBuilder state:", {
      selectedTeam,
      teamsCount: teams.length,
      filteredPeopleCount: filteredPeople.length,
      allPeopleCount: allPeople.length,
      availableDatesCount: availableDates.length,
      dates: availableDates.slice(0, 5),
      people: filteredPeople.slice(0, 5),
      query: query,
      isLoading,
    });
  }, [selectedTeam, teams, filteredPeople, allPeople, availableDates, query, isLoading]);

  return (
    <ScrollArea className="pr-4 max-h-[calc(100vh-350px)]">
      <div className="space-y-6">
        {/* Show section - Tactic and Metric selectors */}
        <ShowSection
          query={query}
          isLoading={isLoading}
          onTacticChange={handleTacticChange}
          onResultTypeChange={handleResultTypeChange}
          tactics={tactics}
        />

        {/* By section - Team and Person selectors */}
        <BySection
          selectedTeam={selectedTeam}
          query={query}
          isLoading={isLoading}
          onTeamChange={handleTeamChange}
          onPersonChange={handlePersonChange}
          teams={teams}
          filteredPeople={filteredPeople}
        />

        {/* Time Period section - Date selectors */}
        <TimePeriodSection
          query={query}
          isLoading={isLoading}
          onDateSelect={handleDateSelect}
          onEndDateSelect={handleEndDateSelect}
          availableDates={availableDates}
        />

        {/* Submit button */}
        {renderSubmitButton && renderSubmitButton()}
      </div>
    </ScrollArea>
  );
};
