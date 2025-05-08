
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";

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
	// Expected names for fallback/testing
	const expectedNames = [
		"John Smith", "Jane Doe", "Alex Johnson",
		"Maria Martinez", "Chris Brown", "Candidate Carter"
	];

	// Combine uploaded people with expected names, removing duplicates
	const allPeople = [...new Set([...people, ...expectedNames])].sort();

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
					{allPeople && allPeople.length > 0 ? (
						allPeople.map((person: string) => (
							<SelectItem key={person} value={person || "unknown-person"}>
								{person || "Unknown Person"}
							</SelectItem>
						))
					) : (
						<SelectItem value="no-data">
							{isLoading ? "Loading people..." : "No people available"}
						</SelectItem>
					)}
				</SelectContent>
			</Select>
		</div>
	);
};
