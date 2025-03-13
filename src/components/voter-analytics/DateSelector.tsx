
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
  return (
    <div className="inline-block min-w-[180px]">
      <Select
        value={value}
        onValueChange={onChange}
        disabled={isLoading}
      >
        <SelectTrigger className="min-w-[180px]">
          <SelectValue placeholder={<span className="font-bold">Select Date</span>} />
        </SelectTrigger>
        <SelectContent 
          className="max-h-[300px] overflow-y-auto bg-white z-50"
          position="popper"
          sideOffset={5}
          align="start"
        >
          <SelectItem value="All">All Dates</SelectItem>
          {availableDates.length > 0 ? (
            availableDates.map((dateValue: string) => (
              <SelectItem key={dateValue} value={dateValue}>
                {dateValue}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-data" disabled>No data available</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
