
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
					{tactics && tactics.length > 0 ? (
						tactics.map((tactic) => (
							<SelectItem key={tactic} value={tactic || "unknown-tactic"}>
								{tactic || "Unknown Tactic"}
							</SelectItem>
						))
					) : (
						<SelectItem value="no-data">
							{isLoading ? "Loading..." : "No data in database yet"}
						</SelectItem>
					)}
				</SelectContent>
			</Select>
		</div>
	);
};
