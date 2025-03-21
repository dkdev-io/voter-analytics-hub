
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

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setLoading(true);
        
        // Determine if we should filter the data
        const shouldFilter = showFilteredData || (query.person || query.tactic || query.team);
        console.log(`Loading chart data with filtering: ${shouldFilter}`, query);
        
        // Fetch aggregated metrics from our service - either overall or filtered
        const metrics = await fetchVoterMetrics(shouldFilter ? query : undefined);
        
        // Ensure we have valid metrics data
        if (!metrics) {
          console.error("Failed to load metrics data");
          setLoading(false);
          return;
        }
        
        console.log("Loaded metrics data:", metrics);
        
        // Chart 1: Tactics breakdown (SMS, Phone, Canvas)
        const tacticsChartData = [
          { name: 'SMS', value: metrics.tactics.sms || 0, color: CHART_COLORS.TACTIC.SMS },
          { name: 'Phone', value: metrics.tactics.phone || 0, color: CHART_COLORS.TACTIC.PHONE },
          { name: 'Canvas', value: metrics.tactics.canvas || 0, color: CHART_COLORS.TACTIC.CANVAS }
        ].filter(item => item.value > 0); // Only include non-zero values
        
        // Chart 2: Contacts breakdown (Support, Oppose, Undecided)
        const contactsChartData = [
          { name: 'Support', value: metrics.contacts.support || 0, color: CHART_COLORS.CONTACT.SUPPORT },
          { name: 'Oppose', value: metrics.contacts.oppose || 0, color: CHART_COLORS.CONTACT.OPPOSE },
          { name: 'Undecided', value: metrics.contacts.undecided || 0, color: CHART_COLORS.CONTACT.UNDECIDED }
        ].filter(item => item.value > 0); // Only include non-zero values
        
        // Chart 3: Not Reached breakdown (Not Home, Refusal, Bad Data)
        const notReachedChartData = [
          { name: 'Not Home', value: metrics.notReached.notHome || 0, color: CHART_COLORS.NOT_REACHED.NOT_HOME },
          { name: 'Refusal', value: metrics.notReached.refusal || 0, color: CHART_COLORS.NOT_REACHED.REFUSAL },
          { name: 'Bad Data', value: metrics.notReached.badData || 0, color: CHART_COLORS.NOT_REACHED.BAD_DATA }
        ].filter(item => item.value > 0); // Only include non-zero values
        
        // Calculate the total not reached from the metrics
        const totalNotReachedValue = 
          (metrics.notReached.notHome || 0) + 
          (metrics.notReached.refusal || 0) + 
          (metrics.notReached.badData || 0);
        
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
        const totalContactsValue = contactsChartData.reduce((sum, item) => sum + item.value, 0);
        
        // Determine dataset name based on user's query or default
        const datasetNameValue = query.team && query.team !== "All"
          ? `${query.team} Team Dataset`
          : query.person
            ? `${query.person}'s Dataset`
            : "Voter Contacts Dataset";
        
        // Log line chart data for debugging
        console.log(`Line chart data (${validatedLineData.length} days), filtered by: `, query);
        console.log("Line chart data sample:", validatedLineData.slice(0, 3));
        
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
      } finally {
        setLoading(false);
      }
    };
    
    loadChartData();
  }, [query, showFilteredData]);

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
