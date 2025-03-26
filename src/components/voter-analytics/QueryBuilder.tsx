import { useState, useEffect } from "react";
import { type QueryParams } from "@/types/analytics";
import { useMetadata } from "@/hooks/use-metadata";
import { TacticSelector } from "./TacticSelector";
import { ResultTypeSelector } from "./ResultTypeSelector";
import { TeamSelector } from "./TeamSelector";
import { PersonSelector } from "./PersonSelector";
import { DateSelector } from "./DateSelector";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

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
  // Ensure query is never undefined
  const safeQuery = query || {};

  // Default to null if team is undefined or "All"
  const [selectedTeam, setSelectedTeam] = useState<string | null>(
    safeQuery.team && safeQuery.team !== "All" ? safeQuery.team : null,
  );

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

  // const isLoading = parentIsLoading || metadataIsLoading;

  // Update selectedTeam when query.team changes
  useEffect(() => {
    // Only set selectedTeam if query.team exists and is different from current selectedTeam
    if (safeQuery.team !== undefined) {
      const newTeam = safeQuery.team === "All" ? null : safeQuery.team;
      if (newTeam !== selectedTeam) {
        console.log(`Updating selectedTeam from query: ${safeQuery.team}`);
        setSelectedTeam(newTeam);
      }
    }
  }, [safeQuery.team, selectedTeam]);

  // Clear person selection when team changes
  // useEffect(() => {
  //   setQuery((prev) => {
  //     const newQuery = { ...prev };
  //     // Only reset person when team changes and is different from the current query team
  //     if (selectedTeam !== prev.team && (selectedTeam || prev.team !== "All")) {
  //       console.log(
  //         `Team changed from ${prev.team} to ${selectedTeam}, resetting person selection`,
  //       );
  //       delete newQuery.person;
  //     }
  //     return {
  //       ...newQuery,
  //       team: selectedTeam || "All",
  //     };
  //   });
  // }, [selectedTeam, setQuery]);

  const handleDateSelect = (value: string) => {
    console.log("Start date selected:", value);
    setQuery((prev) => ({ ...prev, date: value }));
    setError(null);
  };

  const handleEndDateSelect = (value: string) => {
    console.log("End date selected:", value);
    setQuery((prev) => ({ ...prev, endDate: value }));
    setError(null);
  };

  const handleTeamChange = (value: string) => {
    console.log("Team selected:", value);
    const teamValue = value === "All" ? null : value;
    setSelectedTeam(teamValue);
    setQuery((prev) => ({ ...prev, team: value }));
    setError(null);
  };

  const handlePersonChange = (value: string) => {
    console.log("Person selected:", value);
    setQuery((prev) => ({ ...prev, person: value }));
    setError(null);
  };

  const handleTacticChange = (value: string) => {
    console.log("Tactic selected:", value);
    setQuery((prev) => ({ ...prev, tactic: value }));
    setError(null);
  };

  const handleResultTypeChange = (value: string) => {
    console.log("Result type selected:", value);
    setQuery((prev) => ({ ...prev, resultType: value }));
    setError(null);
  };

  // console.log("QueryBuilder state:", {
  //   selectedTeam,
  //   teamsCount: teams.length,
  //   filteredPeopleCount: filteredPeople.length,
  //   allPeopleCount: allPeople.length,
  //   availableDatesCount: availableDates.length,
  //   dates: availableDates.slice(0, 5),
  //   people: filteredPeople.slice(0, 5),
  //   query: safeQuery,
  //   isLoading,
  // });

  return (
    <ScrollArea className="pr-4 max-h-[calc(100vh-350px)]">
      <div className="space-y-6">
        {/* First row: Show + Tactic + Metric all as stacked items */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-700 block">Show</span>
          <div className="flex flex-col gap-2">
            <TacticSelector
              value={safeQuery.tactic}
              onChange={handleTacticChange}
              tactics={tactics}
              isLoading={isLoading}
            />
            <ResultTypeSelector
              value={safeQuery.resultType}
              onChange={handleResultTypeChange}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Second row: By + Team + Person all as stacked items */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-700 block">By</span>
          <div className="flex flex-col gap-2">
            <TeamSelector
              value={selectedTeam}
              onChange={handleTeamChange}
              teams={teams}
              isLoading={isLoading}
            />
            <PersonSelector
              value={safeQuery.person}
              onChange={handlePersonChange}
              people={filteredPeople}
              disabled={false}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Third row: Date range as stacked items */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-700 block">
            Time Period
          </span>
          <div className="flex flex-col gap-2">
            <DateSelector
              value={safeQuery.date}
              onChange={handleDateSelect}
              availableDates={availableDates}
              isLoading={isLoading}
              label="Start Date"
              placeholder="Select Start Date"
            />

            <DateSelector
              value={safeQuery.endDate}
              onChange={handleEndDateSelect}
              availableDates={availableDates}
              isLoading={isLoading}
              label="End Date"
              placeholder="Select End Date"
            />
          </div>
        </div>

        {/* Render the submit button after date selectors */}
        {renderSubmitButton && renderSubmitButton()}
      </div>
    </ScrollArea>
  );
};
