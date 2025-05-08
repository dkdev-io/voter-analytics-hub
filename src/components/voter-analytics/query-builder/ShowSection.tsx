
import { TacticSelector } from "../TacticSelector";
import { ResultTypeSelector } from "../ResultTypeSelector";

interface ShowSectionProps {
  query: Partial<any>;
  isLoading: boolean;
  onTacticChange: (value: string) => void;
  onResultTypeChange: (value: string) => void;
  tactics: string[];
}

export const ShowSection = ({
  query,
  isLoading,
  onTacticChange,
  onResultTypeChange,
  tactics,
}: ShowSectionProps) => {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-gray-700 block">Show</span>
      <div className="flex flex-col gap-2">
        <TacticSelector
          value={query.tactic}
          onChange={onTacticChange}
          tactics={tactics}
          isLoading={isLoading}
        />
        <ResultTypeSelector
          value={query.resultType}
          onChange={onResultTypeChange}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
