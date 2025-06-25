import { supabase } from '@/integrations/supabase/client';

class PingService {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly PING_INTERVAL = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

  start() {
    // Don't start if already running
    if (this.intervalId) return;

    // Initial ping
    this.pingSupabase();

    // Set up interval to ping every 3 days
    this.intervalId = setInterval(() => {
      this.pingSupabase();
    }, this.PING_INTERVAL);

    console.log('Ping service started - will ping Supabase every 3 days');
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
      // Simple query to keep the connection alive
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (error) {
        console.warn('Ping failed:', error.message);
      } else {
        console.log('Supabase ping successful at', new Date().toISOString());
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
