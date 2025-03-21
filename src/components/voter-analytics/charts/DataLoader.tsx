
import { useState, useEffect } from 'react';
import { type VoterMetrics, type QueryParams, CHART_COLORS } from '@/types/analytics';
import { fetchVoterMetrics } from '@/lib/voter-data';
import { isValid, parseISO } from 'date-fns';

interface UseDataLoaderProps {
  query: Partial<QueryParams>;
  showFilteredData: boolean;
}

export const useDataLoader = ({ query, showFilteredData }: UseDataLoaderProps) => {
  const [tacticsData, setTacticsData] = useState<any[]>([]);
  const [contactsData, setContactsData] = useState<any[]>([]);
  const [notReachedData, setNotReachedData] = useState<any[]>([]);
  const [lineChartData, setLineChartData] = useState<any[]>([]);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalContacts, setTotalContacts] = useState(0);
  const [totalNotReached, setTotalNotReached] = useState(0);
  const [loading, setLoading] = useState(true);
  const [datasetName, setDatasetName] = useState<string>("");
  
  // Ensure query is always a valid object
  const safeQuery = query || {};

  useEffect(() => {
    // Create a flag to prevent state updates if the component unmounts
    let isMounted = true;
    
    const loadChartData = async () => {
      try {
        setLoading(true);
        
        // Determine if we should filter the data
        const shouldFilter = showFilteredData || Boolean(safeQuery.person || safeQuery.tactic || safeQuery.team);
        console.log(`Loading chart data with filtering: ${shouldFilter ? "Yes" : "No"}`, safeQuery);
        
        // Fetch aggregated metrics from our service - either overall or filtered
        const metrics = await fetchVoterMetrics(shouldFilter ? safeQuery : undefined);
        
        // If component unmounted during async operation, don't update state
        if (!isMounted) return;
        
        // Ensure we have valid metrics data
        if (!metrics) {
          console.error("Failed to load metrics data");
          setLoading(false);
          return;
        }
        
        // Chart 1: Tactics breakdown (SMS, Phone, Canvas)
        const tacticsChartData = [
          { name: 'SMS', value: metrics.tactics.sms || 0, color: CHART_COLORS.TACTIC.SMS, total: (metrics.tactics.sms || 0) + (metrics.tactics.phone || 0) + (metrics.tactics.canvas || 0) },
          { name: 'Phone', value: metrics.tactics.phone || 0, color: CHART_COLORS.TACTIC.PHONE, total: (metrics.tactics.sms || 0) + (metrics.tactics.phone || 0) + (metrics.tactics.canvas || 0) },
          { name: 'Canvas', value: metrics.tactics.canvas || 0, color: CHART_COLORS.TACTIC.CANVAS, total: (metrics.tactics.sms || 0) + (metrics.tactics.phone || 0) + (metrics.tactics.canvas || 0) }
        ].filter(item => item.value > 0); // Only include non-zero values
        
        // Chart 2: Contacts breakdown (Support, Oppose, Undecided)
        const totalContactsValue = (metrics.contacts.support || 0) + (metrics.contacts.oppose || 0) + (metrics.contacts.undecided || 0);
        const contactsChartData = [
          { name: 'Support', value: metrics.contacts.support || 0, color: CHART_COLORS.CONTACT.SUPPORT, total: totalContactsValue },
          { name: 'Oppose', value: metrics.contacts.oppose || 0, color: CHART_COLORS.CONTACT.OPPOSE, total: totalContactsValue },
          { name: 'Undecided', value: metrics.contacts.undecided || 0, color: CHART_COLORS.CONTACT.UNDECIDED, total: totalContactsValue }
        ].filter(item => item.value > 0); // Only include non-zero values
        
        // Chart 3: Not Reached breakdown (Not Home, Refusal, Bad Data)
        const totalNotReachedValue = (metrics.notReached.notHome || 0) + (metrics.notReached.refusal || 0) + (metrics.notReached.badData || 0);
        const notReachedChartData = [
          { name: 'Not Home', value: metrics.notReached.notHome || 0, color: CHART_COLORS.NOT_REACHED.NOT_HOME, total: totalNotReachedValue },
          { name: 'Refusal', value: metrics.notReached.refusal || 0, color: CHART_COLORS.NOT_REACHED.REFUSAL, total: totalNotReachedValue },
          { name: 'Bad Data', value: metrics.notReached.badData || 0, color: CHART_COLORS.NOT_REACHED.BAD_DATA, total: totalNotReachedValue }
        ].filter(item => item.value > 0); // Only include non-zero values
        
        // Filter out any data points with invalid dates and ensure every day is included
        const validatedLineData = (metrics.byDate || []).filter(item => {
          // Check if date is valid
          return item.date && isValid(parseISO(item.date));
        }).map(item => ({
          ...item,
          // Ensure all numeric values are at least 0
          attempts: item.attempts || 0,
          contacts: item.contacts || 0,
          issues: item.issues || 0
        }));
        
        // Sort dates chronologically to ensure proper display
        validatedLineData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        // Calculate totals
        const totalTactics = tacticsChartData.reduce((sum, item) => sum + item.value, 0);
        
        // Determine dataset name based on user's query or default
        const datasetNameValue = safeQuery.team && safeQuery.team !== "All"
          ? `${safeQuery.team} Team Dataset`
          : safeQuery.person
            ? `${safeQuery.person}'s Dataset`
            : "Voter Contacts Dataset";
        
        // Update state with processed data
        setTacticsData(tacticsChartData);
        setContactsData(contactsChartData);
        setNotReachedData(notReachedChartData);
        setLineChartData(validatedLineData);
        setTotalAttempts(totalTactics);
        setTotalContacts(totalContactsValue);
        setTotalNotReached(totalNotReachedValue);
        setDatasetName(datasetNameValue);
      } catch (error) {
        console.error('Error loading chart data:', error);
        // Set empty data on error
        if (isMounted) {
          setTacticsData([]);
          setContactsData([]);
          setNotReachedData([]);
          setLineChartData([]);
          setTotalAttempts(0);
          setTotalContacts(0);
          setTotalNotReached(0);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadChartData();
    
    // Cleanup function to prevent updates if component unmounts during data fetch
    return () => {
      isMounted = false;
    };
  }, [safeQuery, showFilteredData]);

  return {
    tacticsData,
    contactsData,
    notReachedData,
    lineChartData,
    totalAttempts,
    totalContacts,
    totalNotReached,
    loading,
    datasetName
  };
};
