
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RESULT_TYPES } from '@/types/analytics';
import { useEffect, useState } from 'react';

interface ResultTypeSelectorProps {
  value: string | undefined;
  onChange: (value: string) => void;
  isLoading: boolean;
}

export const ResultTypeSelector = ({ 
  value, 
  onChange, 
  isLoading 
}: ResultTypeSelectorProps) => {
  const [availableTypes, setAvailableTypes] = useState<string[]>(RESULT_TYPES);
  
  // When the component mounts or isLoading changes, ensure we have the latest result types
  useEffect(() => {
    // Ensure we have the complete list of result types
    if (!isLoading) {
      console.log("Available result types:", RESULT_TYPES);
      setAvailableTypes(RESULT_TYPES);
    }
  }, [isLoading]);

  return (
    <div className="w-full">
      <Select
        value={value || ""}
        onValueChange={onChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={isLoading ? "Loading..." : "Select Metric"} />
        </SelectTrigger>
        <SelectContent className="bg-white z-50">
          <SelectItem value="All">All Metrics</SelectItem>
          {availableTypes.map(type => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
