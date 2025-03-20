
import type { QueryParams, VoterMetrics } from '@/types/analytics';
import { filterVoterData } from './filterService';

/**
 * Calculates the result value based on filtered data and query type
 */
export const calculateResult = (filteredData: any[], resultType: string | undefined) => {
  if (filteredData.length === 0) {
    return 0;
  }
  
  // Map the display result type to the actual property name in the data
  let propertyName = resultType ? 
    resultType.toLowerCase().replace(/ /g, "_") : 
    "attempts";
  
  // Special handling for specific property names
  if (propertyName === "not_home") {
    propertyName = "not_home";
  } else if (propertyName === "bad_data") {
    propertyName = "bad_data";
  } else if (propertyName === "supporters") {
    propertyName = "support";
  }
  
  // Calculate the sum with detailed logging for each record
  let total = 0;
  
  for (const item of filteredData) {
    const value = Number(item[propertyName as keyof typeof item]) || 0;
    total += value;
  }
  
  console.log(`Final total for query: ${total}`);
  return total;
};

/**
 * Aggregates voter data into metrics
 */
export const aggregateVoterMetrics = (filteredData: any[]): VoterMetrics => {
  // Initialize metrics structure
  const metrics: VoterMetrics = {
    tactics: {
      sms: 0,
      phone: 0,
      canvas: 0
    },
    contacts: {
      support: 0,
      oppose: 0,
      undecided: 0
    },
    notReached: {
      notHome: 0,
      refusal: 0,
      badData: 0
    },
    teamAttempts: {},
    byDate: []
  };
  
  // Get unique dates
  const uniqueDates = [...new Set(filteredData.map(item => item.date))].sort();
  
  // Create byDate data structure
  const dateData = uniqueDates.map(date => {
    const dateItems = filteredData.filter(item => item.date === date);
    const attempts = dateItems.reduce((sum, item) => sum + (item.attempts || 0), 0);
    const contacts = dateItems.reduce((sum, item) => sum + (item.contacts || 0), 0);
    // "issues" are the sum of not_home, refusal, and bad_data
    const issues = dateItems.reduce((sum, item) => 
      sum + (item.not_home || 0) + (item.refusal || 0) + (item.bad_data || 0), 0);
    
    return {
      date,
      attempts,
      contacts,
      issues
    };
  });
  
  metrics.byDate = dateData;
  
  // Aggregate data
  filteredData.forEach(item => {
    // Aggregate by tactic
    if (item.tactic.toLowerCase() === 'sms') {
      metrics.tactics.sms += item.attempts || 0;
    } else if (item.tactic.toLowerCase() === 'phone') {
      metrics.tactics.phone += item.attempts || 0;
    } else if (item.tactic.toLowerCase() === 'canvas') {
      metrics.tactics.canvas += item.attempts || 0;
    }
    
    // Aggregate contacts by result
    metrics.contacts.support += item.support || 0;
    metrics.contacts.oppose += item.oppose || 0;
    metrics.contacts.undecided += item.undecided || 0;
    
    // Aggregate not reached
    metrics.notReached.notHome += item.not_home || 0;
    metrics.notReached.refusal += item.refusal || 0;
    metrics.notReached.badData += item.bad_data || 0;
  });
  
  return metrics;
};
