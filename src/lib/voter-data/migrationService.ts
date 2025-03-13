
import { supabase } from '../supabase';
import { TEST_DATA } from '@/types/analytics';

// Function to migrate test data to Supabase (run once)
export const migrateTestDataToSupabase = async () => {
  try {
    // Transform TEST_DATA to match Supabase schema
    const transformedData = TEST_DATA.map(item => ({
      first_name: item.firstName,
      last_name: item.lastName,
      team: item.team,
      date: item.date,
      tactic: item.tactic,
      attempts: item.attempts,
      contacts: item.contacts,
      not_home: item.notHome,
      refusal: item.refusal,
      bad_data: item.badData,
      support: item.support,
      oppose: item.oppose,
      undecided: item.undecided
    }));

    // Add Dan Kelly if not already in the data
    const danKellyExists = TEST_DATA.some(
      d => d.firstName === "Dan" && d.lastName === "Kelly"
    );
    
    if (!danKellyExists) {
      transformedData.push({
        first_name: "Dan",
        last_name: "Kelly",
        team: "Local Party",
        date: "2025-01-31",
        tactic: "Phone",
        attempts: 7,
        contacts: 3,
        not_home: 2,
        refusal: 1,
        bad_data: 1,
        support: 2,
        oppose: 0,
        undecided: 1
      });
    }

    // Insert data into Supabase
    const { error } = await supabase
      .from('voter_contacts')
      .insert(transformedData);

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error migrating data to Supabase:', error);
    return { success: false, error };
  }
};
