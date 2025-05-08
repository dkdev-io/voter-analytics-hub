
import { TeamSelector } from "../TeamSelector";
import { PersonSelector } from "../PersonSelector";

interface BySectionProps {
  selectedTeam: string | null;
  query: Partial<any>;
  isLoading: boolean;
  onTeamChange: (value: string) => void;
  onPersonChange: (value: string) => void;
  teams: string[];
  filteredPeople: string[];
}

export const BySection = ({
  selectedTeam,
  query,
  isLoading,
  onTeamChange,
  onPersonChange,
  teams,
  filteredPeople,
}: BySectionProps) => {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-gray-700 block">By</span>
      <div className="flex flex-col gap-2">
        <TeamSelector
          value={selectedTeam}
          onChange={onTeamChange}
          teams={teams}
          isLoading={isLoading}
        />
        <PersonSelector
          value={query.person}
          onChange={onPersonChange}
          people={filteredPeople}
          disabled={false}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
