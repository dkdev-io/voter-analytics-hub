
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  // Use useCallback to prevent creating new function references on each render
  const handleChange = (newValue: string) => {
    if (newValue !== value) {
      onChange(newValue);
    }
  };
  
  return (
    <div className="inline-block min-w-[180px]">
      <Select
        value={value || undefined}
        onValueChange={handleChange}
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
          {teams && teams.length > 0 ? (
            teams.map(team => (
              <SelectItem key={team} value={team}>
                {team}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-data" disabled>
              {isLoading ? "Loading teams..." : "No teams found"}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
