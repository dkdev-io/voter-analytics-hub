
import { useState, useEffect } from "react";
import { type QueryParams } from "@/types/analytics";

interface UseQueryBuilderProps {
  query: Partial<QueryParams>;
  setQuery: React.Dispatch<React.SetStateAction<Partial<QueryParams>>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export const useQueryBuilder = ({
  query,
  setQuery,
  setError,
}: UseQueryBuilderProps) => {
  // Ensure query is never undefined
  const safeQuery = query || {};

  // Default to null if team is undefined or "All"
  const [selectedTeam, setSelectedTeam] = useState<string | null>(
    safeQuery.team && safeQuery.team !== "All" ? safeQuery.team : null,
  );

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

  return {
    selectedTeam,
    handleDateSelect,
    handleEndDateSelect,
    handleTeamChange,
    handlePersonChange,
    handleTacticChange,
    handleResultTypeChange,
  };
};
