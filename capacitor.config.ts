import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aurora.podcast',
  appName: 'Aurora Podcast',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  android: {
    contentInset: 'automatic',
    backgroundColor: '#1e3a5f',
    allowMixedContent: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1e3a5f',
      showSpinner: false
    }
  }
};

export default config;
