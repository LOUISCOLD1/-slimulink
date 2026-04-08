import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.slimulink.translator',
  appName: 'AI Voice Translator',
  webDir: 'dist',
  server: {
    // During development, point to your backend server
    // In production, leave empty to use bundled assets
    // url: 'http://YOUR_SERVER_IP:8000',
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#6366f1',
    },
  },
};

export default config;
