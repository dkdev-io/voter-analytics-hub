// Demo data service that provides sample voter contact data
// This is used when the app is running in demo mode without authentication

import type { VoterContactRow } from './voter-data/migrationService';

// Generate realistic sample data for demonstration
export const generateDemoData = (): VoterContactRow[] => {
  const teams = ['Team A', 'Team B', 'Team C', 'Team D'];
  const tactics = ['Phone', 'Canvas', 'SMS'];
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Emily', 'James', 'Maria'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  
  const data: VoterContactRow[] = [];
  
  // Generate data for the last 30 days
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate 3-8 records per day
    const recordsPerDay = Math.floor(Math.random() * 6) + 3;
    
    for (let j = 0; j < recordsPerDay; j++) {
      const attempts = Math.floor(Math.random() * 5) + 1;
      const contacts = Math.floor(Math.random() * Math.min(attempts + 1, 3));
      const notHome = Math.floor(Math.random() * (attempts - contacts + 1));
      const refusal = Math.floor(Math.random() * (attempts - contacts - notHome + 1));
      const badData = attempts - contacts - notHome - refusal;
      
      // Distribute support/oppose/undecided among contacts
      const support = Math.floor(Math.random() * (contacts + 1));
      const oppose = Math.floor(Math.random() * (contacts - support + 1));
      const undecided = contacts - support - oppose;
      
      data.push({
        id: data.length + 1,
        first_name: firstNames[Math.floor(Math.random() * firstNames.length)],
        last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
        team: teams[Math.floor(Math.random() * teams.length)],
        date: dateStr,
        tactic: tactics[Math.floor(Math.random() * tactics.length)],
        attempts,
        contacts,
        not_home: notHome,
        refusal,
        bad_data: badData,
        support,
        oppose,
        undecided,
        user_id: null,
        user_email: null,
        label: 'Demo Data'
      });
    }
  }
  
  return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Get cached demo data or generate new data
let demoDataCache: VoterContactRow[] | null = null;

export const getDemoData = (): VoterContactRow[] => {
  if (!demoDataCache) {
    demoDataCache = generateDemoData();
    console.log(`Generated ${demoDataCache.length} demo records for chart testing`);
  }
  return demoDataCache;
};

// Clear demo data cache (useful for testing)
export const clearDemoDataCache = (): void => {
  demoDataCache = null;
};