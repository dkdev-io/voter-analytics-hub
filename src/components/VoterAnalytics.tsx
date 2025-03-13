
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Send, CalendarIcon, Database } from "lucide-react";
import { format } from "date-fns";
import { RESULT_TYPES, type QueryParams } from '@/types/analytics';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { 
  migrateTestDataToSupabase, 
  fetchTactics, 
  fetchTeams, 
  fetchPeopleByTeam,
  calculateResultFromSupabase 
} from '@/lib/voterDataService';

export const VoterAnalytics = () => {
  const [query, setQuery] = useState<Partial<QueryParams>>({});
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [tactics, setTactics] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataMigrated, setIsDataMigrated] = useState(false);
  const { toast } = useToast();

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // Fetch tactics and teams from Supabase
        const tacticsList = await fetchTactics();
        const teamsList = await fetchTeams();
        
        // If no data in Supabase, migrate the test data
        if (tacticsList.length === 0 || teamsList.length === 0) {
          await migrateTestDataToSupabase();
          toast({
            title: "Data Migration",
            description: "Test data has been migrated to Supabase.",
            variant: "default"
          });
          setIsDataMigrated(true);
          
          // Refetch after migration
          const updatedTactics = await fetchTactics();
          const updatedTeams = await fetchTeams();
          
          setTactics(updatedTactics);
          setTeams(updatedTeams);
        } else {
          setTactics(tacticsList);
          setTeams(teamsList);
          setIsDataMigrated(true);
        }
      } catch (err) {
        console.error("Error loading initial data:", err);
        toast({
          title: "Error",
          description: "Failed to load data from Supabase.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, [toast]);

  // Update people when team selection changes
  useEffect(() => {
    const loadPeopleByTeam = async () => {
      try {
        const people = await fetchPeopleByTeam(selectedTeam);
        setFilteredPeople(people);
      } catch (err) {
        console.error("Error loading people by team:", err);
      }
    };
    
    if (isDataMigrated) {
      loadPeopleByTeam();
    }
  }, [selectedTeam, isDataMigrated]);

  // Update query.date when date state changes
  useEffect(() => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      setQuery(prev => ({ ...prev, date: formattedDate }));
    } else {
      setQuery(prev => {
        const newQuery = { ...prev };
        delete newQuery.date;
        return newQuery;
      });
    }
  }, [date]);

  // Reset person selection when team changes
  useEffect(() => {
    if (selectedTeam) {
      setQuery(prev => {
        const newQuery = { ...prev };
        delete newQuery.person;
        return newQuery;
      });
    }
  }, [selectedTeam]);

  const generateDateRange = () => {
    const dates = [];
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-01-31T23:59:59');
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };
  
  const dates = generateDateRange();

  const calculateResult = async () => {
    if (!query.tactic && !query.resultType && !query.person && !query.date) {
      setError("Please select at least one field");
      setResult(null);
      return;
    }

    try {
      setIsLoading(true);
      const { result: calculatedResult, error: calculationError } = await calculateResultFromSupabase(query);
      
      if (calculationError) {
        setError(calculationError);
        setResult(null);
        return;
      }
      
      if (calculatedResult === 0) {
        setResult(0);
        setError(null);
        toast({
          title: "No data found",
          description: "No matching data for these criteria. Result set to 0.",
          variant: "default"
        });
      } else {
        setResult(calculatedResult);
        setError(null);
      }
    } catch (e) {
      console.error("Error calculating result:", e);
      setError("Unknown error");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2 text-center">Dashboard</h1>
      <p className="text-lg text-gray-700 mb-8 text-center italic">
        The first user friendly tool to help campaigns analyze their voter contact data.
      </p>
      
      {!isDataMigrated && (
        <div className="flex justify-center mb-6">
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-700 flex items-center">
              <Database className="mr-2 h-4 w-4" />
              Connecting to Supabase and migrating data...
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      <div className="space-y-6">
        <div className="text-lg text-gray-700 flex flex-wrap items-center gap-2">
          <span>I want to know how many</span>
          
          <div className="inline-block min-w-[150px]">
            <Select
              value={query.tactic}
              onValueChange={(value) => {
                setQuery(prev => ({ ...prev, tactic: value }));
                setError(null);
              }}
              disabled={isLoading}
            >
              <SelectTrigger className="min-w-[150px]">
                <SelectValue placeholder={<span className="font-bold">Select Tactic</span>} />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                <SelectItem value="All">All</SelectItem>
                {tactics.map(tactic => (
                  <SelectItem key={tactic} value={tactic}>
                    {tactic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="inline-block min-w-[150px]">
            <Select
              value={query.resultType}
              onValueChange={(value) => {
                setQuery(prev => ({ ...prev, resultType: value }));
                setError(null);
              }}
              disabled={isLoading}
            >
              <SelectTrigger className="min-w-[150px]">
                <SelectValue placeholder={<span className="font-bold">Select Metric</span>} />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {RESULT_TYPES.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <span>were done by</span>
          
          <div className="inline-block min-w-[180px]">
            <Select
              value={selectedTeam}
              onValueChange={(value) => {
                setSelectedTeam(value);
                setError(null);
              }}
              disabled={isLoading}
            >
              <SelectTrigger className="min-w-[180px]">
                <SelectValue placeholder={<span className="font-bold">Select Team</span>} />
              </SelectTrigger>
              <SelectContent 
                className="max-h-[300px] overflow-y-auto bg-white z-50"
                position="popper"
                sideOffset={5}
                align="start"
              >
                <SelectItem value="All">All Teams</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="inline-block min-w-[180px]">
            <Select
              value={query.person}
              onValueChange={(value) => {
                setQuery(prev => ({ ...prev, person: value }));
                setError(null);
              }}
              disabled={!selectedTeam || isLoading}
            >
              <SelectTrigger className="min-w-[180px]">
                <SelectValue placeholder={<span className="font-bold">Select Individual</span>} />
              </SelectTrigger>
              <SelectContent 
                className="max-h-[300px] overflow-y-auto bg-white z-50"
                position="popper"
                sideOffset={5}
                align="start"
              >
                <SelectItem value="All">All Members</SelectItem>
                {filteredPeople.map((person: string) => (
                  <SelectItem key={person} value={person}>
                    {person}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <span>on</span>
          
          <div className="inline-block min-w-[150px]">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "min-w-[150px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "yyyy-MM-dd") : <span className="font-bold">Select Date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => {
                    setDate(selectedDate);
                    setError(null);
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
                <div className="p-2 border-t border-gray-200">
                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => {
                      setDate(undefined);
                      setQuery(prev => {
                        const newQuery = { ...prev };
                        delete newQuery.date;
                        return newQuery;
                      });
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <span>.</span>
        </div>

        <div className="flex justify-center mt-6">
          <Button 
            onClick={calculateResult}
            className="px-6 py-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit
              </>
            )}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription className="text-red-600">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {result !== null && !error && (
          <p className="text-xl font-medium text-gray-900 mt-4 text-center">
            Result: {result}
          </p>
        )}
      </div>
    </div>
  );
};
