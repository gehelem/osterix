import { Injectable } from '@angular/core';
import { Capacitor, App } from '@capacitor/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CapacitorService {
  private isNative: boolean;
  private isPlatformReady: boolean = false;

  constructor(private router: Router) {
    this.isNative = Capacitor.isNativePlatform();
    this.initializePlatform();
  }

  /**
   * Initialize platform-specific features
   */
  private initializePlatform(): void {
    if (!this.isNative) {
      this.isPlatformReady = true;
      return;
    }

    // Setup Android back button handler
    this.setupBackButton();

    this.isPlatformReady = true;
  }

  /**
   * Setup Android back button handler
   */
  private setupBackButton(): void {
    App.addListener('backButton', async () => {
      // Check if we can go back in navigation history
      const currentRoute = this.router.url;

      // If we're at root, exit the app
      if (currentRoute === '/' || currentRoute === '') {
        // Confirm before exit
        const confirmed = confirm('Quitter l\'application?');
        if (confirmed) {
          App.exitApp();
        }
      } else {
        // Otherwise navigate back
        this.router.navigate(['/']);
      }
    });
  }

  /**
   * Check if running on native platform
   */
  isRunningOnNative(): boolean {
    return this.isNative;
  }

  /**
   * Check if platform is ready
   */
  isPlatformInitialized(): boolean {
    return this.isPlatformReady;
  }

  /**
   * Get current platform name
   */
  getPlatformName(): string {
    return Capacitor.getPlatform();
  }

  /**
   * Request permissions (for camera, microphone, etc.)
   */
  async requestPermissions(permissions: string[]): Promise<{ [key: string]: string }> {
    if (!this.isNative) {
      return {};
    }

    try {
      // For now, we'll just return granted for web
      // Actual permission handling would be done by specific plugins
      const result: { [key: string]: string } = {};
      permissions.forEach(perm => {
        result[perm] = 'granted';
      });
      return result;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return {};
    }
  }

  /**
   * Hide splash screen
   */
  async hideSplashScreen(): Promise<void> {
    if (this.isNative) {
      try {
        // This is handled by Capacitor automatically, but we can add custom handling here
        console.log('Splash screen ready to be hidden');
      } catch (error) {
        console.error('Error hiding splash screen:', error);
      }
    }
  }

  /**
   * Set status bar appearance
   */
  async setStatusBarStyle(style: 'light' | 'dark'): Promise<void> {
    if (this.isNative) {
      try {
        // Status bar styling would be handled by a specific plugin
        console.log('Status bar style set to:', style);
      } catch (error) {
        console.error('Error setting status bar style:', error);
      }
    }
  }

  /**
   * Check if device has internet connectivity
   */
  async checkNetworkStatus(): Promise<boolean> {
    if (!this.isNative) {
      return navigator.onLine;
    }

    try {
      // Would need additional plugin for network status
      // For now, return basic online status
      return navigator.onLine;
    } catch (error) {
      console.error('Error checking network status:', error);
      return false;
    }
  }

  /**
   * Get device info
   */
  async getDeviceInfo(): Promise<any> {
    if (!this.isNative) {
      return {
        platform: 'web',
        osVersion: navigator.userAgent
      };
    }

    try {
      // Would use Device plugin to get actual device info
      return {
        platform: Capacitor.getPlatform(),
        isNative: true
      };
    } catch (error) {
      console.error('Error getting device info:', error);
      return null;
    }
  }
}
