// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { Capacitor } from '@capacitor/core';

export const environment = {
  production: false,
  isNative: Capacitor.isNativePlatform(),
  platform: Capacitor.getPlatform(),
  // Default server configuration for development
  // On mobile, this should be overridden by user input
  serverHost: 'localhost',
  serverPort: 9624,
  useSecureConnection: !Capacitor.isNativePlatform() // Use secure for web, allow insecure for local dev on mobile
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
