
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface TacticSelectorProps {
	value: string | undefined;
	onChange: (value: string) => void;
	tactics: string[];
	isLoading: boolean;
}

export const TacticSelector = ({
	value,
	onChange,
	tactics,
	isLoading,
}: TacticSelectorProps) => {
	// Define our standard tactics that should always be available
	const standardTactics = ['SMS', 'Phone', 'Canvas'];
	
	// Combine standard tactics with any unique ones from the database
	// Filter out duplicates and ensure values aren't null/undefined
	const allTactics = [...new Set([...standardTactics, ...(tactics || [])])].filter(Boolean);
	
	console.log("TacticSelector rendered with tactics:", allTactics);
	console.log("Current selected tactic:", value);

	return (
		<div className="w-full">
			<Select value={value || "All"} onValueChange={onChange} disabled={isLoading}>
				<SelectTrigger className="w-full font-sans border-primary/20 focus:ring-primary/30">
					<SelectValue
						placeholder={isLoading ? "Loading..." : "Select Tactic"}
					/>
				</SelectTrigger>
				<SelectContent className="bg-white z-50 max-h-[300px] overflow-y-auto font-sans">
					<SelectItem value="All" className="font-medium">
						All Tactics
					</SelectItem>
					{allTactics.length > 0 ? (
						allTactics.map((tactic) => (
							<SelectItem key={tactic} value={tactic}>
								{tactic}
							</SelectItem>
						))
					) : (
						<SelectItem value="no-data" disabled>
							{isLoading ? "Loading..." : "No tactics available"}
						</SelectItem>
					)}
				</SelectContent>
			</Select>
		</div>
	);
};
