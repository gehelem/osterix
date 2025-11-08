import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// Register French locale data for number formatting
registerLocaleData(localeFr);

if (environment.production) {
  enableProdMode();
}

// Initialize Capacitor before Angular bootstrap
import { Capacitor } from '@capacitor/core';

// Ensure Capacitor is initialized for native features
if (Capacitor.getPlatform() !== 'web') {
  // On native platforms, wait for device ready
  document.addEventListener('deviceready', () => {
    platformBrowserDynamic().bootstrapModule(AppModule)
      .catch(err => console.error(err));
  });
} else {
  // On web, bootstrap immediately
  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
}
