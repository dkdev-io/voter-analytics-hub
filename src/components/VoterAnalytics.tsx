
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TEST_DATA, RESULT_TYPES, type QueryParams } from '@/types/analytics';

export const VoterAnalytics = () => {
  const [query, setQuery] = useState<Partial<QueryParams>>({});
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<number | null>(null);

  // Extract unique values from the dataset
  const tactics = Array.from(new Set(TEST_DATA.map(d => d.tactic))).sort();
  const people = Array.from(new Set(TEST_DATA.map(d => `${d.firstName} ${d.lastName}`))).sort();
  
  // Generate all dates from 2025-01-01 to 2025-01-31
  const generateDateRange = () => {
    const dates = [];
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-01-31T23:59:59'); // Set time to end of day to include Jan 31
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };
  
  // Use the date range from 01-01 to 01-31 regardless of what's in the dataset
  const dates = generateDateRange();

  // Add console logging for debugging
  console.log('Available dates:', dates);
  console.log('Total unique dates:', dates.length);
  console.log('Last date in array:', dates[dates.length - 1]);
  console.log('Total data entries:', TEST_DATA.length);
  
  const calculateResult = () => {
    // Check for incomplete query parameters
    if (!query.tactic || !query.resultType || !query.person || !query.date) {
      setError("Please complete all fields");
      setResult(null);
      return;
    }

    try {
      const [firstName, lastName] = query.person.split(" ");
      const resultType = query.resultType.toLowerCase().replace(" ", "");
      
      const filtered = TEST_DATA.filter(d => 
        d.tactic === query.tactic &&
        d.firstName === firstName &&
        d.lastName === lastName &&
        d.date === query.date
      );

      // If no matching data is found, return 0 instead of an error
      if (filtered.length === 0) {
        setResult(0);
        setError(null);
      } else {
        setResult(filtered[0][resultType as keyof typeof filtered[0]] as number);
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
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Voter Contact Analytics</h1>
      
      <div className="space-y-6">
        <p className="text-lg text-gray-700">
          I want to know how many
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            value={query.tactic}
            onValueChange={(value) => {
              setQuery(prev => ({ ...prev, tactic: value }));
              setError(null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select tactic" />
            </SelectTrigger>
            <SelectContent>
              {tactics.map(tactic => (
                <SelectItem key={tactic} value={tactic}>
                  {tactic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={query.resultType}
            onValueChange={(value) => {
              setQuery(prev => ({ ...prev, resultType: value }));
              setError(null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select result type" />
            </SelectTrigger>
            <SelectContent>
              {RESULT_TYPES.map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={query.person}
            onValueChange={(value) => {
              setQuery(prev => ({ ...prev, person: value }));
              setError(null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select person" />
            </SelectTrigger>
            <SelectContent>
              {people.map(person => (
                <SelectItem key={person} value={person}>
                  {person}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={query.date}
            onValueChange={(value) => {
              setQuery(prev => ({ ...prev, date: value }));
              setError(null);
              // Calculate result only after all selections are complete
              setTimeout(() => calculateResult(), 0);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select date" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {dates.map(date => (
                <SelectItem key={date} value={date}>
                  {date}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
