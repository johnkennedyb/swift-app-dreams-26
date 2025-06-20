
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.7d0efb0fc56f490e9127da573c76b6a4',
  appName: 'AppBacus',
  webDir: 'dist',
  server: {
    url: 'https://7d0efb0f-c56f-490e-9127-da573c76b6a4.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#7c3aed',
      showSpinner: false
    }
  }
};

export default config;
