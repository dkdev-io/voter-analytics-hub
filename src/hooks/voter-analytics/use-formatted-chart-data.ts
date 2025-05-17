
import { useState, useEffect } from "react";
import { type VoterMetrics, CHART_COLORS } from "@/types/analytics";
import { isValid, parseISO } from "date-fns";

interface UseFormattedChartDataProps {
  metrics: VoterMetrics | null;
  isLoading: boolean;
}

export const useFormattedChartData = ({ 
  metrics, 
  isLoading 
}: UseFormattedChartDataProps) => {
  const [tacticsData, setTacticsData] = useState<any[]>([]);
  const [contactsData, setContactsData] = useState<any[]>([]);
  const [notReachedData, setNotReachedData] = useState<any[]>([]);
  const [lineChartData, setLineChartData] = useState<any[]>([]);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalContacts, setTotalContacts] = useState(0);
  const [totalNotReached, setTotalNotReached] = useState(0);
  const [datasetName, setDatasetName] = useState<string>("");

  useEffect(() => {
    if (isLoading || !metrics) return;
    
    console.log("Formatting chart data from metrics:", metrics);

    // Format tactics data for pie chart
    const tacticsChartData = [
      {
        name: "SMS",
        value: metrics.tactics.sms || 0,
        color: CHART_COLORS.TACTIC.SMS,
      },
      {
        name: "Phone",
        value: metrics.tactics.phone || 0,
        color: CHART_COLORS.TACTIC.PHONE,
      },
      {
        name: "Canvas",
        value: metrics.tactics.canvas || 0,
        color: CHART_COLORS.TACTIC.CANVAS,
      },
    ];
    
    // Format contacts data for pie chart
    const contactsChartData = [
      {
        name: "Support",
        value: metrics.contacts.support || 0,
        color: CHART_COLORS.CONTACT.SUPPORT,
      },
      {
        name: "Oppose",
        value: metrics.contacts.oppose || 0,
        color: CHART_COLORS.CONTACT.OPPOSE,
      },
      {
        name: "Undecided",
        value: metrics.contacts.undecided || 0,
        color: CHART_COLORS.CONTACT.UNDECIDED,
      },
    ];
    
    // Format not reached data for pie chart
    const notReachedChartData = [
      {
        name: "Not Home",
        value: metrics.notReached.notHome || 0,
        color: CHART_COLORS.NOT_REACHED.NOT_HOME,
      },
      {
        name: "Refusal",
        value: metrics.notReached.refusal || 0,
        color: CHART_COLORS.NOT_REACHED.REFUSAL,
      },
      {
        name: "Bad Data",
        value: metrics.notReached.badData || 0,
        color: CHART_COLORS.NOT_REACHED.BAD_DATA,
      },
    ];
    
    console.log("[FormattedChartData] Tactics chart data:", tacticsChartData);
    console.log("[FormattedChartData] Contacts chart data:", contactsChartData);
    console.log("[FormattedChartData] Not Reached chart data:", notReachedChartData);
    
    // Calculate totals
    const calculatedTotalAttempts = tacticsChartData.reduce((sum, item) => sum + item.value, 0);
    const calculatedTotalContacts = contactsChartData.reduce((sum, item) => sum + item.value, 0);
    const calculatedTotalNotReached = notReachedChartData.reduce((sum, item) => sum + item.value, 0);
    
    console.log("[FormattedChartData] Total attempts:", calculatedTotalAttempts);
    
    // Process line chart data
    let validatedLineData: any[] = [];
    if (metrics.byDate && Array.isArray(metrics.byDate)) {
      validatedLineData = metrics.byDate
        .filter((item) => item && item.date && isValid(parseISO(item.date)))
        .map((item) => ({
          ...item,
          attempts: item.attempts || 0,
          contacts: item.contacts || 0,
          issues: item.issues || 0,
        }));
      
      // Sort date chronologically
      validatedLineData.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      console.log("[FormattedChartData] Line chart data:", validatedLineData);
    } else {
      console.warn("[FormattedChartData] No valid byDate array in metrics");
    }
    
    setTacticsData(tacticsChartData);
    setContactsData(contactsChartData);
    setNotReachedData(notReachedChartData);
    setLineChartData(validatedLineData);
    setTotalAttempts(calculatedTotalAttempts);
    setTotalContacts(calculatedTotalContacts);
    setTotalNotReached(calculatedTotalNotReached);
    
  }, [metrics, isLoading]);

  return {
    tacticsData,
    contactsData,
    notReachedData,
    lineChartData,
    totalAttempts,
    totalContacts,
    totalNotReached,
    datasetName
  };
};
