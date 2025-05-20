
import { useState, useEffect, useCallback } from 'react';
import {
	fetchTactics,
	fetchTeams,
	fetchPeopleByTeam,
	fetchAllPeople,
	fetchDates
} from '@/lib/voter-data';
import { useToast } from "@/hooks/use-toast";

export const useMetadata = (isDataMigrated: boolean, selectedTeam: string | null) => {
	const [tactics, setTactics] = useState<string[]>([]);
	const [teams, setTeams] = useState<string[]>([]);
	const [filteredPeople, setFilteredPeople] = useState<string[]>([]);
	const [allPeople, setAllPeople] = useState<string[]>([]);
	const [availableDates, setAvailableDates] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const { toast } = useToast();

	// Fetch initial data
	useEffect(() => {
		const loadInitialData = async () => {
			try {
				setIsLoading(true);

				if (!isDataMigrated) {
					setTactics([]);
					setTeams([]);
					setAvailableDates([]);
					setAllPeople([]);
					setFilteredPeople([]);
					return;
				}

				// Fetch all metadata in parallel for better performance
				const [tacticsResult, teamsResult, datesResult, allPeopleResult] = await Promise.all([
					fetchTactics(),
					fetchTeams(),
					fetchDates(),
					fetchAllPeople()
				]);

				console.log("All people fetched:", allPeopleResult);

				// Set state with fetched data
				setTactics(tacticsResult || []);
				setTeams(teamsResult || []);
				setAvailableDates(datesResult || []);
				setAllPeople(allPeopleResult || []);

				// Initialize filteredPeople with all people when no team is selected
				if (!selectedTeam || selectedTeam === "All") {
					console.log("Initializing filteredPeople with all people:", allPeopleResult);
					setFilteredPeople(allPeopleResult || []);
				}
			} catch (err) {
				console.error("Error loading initial data:", err);
				toast({
					title: "Data Loading Error",
					description: "Could not load metadata. Please try refreshing the page.",
					variant: "destructive"
				});

				// Set empty arrays if fetch fails
				setTactics([]);
				setTeams([]);
				setAvailableDates([]);
				setAllPeople([]);
				setFilteredPeople([]);
			} finally {
				setIsLoading(false);
			}
		};

		loadInitialData();
	}, [isDataMigrated, toast]);

	// Fetch people based on selected team
	useEffect(() => {
		const loadPeopleByTeam = async () => {
			if (!isDataMigrated) {
				console.log("Data not migrated yet, skipping people fetch");
				return;
			}

			setIsLoading(true);

			try {
				if (selectedTeam && selectedTeam !== "All") {
					// If a specific team is selected, fetch people from that team
					console.log("Fetching people for team:", selectedTeam);
					const teamPeople = await fetchPeopleByTeam(selectedTeam);
					console.log("Fetched team people:", teamPeople);
					setFilteredPeople(teamPeople || []);
				} else {
					// If "All" is selected or no team is selected, use allPeople
					console.log("Using all people for filtering");
					
					// If allPeople is empty, fetch them
					if (allPeople.length === 0) {
						const allPeopleData = await fetchAllPeople();
						console.log("Fetched all people:", allPeopleData);
						setFilteredPeople(allPeopleData || []);
						setAllPeople(allPeopleData || []);
					} else {
						console.log("Using cached all people:", allPeople);
						setFilteredPeople(allPeople);
					}
				}
			} catch (err) {
				console.error("Error loading people by team:", err);
				toast({
					title: "Data Loading Error",
					description: "Could not load people data.",
					variant: "destructive"
				});

				// Set empty array if fetch fails
				setFilteredPeople([]);
			} finally {
				setIsLoading(false);
			}
		};

		loadPeopleByTeam();
	}, [selectedTeam, isDataMigrated, allPeople, toast]);

	// Function to refresh all metadata
	const refreshMetadata = useCallback(async () => {
		if (!isDataMigrated) return;

		setIsLoading(true);
		try {
			const [tacticsResult, teamsResult, datesResult, allPeopleResult] = await Promise.all([
				fetchTactics(),
				fetchTeams(),
				fetchDates(),
				fetchAllPeople()
			]);

			setTactics(tacticsResult || []);
			setTeams(teamsResult || []);
			setAvailableDates(datesResult || []);
			setAllPeople(allPeopleResult || []);

			if (!selectedTeam || selectedTeam === "All") {
				setFilteredPeople(allPeopleResult || []);
			} else {
				const teamPeople = await fetchPeopleByTeam(selectedTeam);
				setFilteredPeople(teamPeople || []);
			}

			toast({
				title: "Data Refreshed",
				description: "Metadata has been successfully refreshed.",
				variant: "default"
			});
		} catch (err) {
			console.error("Error refreshing metadata:", err);
			toast({
				title: "Refresh Error",
				description: "Failed to refresh metadata.",
				variant: "destructive"
			});
		} finally {
			setIsLoading(false);
		}
	}, [isDataMigrated, selectedTeam, toast]);

	return {
		tactics,
		teams,
		filteredPeople,
		allPeople,
		availableDates,
		isLoading,
		refreshMetadata
	};
};
