
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PersonSelectorProps {
	value: string | undefined;
	onChange: (value: string) => void;
	people: string[];
	disabled: boolean;
	isLoading: boolean;
}

export const PersonSelector = ({
	value,
	onChange,
	people,
	disabled,
	isLoading
}: PersonSelectorProps) => {
	// Filter out any null/undefined values and get unique people
	// Also filter out any values that look like "X Unknown" which are invalid entries
	const validPeople = people
		.filter(Boolean)
		.filter(person => !person.match(/^\d+\s+Unknown$/));
	
	// Get unique entries and sort them
	const uniquePeople = [...new Set(validPeople)].sort();

	console.log("PersonSelector rendered with people:", uniquePeople.length > 0 ? uniquePeople : "No valid people found");
	console.log("Current selected person:", value);

	return (
		<div className="w-full">
			<Select
				value={value || "All"}
				onValueChange={onChange}
				disabled={isLoading || disabled}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder={isLoading ? "Loading..." : "Select Individual"} />
				</SelectTrigger>
				<SelectContent
					className="max-h-[300px] overflow-y-auto bg-white z-50"
					position="popper"
					sideOffset={5}
					align="start"
				>
					<SelectItem value="All">All Members</SelectItem>
					{uniquePeople && uniquePeople.length > 0 ? (
						uniquePeople.map((person: string) => (
							<SelectItem key={person} value={person}>
								{person}
							</SelectItem>
						))
					) : (
						<SelectItem value="no-data" disabled>
							{isLoading ? "Loading people..." : "No people available"}
						</SelectItem>
					)}
				</SelectContent>
			</Select>
		</div>
	);
};
