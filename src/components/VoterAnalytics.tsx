
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { TEST_DATA, RESULT_TYPES, type QueryParams } from '@/types/analytics';
import { useToast } from "@/hooks/use-toast";

// CSV URL
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSAudKBH31Q95FjvelULhV4422EeIFwmUKbxQKOGD_NEdRvAlK4VIC04MwQ8gTELUNhlhvsQMlNTCys/pub?gid=1511945478&single=true&output=csv";

export const VoterAnalytics = () => {
  const [query, setQuery] = useState<Partial<QueryParams>>({});
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(TEST_DATA);
  const [totalRows, setTotalRows] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCSVData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(CSV_URL);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        
        const csvText = await response.text();
        const parsedData = parseCSV(csvText);
        
        setData(parsedData);
        setTotalRows(parsedData.length);
        console.log(`Successfully loaded ${parsedData.length} rows from CSV`);
        
        toast({
          title: "Data loaded",
          description: `Successfully loaded ${parsedData.length} rows of data`,
        });
      } catch (error) {
        console.error("Error fetching CSV:", error);
        toast({
          title: "Error loading data",
          description: "Failed to load the dataset. Using test data instead.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCSVData();
  }, [toast]);
  
  // Parse CSV text into an array of objects
  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines
      
      const values = lines[i].split(',').map(value => value.trim());
      const entry: any = {};
      
      // Map CSV columns to our data structure
      for (let j = 0; j < headers.length; j++) {
        const header = headers[j].toLowerCase();
        let key = header;
        let value = values[j];
        
        // Convert numeric values
        if (["attempts", "contacts", "nothome", "refusal", "baddata", "support", "oppose", "undecided"].includes(header)) {
          value = parseInt(value) || 0;
          if (header === "nothome") key = "notHome";
          if (header === "baddata") key = "badData";
        }
        
        // Map the headers to our expected data structure
        if (header === "firstname") key = "firstName";
        if (header === "lastname") key = "lastName";
        
        entry[key] = value;
      }
      
      result.push(entry);
    }
    
    return result;
  };

  // Get tactics from actual data instead of test data
  const tactics = Array.from(new Set(data.map(d => d.tactic))).sort();
  
  // Extract all unique people from the data
  const extractPeople = () => {
    const uniquePeople = new Set();
    
    data.forEach(entry => {
      const fullName = `${entry.firstName} ${entry.lastName}`;
      uniquePeople.add(fullName);
    });
    
    return Array.from(uniquePeople).sort() as string[];
  };
  
  const people = extractPeople();
  
  console.log("Total unique people:", people.length);
  console.log("First few people:", people.slice(0, 5));
  
  const generateDateRange = () => {
    // Extract unique dates from the data
    const uniqueDates = new Set(data.map(d => d.date));
    return Array.from(uniqueDates).sort();
  };
  
  const dates = generateDateRange();
  
  console.log('Total dataset rows:', data.length);
  console.log('Available dates:', dates);
  console.log('Total unique dates:', dates.length);
  
  const calculateDatasetStats = () => {
    const uniqueTactics = Array.from(new Set(data.map(d => d.tactic))).length;
    const uniquePeople = new Set(data.map(d => d.firstName + d.lastName)).size;
    const uniqueDates = new Set(data.map(d => d.date)).size;
    
    const possibleCombinations = uniquePeople * uniqueDates * uniqueTactics;
    
    return {
      dataEntries: data.length,
      totalUniquePeople: uniquePeople,
      totalUniqueDates: uniqueDates,
      totalUniqueTactics: uniqueTactics,
      possibleCombinations
    };
  };
  
  const datasetStats = calculateDatasetStats();
  console.log('Dataset statistics:', datasetStats);
  
  const calculateResult = () => {
    if (!query.tactic && !query.resultType && !query.person && !query.date) {
      setError("Please select at least one field");
      setResult(null);
      return;
    }

    try {
      // Map the display result type to the actual property name in the data
      let resultType = query.resultType ? 
        query.resultType.toLowerCase().replace(/ /g, "") : 
        "attempts";
      
      // Special handling for "Not Home" to map to "notHome" property
      if (resultType === "nothome") {
        resultType = "notHome";
      }
      
      let filtered = [...data];
      
      if (query.tactic && query.tactic !== "All") {
        filtered = filtered.filter(d => d.tactic === query.tactic);
      }
      
      if (query.person && query.person !== "All") {
        let firstName, lastName;
        
        const nameParts = query.person.split(" ");
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(" ");
        
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
      
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-lg">Loading data...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-md mb-4">
            <p className="text-blue-800 font-medium">Dataset loaded: {data.length} records</p>
          </div>
          
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
              disabled={isLoading}
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
      )}
    </div>
  );
};
