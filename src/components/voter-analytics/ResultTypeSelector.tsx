
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RESULT_TYPES } from '@/types/analytics';

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
  return (
    <div className="inline-block min-w-[150px]">
      <Select
        value={value}
        onValueChange={onChange}
        disabled={isLoading}
      >
        <SelectTrigger className="min-w-[150px]">
          <SelectValue placeholder={<span className="font-bold">Select Metric</span>} />
        </SelectTrigger>
        <SelectContent className="bg-white z-50">
          {RESULT_TYPES.map(type => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
