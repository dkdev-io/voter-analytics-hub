
import { useState, useEffect } from "react";
import { type VoterMetrics } from "@/types/analytics";
import { isValid, parseISO } from "date-fns";
import { 
  detectTacticsFromData, 
  detectTeamsFromData, 
  detectResultTypesFromData,
  generateTacticsChartConfig,
  generateCategoricalChartConfig 
} from "@/services/dynamicChartService";
import { generateChartColors } from "@/utils/chartColorGenerator";

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
  const [rawData, setRawData] = useState<any[]>([]);
  const [detectedTactics, setDetectedTactics] = useState<string[]>([]);
  const [detectedTeams, setDetectedTeams] = useState<string[]>([]);

  useEffect(() => {
    if (isLoading || !metrics) {
      console.log("Formatting skipped: loading or no metrics", { isLoading, hasMetrics: !!metrics });
      return;
    }
    
    console.log("Formatting chart data from metrics:", metrics);
    console.log("Metrics byDate length:", metrics.byDate?.length || 0);

    // Dynamically detect tactics from actual data and generate chart data
    let tacticsChartData: any[] = [];
    
    // Check if we have raw data to detect tactics from
    if (metrics.rawData && Array.isArray(metrics.rawData)) {
      setRawData(metrics.rawData);
      const tactics = detectTacticsFromData(metrics.rawData);
      setDetectedTactics(tactics);
      
      // Generate dynamic tactics chart data
      tacticsChartData = tactics.map(tactic => {
        const tacticKey = tactic.toLowerCase();
        const value = metrics.tactics[tacticKey as keyof typeof metrics.tactics] || 0;
        return {
          name: tactic,
          value: value
        };
      }).filter(item => item.value > 0);
      
      // Add colors to the data
      tacticsChartData = generateChartColors(tacticsChartData, 'tactics');
    } else {
      // Fallback to standard tactics for backward compatibility
      const standardTactics = ['SMS', 'Phone', 'Canvas'];
      setDetectedTactics(standardTactics);
      
      tacticsChartData = standardTactics.map(tactic => {
        const tacticKey = tactic.toLowerCase() as keyof typeof metrics.tactics;
        return {
          name: tactic,
          value: metrics.tactics[tacticKey] || 0
        };
      }).filter(item => item.value > 0);
      
      // Add colors to the data
      tacticsChartData = generateChartColors(tacticsChartData, 'tactics');
    }
    
    // Dynamically generate contacts data
    let contactsChartData: any[] = [];
    
    if (rawData.length > 0) {
      const resultTypes = detectResultTypesFromData(rawData);
      const contactTypes = resultTypes.filter(type => 
        ['support', 'oppose', 'undecided', 'supporter', 'opposition'].some(keyword => 
          type.toLowerCase().includes(keyword)
        )
      );
      
      contactsChartData = contactTypes.map(type => {
        const typeKey = type.toLowerCase().replace(/\s+/g, '') as keyof typeof metrics.contacts;
        let value = 0;
        
        // Map various result types to metrics
        if (type.toLowerCase().includes('support')) {
          value = metrics.contacts.support || 0;
        } else if (type.toLowerCase().includes('oppose')) {
          value = metrics.contacts.oppose || 0;
        } else if (type.toLowerCase().includes('undecided')) {
          value = metrics.contacts.undecided || 0;
        }
        
        return {
          name: type,
          value: value
        };
      }).filter(item => item.value > 0);
    } else {
      // Fallback to standard contacts
      contactsChartData = [
        { name: "Support", value: metrics.contacts.support || 0 },
        { name: "Oppose", value: metrics.contacts.oppose || 0 },
        { name: "Undecided", value: metrics.contacts.undecided || 0 }
      ].filter(item => item.value > 0);
    }
    
    // Add colors to contacts data
    contactsChartData = generateChartColors(contactsChartData, 'contacts');
    
    // Dynamically generate not reached data
    let notReachedChartData: any[] = [];
    
    if (rawData.length > 0) {
      const resultTypes = detectResultTypesFromData(rawData);
      const notReachedTypes = resultTypes.filter(type => 
        ['not_home', 'not home', 'refusal', 'refused', 'bad_data', 'bad data', 'no answer', 'busy'].some(keyword => 
          type.toLowerCase().includes(keyword)
        )
      );
      
      notReachedChartData = notReachedTypes.map(type => {
        let value = 0;
        
        // Map various result types to metrics
        if (type.toLowerCase().includes('not') && type.toLowerCase().includes('home')) {
          value = metrics.notReached.notHome || 0;
        } else if (type.toLowerCase().includes('refus')) {
          value = metrics.notReached.refusal || 0;
        } else if (type.toLowerCase().includes('bad') && type.toLowerCase().includes('data')) {
          value = metrics.notReached.badData || 0;
        }
        
        return {
          name: type,
          value: value
        };
      }).filter(item => item.value > 0);
    } else {
      // Fallback to standard not reached categories
      notReachedChartData = [
        { name: "Not Home", value: metrics.notReached.notHome || 0 },
        { name: "Refusal", value: metrics.notReached.refusal || 0 },
        { name: "Bad Data", value: metrics.notReached.badData || 0 }
      ].filter(item => item.value > 0);
    }
    
    // Add colors to not reached data
    notReachedChartData = generateChartColors(notReachedChartData, 'notReached');
    
    console.log("[FormattedChartData] Tactics chart data:", tacticsChartData);
    console.log("[FormattedChartData] Contacts chart data:", contactsChartData);
    console.log("[FormattedChartData] Not Reached chart data:", notReachedChartData);
    
    // Calculate totals
    const calculatedTotalAttempts = tacticsChartData.reduce((sum, item) => sum + item.value, 0);
    const calculatedTotalContacts = contactsChartData.reduce((sum, item) => sum + item.value, 0);
    const calculatedTotalNotReached = notReachedChartData.reduce((sum, item) => sum + item.value, 0);
    
    console.log("[FormattedChartData] Total attempts:", calculatedTotalAttempts);
    console.log("[FormattedChartData] Total contacts:", calculatedTotalContacts);
    console.log("[FormattedChartData] Total not reached:", calculatedTotalNotReached);
    
    // Process line chart data - ensure we always have an array
    let validatedLineData: any[] = [];
    
    if (metrics.byDate && Array.isArray(metrics.byDate) && metrics.byDate.length > 0) {
      console.log("[FormattedChartData] Processing byDate array with length:", metrics.byDate.length);
      
      validatedLineData = metrics.byDate
        .filter((item) => {
          const isValidItem = item && item.date && isValid(parseISO(item.date));
          if (!isValidItem) {
            console.warn("[FormattedChartData] Invalid date item:", item);
          }
          return isValidItem;
        })
        .map((item) => ({
          ...item,
          attempts: Number(item.attempts) || 0,
          contacts: Number(item.contacts) || 0,
          issues: Number(item.issues) || 0,
        }));
      
      // Sort dates chronologically
      validatedLineData.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      console.log("[FormattedChartData] Processed line chart data items:", validatedLineData.length);
      console.log("[FormattedChartData] First few line chart items:", validatedLineData.slice(0, 3));
    } else {
      console.warn("[FormattedChartData] No valid byDate array in metrics, using empty array");
    }
    
    // In case we don't have line data but have other data, create at least one sample data point
    if (validatedLineData.length === 0 && calculatedTotalAttempts > 0) {
      console.log("[FormattedChartData] Creating sample data point for empty line chart");
      const today = new Date().toISOString().split('T')[0];
      validatedLineData = [{
        date: today,
        attempts: calculatedTotalAttempts,
        contacts: calculatedTotalContacts,
        issues: calculatedTotalNotReached
      }];
      console.log("[FormattedChartData] Created sample data point:", validatedLineData[0]);
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
    datasetName,
    rawData,
    detectedTactics,
    detectedTeams
  };
};
