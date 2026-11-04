import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bcare.health',
  appName: 'B care',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // In local development, you can uncomment below to live-reload on mobile devices:
    // url: 'http://192.168.1.X:3000',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      backgroundColor: "#09090b",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#10b981"
    }
  }
};

export default config;
