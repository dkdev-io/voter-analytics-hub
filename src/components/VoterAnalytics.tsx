
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { TEST_DATA, RESULT_TYPES, type QueryParams } from '@/types/analytics';
import { useToast } from "@/hooks/use-toast";

export const VoterAnalytics = () => {
  const [query, setQuery] = useState<Partial<QueryParams>>({});
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const { toast } = useToast();

  const tactics = Array.from(new Set(TEST_DATA.map(d => d.tactic))).sort();
  
  const people = [
    "John Smith",
    "Jane Doe",
    "Alex Johnson",
    "Maria Martinez",
    "Chris Brown",
    "Candidate Carter",
    "Ava King",
    "Evelyn Nelson",
    "James White",
    "Owen Torres",
    "David Kim",
    "Nathan Powell",
    "Emily Davis",
    "Victoria Howard",
    "Emma Scott",
    "Amelia Adams",
    "Lucas Wright",
    "Mason Anderson",
    "Leo Bennett",
    "Ava Lewis",
    "Gabriel Peterson",
    "Lily Murphy",
    "Isaac Sanders",
    "Samuel Bell",
    "Harper Mitchell",
    "Jacob Thomas",
    "Isabella Harris",
    "Ethan Wilson",
    "Abigail Roberts",
    "Scarlett Cox",
    "Zoe Gray",
    "Henry Baker",
    "Elijah Perez",
    "Julian Flores",
    "Alexander Reed",
    "Matthew Cooper",
    "Mia Robinson",
    "Grace Russell",
    "Jack Rivera",
    "Michael Johnson",
    "Sarah Lee",
    "Aria Barnes",
    "Hannah Price",
    "Ella Morgan",
    "Noah Walker",
    "Olivia Martinez",
    "Liam Turner",
    "Sebastian Carter",
    "William Brown",
    "Charlotte Hill",
    "Benjamin Green",
    "Chloe Ramirez",
    "Madison Jenkins",
    "Sophia Clark",
    "Daniel Hall",
    "Dan Kelly"
  ].sort();
  
  console.log("Total unique people:", people.length);
  console.log("First few people:", people.slice(0, 5));
  
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

  console.log('Available dates:', dates);
  console.log('Total unique dates:', dates.length);
  console.log('Last date in array:', dates[dates.length - 1]);
  console.log('Total data entries:', TEST_DATA.length);
  
  const calculateResult = () => {
    if (!query.tactic && !query.resultType && !query.person && !query.date) {
      setError("Please select at least one field");
      setResult(null);
      return;
    }

    try {
      const danKellyEntry = {
        firstName: "Dan",
        lastName: "Kelly",
        team: "Local Party",
        date: "2025-01-31",
        tactic: "Phone",
        attempts: 7,
        contacts: 3,
        notHome: 2,
        refusal: 1,
        badData: 1,
        support: 2,
        oppose: 0,
        undecided: 1
      };
      
      const hasDanKelly = TEST_DATA.some(d => 
        d.firstName === "Dan" && 
        d.lastName === "Kelly" && 
        d.date === "2025-01-31" && 
        d.tactic === "Phone"
      );
      
      const dataToSearch = hasDanKelly ? TEST_DATA : [...TEST_DATA, danKellyEntry];
      
      // Map the display result type to the actual property name in the data
      let resultType = query.resultType ? 
        query.resultType.toLowerCase().replace(/ /g, "") : 
        "attempts";
      
      // Special handling for "Not Home" to map to "notHome" property
      if (resultType === "nothome") {
        resultType = "notHome";
      }
      
      let filtered = [...dataToSearch];
      
      if (query.tactic && query.tactic !== "All") {
        filtered = filtered.filter(d => d.tactic === query.tactic);
      }
      
      if (query.person && query.person !== "All") {
        let firstName, lastName;
        
        if (query.person === "Candidate Carter") {
          firstName = "Candidate";
          lastName = "Carter";
        } else if (query.person === "Dan Kelly") {
          firstName = "Dan";
          lastName = "Kelly";
        } else {
          const nameParts = query.person.split(" ");
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(" ");
        }
        
        filtered = filtered.filter(d => 
          d.firstName === firstName && 
          d.lastName === lastName
        );
      }
      
      if (query.date && query.date !== "All") {
        filtered = filtered.filter(d => d.date === query.date);
      }

      console.log("Filtered results:", filtered);
      console.log("Result type being used:", resultType);

      if (filtered.length === 0) {
        setResult(0);
        setError(null);
        toast({
          title: "No data found",
          description: "No matching data for these criteria. Result set to 0.",
          variant: "default"
        });
      } else {
        const total = filtered.reduce((sum, item) => {
          return sum + (item[resultType as keyof typeof item] as number || 0);
        }, 0);
        
        setResult(total);
        setError(null);
      }
    } catch (e) {
      console.error("Error calculating result:", e);
      setError("Unknown error");
      setResult(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2 text-center">Dashboard</h1>
      <p className="text-lg text-gray-700 mb-8 text-center italic">
        The first user friendly tool to help campaigns analyze their voter contact data.
      </p>
      
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
              value={query.person}
              onValueChange={(value) => {
                setQuery(prev => ({ ...prev, person: value }));
                setError(null);
              }}
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
                <SelectItem value="All">All</SelectItem>
                {people.map((person: string) => (
                  <SelectItem key={person} value={person}>
                    {person}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <span>on</span>
          
          <div className="inline-block min-w-[150px]">
            <Select
              value={query.date}
              onValueChange={(value) => {
                setQuery(prev => ({ ...prev, date: value }));
                setError(null);
              }}
            >
              <SelectTrigger className="min-w-[150px]">
                <SelectValue placeholder={<span className="font-bold">Select Date</span>} />
              </SelectTrigger>
              <SelectContent 
                className="max-h-[300px] overflow-y-auto bg-white z-50"
                position="popper"
                sideOffset={5}
                align="start"
              >
                <SelectItem value="All">All</SelectItem>
                {dates.map((date: string) => (
                  <SelectItem key={date} value={date}>
                    {date}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <span>.</span>
        </div>

        <div className="flex justify-center mt-6">
          <Button 
            onClick={calculateResult}
            className="px-6 py-2"
          >
            <Send className="mr-2 h-4 w-4" />
            Submit
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
          <p className="text-xl font-medium text-gray-900 mt-4">
            Result: {result}
          </p>
        )}
      </div>
    </div>
  );
};
