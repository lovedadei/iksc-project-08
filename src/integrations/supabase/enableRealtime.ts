
import { supabase } from './client';

/**
 * Helper function to enable realtime updates on specific tables
 */
export const enableRealtimeForTables = async () => {
  try {
    // Enable realtime for pledges table
    await supabase.rpc('enable_realtime_for_table', { table_name: 'pledges' });
    console.log('Realtime enabled for pledges table');
    
    // Enable realtime for referrals table
    await supabase.rpc('enable_realtime_for_table', { table_name: 'referrals' });
    console.log('Realtime enabled for referrals table');
    
    return true;
  } catch (error) {
    console.error('Error enabling realtime:', error);
    return false;
  }
};
