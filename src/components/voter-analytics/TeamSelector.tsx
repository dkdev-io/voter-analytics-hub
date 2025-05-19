
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
	// Define our standard teams that should always be available
	const standardTeams = ["Team Tony", "Local Party", "Candidate"];
	
	// Combine standard teams with any unique ones from the database
	// Filter out duplicates and ensure values aren't null/undefined
	const allTeams = [...new Set([...standardTeams, ...(teams || [])])].filter(Boolean);
	
	console.log("TeamSelector rendered with teams:", allTeams);
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
					{allTeams.length > 0 ? (
						allTeams.map(team => (
							<SelectItem key={team} value={team}>
								{team}
							</SelectItem>
						))
					) : (
						<SelectItem value="no-data" disabled>
							{isLoading ? "Loading teams..." : "No team data available"}
						</SelectItem>
					)}
				</SelectContent>
			</Select>
		</div>
	);
};
