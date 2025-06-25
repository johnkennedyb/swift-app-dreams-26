
import { supabase } from '@/integrations/supabase/client';

class PingService {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly PING_INTERVAL = 12 * 60 * 60 * 1000; // 12 hours instead of 3 days for better reliability

  start() {
    // Don't start if already running
    if (this.intervalId) return;

    // Initial ping
    this.pingSupabase();

    // Set up interval to ping every 12 hours
    this.intervalId = setInterval(() => {
      this.pingSupabase();
    }, this.PING_INTERVAL);

    console.log('Ping service started - will ping Supabase every 12 hours');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Ping service stopped');
    }
  }

  private async pingSupabase() {
    try {
      // Multiple ping strategies to ensure connection stays alive
      const promises = [
        // Ping profiles table
        supabase.from('profiles').select('id').limit(1),
        // Ping projects table
        supabase.from('projects').select('id').limit(1),
        // Ping wallets table
        supabase.from('wallets').select('id').limit(1)
      ];

      const results = await Promise.allSettled(promises);
      
      const successCount = results.filter(result => result.status === 'fulfilled').length;
      
      if (successCount > 0) {
        console.log(`Supabase ping successful (${successCount}/3 queries) at`, new Date().toISOString());
      } else {
        console.warn('All ping queries failed at', new Date().toISOString());
      }
    } catch (error) {
      console.warn('Ping error:', error);
    }
  }

  // Method to manually trigger a ping
  async ping() {
    await this.pingSupabase();
  }
}

export const pingService = new PingService();
