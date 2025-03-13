
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { RESULT_TYPES, type QueryParams } from '@/types/analytics';
import { cn } from "@/lib/utils";
import { fetchTactics, fetchTeams, fetchPeopleByTeam } from '@/lib/voterDataService';

interface QueryBuilderProps {
  query: Partial<QueryParams>;
  setQuery: React.Dispatch<React.SetStateAction<Partial<QueryParams>>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  isLoading: boolean;
  isDataMigrated: boolean;
}

export const QueryBuilder = ({ 
  query, 
  setQuery, 
  setError,
  isLoading,
  isDataMigrated 
}: QueryBuilderProps) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [tactics, setTactics] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<string[]>([]);

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Fetch tactics and teams from Supabase
        const tacticsList = await fetchTactics();
        const teamsList = await fetchTeams();
        
        setTactics(tacticsList);
        setTeams(teamsList);
      } catch (err) {
        console.error("Error loading tactics and teams:", err);
      }
    };
    
    if (isDataMigrated) {
      loadInitialData();
    }
  }, [isDataMigrated]);

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
  }, [date, setQuery]);

  // Reset person selection when team changes
  useEffect(() => {
    if (selectedTeam) {
      setQuery(prev => {
        const newQuery = { ...prev };
        delete newQuery.person;
        return newQuery;
      });
    }
  }, [selectedTeam, setQuery]);

  return (
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
    </div>
  );
};
