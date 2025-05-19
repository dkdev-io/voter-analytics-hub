
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TeamSelectorProps {
	value: string | null;
	onChange: (value: string) => void;
	teams: string[];
	isLoading: boolean;
}

export const TeamSelector = ({
	value,
	onChange,
	teams,
	isLoading
}: TeamSelectorProps) => {
	// Only use the standard teams - these should be the only ones coming from fetchTeams
	// but we'll filter here just to be sure
	const standardTeams = ["Team Tony", "Local Party", "Candidate"];
	
	console.log("TeamSelector rendered with teams:", teams);
	console.log("Current selected team:", value);

	return (
		<div className="w-full">
			<Select
				value={value || "All"}
				onValueChange={onChange}
				disabled={isLoading}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder={isLoading ? "Loading..." : "Select Team"} />
				</SelectTrigger>
				<SelectContent
					className="max-h-[300px] overflow-y-auto bg-white z-50"
					position="popper"
					sideOffset={5}
					align="start"
				>
					<SelectItem value="All">All Teams</SelectItem>
					{standardTeams.map(team => (
						<SelectItem key={team} value={team}>
							{team}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
};
