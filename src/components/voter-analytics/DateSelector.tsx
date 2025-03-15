
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DateSelectorProps {
  value: string | undefined;
  onChange: (value: string) => void;
  availableDates: string[];
  isLoading: boolean;
}

export const DateSelector = ({ 
  value, 
  onChange,
  availableDates,
  isLoading 
}: DateSelectorProps) => {
  // Get unique dates and sort them chronologically
  const uniqueDates = [...new Set(availableDates)].sort();
  
  console.log("DateSelector rendering with:", { 
    value, 
    availableDatesCount: uniqueDates?.length, 
    firstFewDates: uniqueDates?.slice(0, 3),
    isLoading 
  });
  
  return (
    <div className="inline-block min-w-[180px]">
      <Select
        value={value || "All"}
        onValueChange={onChange}
        disabled={isLoading}
      >
        <SelectTrigger className="min-w-[180px]">
          <SelectValue placeholder={isLoading ? "Loading..." : "Select Date"} />
        </SelectTrigger>
        <SelectContent 
          className="max-h-[300px] overflow-y-auto bg-white z-50"
          position="popper"
          sideOffset={5}
          align="start"
        >
          <SelectItem value="All">All Dates</SelectItem>
          {uniqueDates && uniqueDates.length > 0 ? (
            uniqueDates.map((dateValue: string) => (
              <SelectItem key={dateValue} value={dateValue}>
                {dateValue}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-data" disabled>
              {isLoading ? "Loading dates..." : "No dates available"}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
