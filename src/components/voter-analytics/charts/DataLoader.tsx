
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
        
        // Fetch aggregated metrics from our service - either overall or filtered
        const metrics = await fetchVoterMetrics(showFilteredData ? query : undefined);
        
        // Chart 1: Tactics breakdown (SMS, Phone, Canvas)
        const tacticsChartData = [
          { name: 'SMS', value: metrics.tactics.sms || 0, color: CHART_COLORS.TACTIC.SMS },
          { name: 'Phone', value: metrics.tactics.phone || 0, color: CHART_COLORS.TACTIC.PHONE },
          { name: 'Canvas', value: metrics.tactics.canvas || 0, color: CHART_COLORS.TACTIC.CANVAS }
        ];
        
        // Chart 2: Contacts breakdown (Support, Oppose, Undecided)
        const contactsChartData = [
          { name: 'Support', value: metrics.contacts.support || 0, color: CHART_COLORS.CONTACT.SUPPORT },
          { name: 'Oppose', value: metrics.contacts.oppose || 0, color: CHART_COLORS.CONTACT.OPPOSE },
          { name: 'Undecided', value: metrics.contacts.undecided || 0, color: CHART_COLORS.CONTACT.UNDECIDED }
        ];
        
        // Chart 3: Not Reached breakdown (Not Home, Refusal, Bad Data)
        const notReachedChartData = [
          { name: 'Not Home', value: metrics.notReached.notHome || 0, color: CHART_COLORS.NOT_REACHED.NOT_HOME },
          { name: 'Refusal', value: metrics.notReached.refusal || 0, color: CHART_COLORS.NOT_REACHED.REFUSAL },
          { name: 'Bad Data', value: metrics.notReached.badData || 0, color: CHART_COLORS.NOT_REACHED.BAD_DATA }
        ];
        
        // Calculate the total not reached from the metrics
        const totalNotReachedValue = 
          (metrics.notReached.notHome || 0) + 
          (metrics.notReached.refusal || 0) + 
          (metrics.notReached.badData || 0);
        
        // Filter out any data points with empty/invalid dates or missing data
        const validatedLineData = (metrics.byDate || []).filter(item => {
          // Check if date is valid
          const isValidDate = item.date && isValid(parseISO(item.date));
          
          // Ensure we have at least some data for this date (non-zero)
          const hasData = item.attempts > 0 || item.contacts > 0 || item.issues > 0;
          
          return isValidDate && hasData;
        });
        
        console.log("Line chart data before filtering:", metrics.byDate?.length || 0, "entries");
        console.log("Line chart data after filtering:", validatedLineData.length, "entries");
        
        // Calculate totals
        const totalTactics = tacticsChartData.reduce((sum, item) => sum + item.value, 0);
        const totalContactsValue = contactsChartData.reduce((sum, item) => sum + item.value, 0);
        
        // Determine dataset name based on user's query or default
        // In a real implementation, this might come from metadata associated with the dataset
        const datasetNameValue = query.team 
          ? `${query.team} Team Dataset`
          : query.person
            ? `${query.person}'s Dataset`
            : "Voter Contacts Dataset";
        
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
