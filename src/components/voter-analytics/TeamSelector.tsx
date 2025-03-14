
import React, { useCallback } from "react";
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
  // When value is null, we'll use empty string for comparison
  const currentValue = value || "";
  
  console.log("TeamSelector rendering with value:", value);
  
  // Memoize the change handler with strict equality check
  const handleChange = useCallback((newValue: string) => {
    // Only call onChange if the value has actually changed
    // This prevents unnecessary re-renders
    if (newValue !== currentValue) {
      console.log(`TeamSelector: Value changed from "${currentValue}" to "${newValue}"`);
      onChange(newValue);
    } else {
      console.log(`TeamSelector: Skipping update - value unchanged "${currentValue}"`);
    }
  }, [onChange, currentValue]);
  
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
