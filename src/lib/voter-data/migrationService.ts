
import { supabase } from '@/integrations/supabase/client';

// Mock voter contact data with updated dates
const mockVoterContacts = [
  {
    id: 1,
    first_name: "John",
    last_name: "Smith",
    team: "Team A",
    tactic: "Phone Banking",
    date: "2025-01-01",
    attempts: 25,
    contacts: 10,
    not_home: 8,
    bad_data: 7,
    support: 5,
    oppose: 3,
    undecided: 2,
    refusal: 0
  },
  {
    id: 2,
    first_name: "Jane",
    last_name: "Doe",
    team: "Team B",
    tactic: "Canvassing",
    date: "2025-01-05",
    attempts: 50,
    contacts: 25,
    not_home: 15,
    bad_data: 10,
    support: 15,
    oppose: 5,
    undecided: 5,
    refusal: 0
  },
  {
    id: 3,
    first_name: "Alice",
    last_name: "Johnson",
    team: "Team A",
    tactic: "Texting",
    date: "2025-01-10",
    attempts: 75,
    contacts: 30,
    not_home: 0,
    bad_data: 45,
    support: 20,
    oppose: 5,
    undecided: 5,
    refusal: 0
  },
  {
    id: 4,
    first_name: "Bob",
    last_name: "Brown",
    team: "Team C",
    tactic: "Phone Banking",
    date: "2025-01-15",
    attempts: 30,
    contacts: 15,
    not_home: 10,
    bad_data: 5,
    support: 8,
    oppose: 4,
    undecided: 3,
    refusal: 0
  },
  {
    id: 5,
    first_name: "Carol",
    last_name: "White",
    team: "Team B",
    tactic: "Canvassing",
    date: "2025-01-20",
    attempts: 40,
    contacts: 20,
    not_home: 10,
    bad_data: 10,
    support: 12,
    oppose: 3,
    undecided: 5,
    refusal: 0
  },
  {
    id: 6,
    first_name: "David",
    last_name: "Green",
    team: "Team D",
    tactic: "Phone Banking",
    date: "2025-01-25",
    attempts: 35,
    contacts: 18,
    not_home: 12,
    bad_data: 5,
    support: 10,
    oppose: 3,
    undecided: 5,
    refusal: 0
  },
  {
    id: 7,
    first_name: "Emily",
    last_name: "Black",
    team: "Team E",
    tactic: "Texting",
    date: "2025-01-31",
    attempts: 60,
    contacts: 35,
    not_home: 0,
    bad_data: 25,
    support: 20,
    oppose: 5,
    undecided: 10,
    refusal: 0
  }
];

// This function now just returns true to simulate "migrated" data
export const migrateTestDataToSupabase = async () => {
  try {
    console.log("Using mock data instead of Supabase...");
    return { success: true, message: "Using mock data" };
  } catch (error) {
    console.error('Error in data migration process:', error);
    throw new Error("Migration failed");
  }
};

// Return the mock data instead of an empty array
export const getTestData = () => {
  return mockVoterContacts;
};

// This now returns true to indicate we're using mock data
export const isUsingMockData = () => {
  return true;
};
