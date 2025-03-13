
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
          <SelectValue placeholder={<span className="font-bold">Select Tactic</span>} />
        </SelectTrigger>
        <SelectContent className="bg-white z-50">
          <SelectItem value="All">All</SelectItem>
          {tactics.map(tactic => (
            <SelectItem key={tactic} value={tactic}>
              {tactic}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
