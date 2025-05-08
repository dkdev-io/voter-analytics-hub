
import { useState, useEffect } from 'react';
import { format, isValid, parseISO } from 'date-fns';

export interface ChartDataPoint {
  date: string;
  attempts: number;
  contacts: number;
  issues: number;
  displayDate?: string;
  dailyAttempts?: number;
  dailyContacts?: number;
  dailyIssues?: number;
  cumulativeAttempts?: number;
  cumulativeContacts?: number;
  cumulativeIssues?: number;
}

export const useCumulativeData = (rawData: ChartDataPoint[]) => {
  const [processedData, setProcessedData] = useState<ChartDataPoint[]>([]);
  const [maxDailyValue, setMaxDailyValue] = useState(0);
  const [maxCumulativeValue, setMaxCumulativeValue] = useState(0);

  useEffect(() => {
    // Filter out any data points with invalid dates
    const validData = rawData.filter(item => {
      // Check if the date is valid
      const isValidDate = item.date && isValid(parseISO(item.date));
      return isValidDate;
    });

    // Sort dates chronologically to ensure proper cumulative calculation
    validData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate cumulative values accurately
    let cumulativeAttempts = 0;
    let cumulativeContacts = 0;
    let cumulativeIssues = 0;

    const processed = validData.map(item => {
      // Ensure we're using actual numbers for calculations
      const dailyAttempts = Math.max(0, Number(item.attempts) || 0);
      const dailyContacts = Math.max(0, Number(item.contacts) || 0);
      const dailyIssues = Math.max(0, Number(item.issues) || 0);

      // Add each day's value to the cumulative total
      cumulativeAttempts += dailyAttempts;
      cumulativeContacts += dailyContacts;
      cumulativeIssues += dailyIssues;

      // Format the date for display
      const displayDate = format(new Date(item.date), 'MM/dd');

      return {
        ...item,
        displayDate,
        // Store accurate cumulative values
        cumulativeAttempts,
        cumulativeContacts,
        cumulativeIssues,
        // Include the daily values for toggle functionality
        dailyAttempts,
        dailyContacts,
        dailyIssues
      };
    });

    // Calculate the maximum values for Y-axis scaling
    const maxDaily = processed.length > 0 ?
      Math.max(...processed.map(item => 
        Math.max(item.dailyAttempts || 0, item.dailyContacts || 0, item.dailyIssues || 0)
      )) : 0;

    const maxCumulative = processed.length > 0 ?
      Math.max(
        processed[processed.length - 1]?.cumulativeAttempts || 0,
        processed[processed.length - 1]?.cumulativeContacts || 0,
        processed[processed.length - 1]?.cumulativeIssues || 0
      ) : 0;

    // Log the processed data for verification
    console.log('Cumulative data calculation:', {
      original: validData.slice(0, 3),
      processed: processed.slice(0, 3),
      final: processed.length > 0 ? processed[processed.length - 1] : null,
      maxDaily,
      maxCumulative
    });

    setProcessedData(processed);
    setMaxDailyValue(maxDaily);
    setMaxCumulativeValue(maxCumulative);
  }, [rawData]);

  return {
    processedData,
    maxDailyValue,
    maxCumulativeValue,
    hasData: processedData.length > 0
  };
};
