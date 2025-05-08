
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DateSelectorProps {
  value: string | undefined;
  onChange: (value: string) => void;
  availableDates: string[];
  isLoading: boolean;
  label?: string;
  placeholder?: string;
}

export const DateSelector = ({ 
  value, 
  onChange,
  availableDates,
  isLoading,
  label = "Date",
  placeholder = "Select Date"
}: DateSelectorProps) => {
  // Get unique dates and sort them chronologically
  const uniqueDates = [...new Set(availableDates)].sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });
  
  // Ensure value is a string, not undefined
  const safeValue = value || "All";
  
  return (
    <div className="w-full">
      <Select
        value={safeValue}
        onValueChange={onChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
        </SelectTrigger>
        <SelectContent 
          className="max-h-[300px] overflow-y-auto bg-white z-50"
          position="popper"
          sideOffset={5}
          side="bottom"
          align="start"
        >
          <SelectItem value="All">{label === "Start Date" ? "All Dates" : "No End Date"}</SelectItem>
          {uniqueDates && uniqueDates.length > 0 ? (
            uniqueDates.map((dateValue: string) => (
              <SelectItem key={dateValue} value={dateValue || "unknown-date"}>
                {dateValue || "Unknown Date"}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-data">
              {isLoading ? "Loading dates..." : "No dates available"}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
