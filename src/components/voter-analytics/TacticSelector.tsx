
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TacticSelectorProps {
  value: string | undefined;
  onChange: (value: string) => void;
  tactics: string[];
  isLoading: boolean;
}

export const TacticSelector = ({ 
  value, 
  onChange, 
  tactics, 
  isLoading 
}: TacticSelectorProps) => {
  return (
    <div className="inline-block min-w-[150px]">
      <Select
        value={value}
        onValueChange={onChange}
        disabled={isLoading}
      >
        <SelectTrigger className="min-w-[150px]">
          <SelectValue placeholder={isLoading ? "Loading..." : "Select Tactic"} />
        </SelectTrigger>
        <SelectContent className="bg-white z-50 max-h-[300px] overflow-y-auto">
          <SelectItem value="All">All Tactics</SelectItem>
          {tactics && tactics.length > 0 ? (
            tactics.map(tactic => (
              <SelectItem key={tactic} value={tactic}>
                {tactic}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-data" disabled>
              {isLoading ? "Loading..." : "No data in database yet"}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
