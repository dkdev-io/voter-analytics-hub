
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PersonSelectorProps {
  value: string | undefined;
  onChange: (value: string) => void;
  people: string[];
  disabled: boolean;
  isLoading: boolean;
}

export const PersonSelector = ({ 
  value, 
  onChange, 
  people, 
  disabled, 
  isLoading 
}: PersonSelectorProps) => {
  return (
    <div className="inline-block min-w-[180px]">
      <Select
        value={value}
        onValueChange={onChange}
        disabled={isLoading}
      >
        <SelectTrigger className="min-w-[180px]">
          <SelectValue placeholder={isLoading ? "Loading..." : "Select Individual"} />
        </SelectTrigger>
        <SelectContent 
          className="max-h-[300px] overflow-y-auto bg-white z-50"
          position="popper"
          sideOffset={5}
          align="start"
        >
          <SelectItem value="All">All Members</SelectItem>
          {people && people.length > 0 ? (
            people.map((person: string) => (
              <SelectItem key={person} value={person}>
                {person}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-data" disabled>
              {isLoading ? "Loading people..." : "No data in database yet"}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
