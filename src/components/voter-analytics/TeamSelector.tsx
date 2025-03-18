
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
  
  return (
    <div className="inline-block min-w-[180px]">
      <Select
        value={value || "All"}
        onValueChange={onChange}
        disabled={isLoading}
      >
        <SelectTrigger className="min-w-[180px]">
          <SelectValue placeholder={isLoading ? "Loading..." : "Select Team"} />
        </SelectTrigger>
        <SelectContent 
          className="max-h-[300px] overflow-y-auto bg-white z-50"
          position="popper"
          sideOffset={5}
          align="start"
        >
          <SelectItem value="All">All Teams</SelectItem>
          {teams.length > 0 ? (
            teams.map(team => (
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
