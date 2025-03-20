
import { supabase } from '@/integrations/supabase/client';

export const updateUserMetadata = async (userId: string, fileName: string): Promise<void> => {
  if (!userId) return;
  
  try {
    const uploadDate = new Date().toISOString();
    const { error } = await supabase.auth.updateUser({
      data: { 
        last_dataset_name: fileName,
        last_dataset_upload_date: uploadDate
      }
    });
    
    if (error) {
      console.error('Error updating user metadata:', error);
    }
  } catch (error) {
    console.error('Failed to update user metadata:', error);
  }
};
