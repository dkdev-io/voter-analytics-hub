
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";

interface TeamSelectorProps {
  value: string | null;
  onChange: (value: string) => void;
  teams: string[];
  isLoading: boolean;
}

export const TeamSelector = ({ 
  value, 
  onChange, 
  teams, 
  isLoading 
}: TeamSelectorProps) => {
  // Log the teams to debug
  useEffect(() => {
    console.log("TeamSelector received teams:", teams);
  }, [teams]);
  
  // Handle empty teams array - this ensures we always show expected values
  const displayTeams = teams.length > 0 ? teams : [];
  
  return (
    <div className="w-full">
      <Select
        value={value || "All"}
        onValueChange={onChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={isLoading ? "Loading..." : "Select Team"} />
        </SelectTrigger>
        <SelectContent 
          className="max-h-[300px] overflow-y-auto bg-white z-50"
          position="popper"
          sideOffset={5}
          align="start"
        >
          <SelectItem value="All">All Teams</SelectItem>
          {displayTeams.length > 0 ? (
            displayTeams.map(team => (
              <SelectItem key={team} value={team}>
                {team}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-data" disabled>
              {isLoading ? "Loading teams..." : "No team data available"}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
