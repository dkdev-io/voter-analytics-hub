
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { RESULT_TYPES, type QueryParams } from '@/types/analytics';
import { cn } from "@/lib/utils";
import { 
  fetchTactics, 
  fetchTeams, 
  fetchPeopleByTeam, 
  fetchDates 
} from '@/lib/voter-data';

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
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const tacticsList = await fetchTactics();
        const teamsList = await fetchTeams();
        const datesList = await fetchDates();
        
        setTactics(tacticsList);
        setTeams(teamsList);
        setAvailableDates(datesList);
      } catch (err) {
        console.error("Error loading initial data:", err);
      }
    };
    
    if (isDataMigrated) {
      loadInitialData();
    }
  }, [isDataMigrated]);

  useEffect(() => {
    const loadPeopleByTeam = async () => {
      try {
        const people = await fetchPeopleByTeam(selectedTeam);
        setFilteredPeople(people);
      } catch (err) {
        console.error("Error loading people by team:", err);
      }
    };
    
    if (isDataMigrated && selectedTeam) {
      loadPeopleByTeam();
    }
  }, [selectedTeam, isDataMigrated]);

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

  useEffect(() => {
    if (selectedTeam) {
      setQuery(prev => {
        const newQuery = { ...prev };
        delete newQuery.person;
        return newQuery;
      });
    }
  }, [selectedTeam, setQuery]);

  const handleDateSelect = (value: string) => {
    setQuery(prev => ({ ...prev, date: value }));
    setError(null);
  };

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
              setQuery(prev => ({ ...prev, team: value }));
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
        
        <div className="inline-block min-w-[180px]">
          <Select
            value={query.date}
            onValueChange={handleDateSelect}
            disabled={isLoading}
          >
            <SelectTrigger className="min-w-[180px]">
              <SelectValue placeholder={<span className="font-bold">Select Date</span>} />
            </SelectTrigger>
            <SelectContent 
              className="max-h-[300px] overflow-y-auto bg-white z-50"
              position="popper"
              sideOffset={5}
              align="start"
            >
              <SelectItem value="All">All Dates</SelectItem>
              {availableDates.map((dateValue: string) => (
                <SelectItem key={dateValue} value={dateValue}>
                  {dateValue}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <span>.</span>
      </div>
    </div>
  );
};
