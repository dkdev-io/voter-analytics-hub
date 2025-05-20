
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
	// Only show valid people names - filter out empty strings and undefined values
	const validPeople = Array.isArray(people) 
		? people.filter(person => person && typeof person === 'string' && person.trim() !== '')
		: [];
	
	console.log("PersonSelector rendered with people:", validPeople.length, "valid people", validPeople);
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
					{validPeople && validPeople.length > 0 ? (
						validPeople.map((person: string) => (
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
