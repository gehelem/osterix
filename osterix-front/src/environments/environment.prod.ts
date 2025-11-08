import { Capacitor } from '@capacitor/core';

export const environment = {
  production: true,
  isNative: Capacitor.isNativePlatform(),
  platform: Capacitor.getPlatform(),
  // Production server configuration
  // On mobile, this should be configured via app settings
  serverHost: 'localhost',
  serverPort: 9624,
  useSecureConnection: true // Always use secure in production
};
