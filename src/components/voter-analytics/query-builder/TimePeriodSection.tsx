
import { DateSelector } from "../DateSelector";

interface TimePeriodSectionProps {
  query: Partial<any>;
  isLoading: boolean;
  onDateSelect: (value: string) => void;
  onEndDateSelect: (value: string) => void;
  availableDates: string[];
}

export const TimePeriodSection = ({
  query,
  isLoading,
  onDateSelect,
  onEndDateSelect,
  availableDates,
}: TimePeriodSectionProps) => {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-gray-700 block">
        Time Period
      </span>
      <div className="flex flex-col gap-2">
        <DateSelector
          value={query.date}
          onChange={onDateSelect}
          availableDates={availableDates}
          isLoading={isLoading}
          label="Start Date"
          placeholder="Select Start Date"
        />

        <DateSelector
          value={query.endDate}
          onChange={onEndDateSelect}
          availableDates={availableDates}
          isLoading={isLoading}
          label="End Date"
          placeholder="Select End Date"
        />
      </div>
    </div>
  );
};
