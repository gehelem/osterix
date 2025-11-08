import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.osterix.app',
  appName: 'OstErix',
  webDir: 'dist/osterix-front',
  ios: {
    contentInsetAdjustmentBehavior: 'automatic',
  },
  android: {
    useLegacyBridge: false,
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
