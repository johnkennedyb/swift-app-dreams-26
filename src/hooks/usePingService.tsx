
import { useEffect } from 'react';
import { pingService } from '@/services/pingService';

export const usePingService = () => {
  useEffect(() => {
    // Start the ping service when the hook mounts
    pingService.start();

    // Cleanup function to stop the service when component unmounts
    return () => {
      pingService.stop();
    };
  }, []);

  return {
    ping: () => pingService.ping(),
  };
};
