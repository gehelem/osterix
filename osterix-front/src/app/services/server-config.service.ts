import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ServerConfig {
  host: string;
  port: number;
  secure: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ServerConfigService {
  private readonly STORAGE_KEY = 'osterix_server_config';
  private readonly DEFAULT_CONFIG: ServerConfig = {
    host: 'localhost',
    port: 9624,
    secure: false
  };

  private configSubject = new BehaviorSubject<ServerConfig>(this.loadConfig());
  public config$: Observable<ServerConfig> = this.configSubject.asObservable();

  constructor() {
    // Load saved configuration on service initialization
    console.log('Server config loaded:', this.configSubject.value);
  }

  /**
   * Load configuration from localStorage or return defaults
   */
  private loadConfig(): ServerConfig {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const config = JSON.parse(saved);
        console.log('Loaded saved server config from localStorage:', config);
        return config;
      }
    } catch (error) {
      console.error('Error loading server config from localStorage:', error);
    }
    return this.DEFAULT_CONFIG;
  }

  /**
   * Save configuration to localStorage and update subject
   */
  saveConfig(config: ServerConfig): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
      this.configSubject.next(config);
      console.log('Server config saved:', config);
    } catch (error) {
      console.error('Error saving server config to localStorage:', error);
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): ServerConfig {
    return this.configSubject.value;
  }

  /**
   * Build WebSocket URL from current config
   *
   * Non-SSL: ws://host:9624
   * SSL: wss://host/ws/ (port 443 is implicit, not in URL)
   */
  buildWebSocketUrl(): string {
    const config = this.getConfig();

    if (config.secure) {
      // SSL: wss://host/ws/ with implicit port 443
      return `wss://${config.host}/ws/`;
    } else {
      // Non-SSL: ws://host:9624
      return `ws://${config.host}:${config.port}`;
    }
  }

  /**
   * Build image server URL from current config
   *
   * Non-SSL: http://host/ostmedia/... (port 80 implicit)
   * SSL: https://host/ostmedia/... (port 443 implicit)
   */
  buildImageUrl(path: string): string {
    const config = this.getConfig();

    if (config.secure) {
      // SSL: https://host with implicit port 443
      return `https://${config.host}${path}`;
    } else {
      // Non-SSL: http://host with implicit port 80
      return `http://${config.host}${path}`;
    }
  }

  /**
   * Reset to default configuration
   */
  resetToDefaults(): void {
    this.saveConfig(this.DEFAULT_CONFIG);
    console.log('Server config reset to defaults');
  }

  /**
   * Test connection to the configured server
   * Tests the HTTP endpoint (not WebSocket which is harder to test)
   */
  async testConnection(): Promise<boolean> {
    try {
      const testUrl = this.buildImageUrl('/');

      const response = await fetch(testUrl, {
        method: 'HEAD',
        mode: 'no-cors'
      });

      console.log('Server connection test response:', response.status);
      return true;
    } catch (error) {
      console.error('Server connection test failed:', error);
      return false;
    }
  }
}
