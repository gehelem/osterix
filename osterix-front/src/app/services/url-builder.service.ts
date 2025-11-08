import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Capacitor } from '@capacitor/core';
import { ServerConfigService } from './server-config.service';

/**
 * Service for building URLs dynamically based on the protocol (HTTP/HTTPS)
 * When using HTTPS with a reverse proxy (port 443), the reverse proxy path is used.
 * When using HTTP without SSL, the direct port (default 9624) is used.
 * On mobile, uses ServerConfigService to get the configured server URL.
 */
@Injectable({
  providedIn: 'root'
})
export class UrlBuilderService {
  private isNativePlatform: boolean;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private serverConfigService: ServerConfigService
  ) {
    this.isNativePlatform = Capacitor.isNativePlatform();
  }

  /**
   * Build URL for media files (/ostmedia/)
   * In HTTPS (reverse proxy): https://www.ostserver.fr/ostmedia/image.jpg
   * In HTTP (direct): http://localhost/ostmedia/image.jpg (served by web server on port 80)
   * On mobile: uses ServerConfigService to get the configured server
   */
  buildMediaUrl(mediaPath: string, timestamp?: number): string {
    let url: string;

    // On mobile, use ServerConfigService
    if (this.isNativePlatform) {
      const baseUrl = this.serverConfigService.buildImageUrl('/ostmedia/');
      url = `${baseUrl}${mediaPath}`;
    } else {
      // On web, use document location
      const protocol = this.document.location.protocol; // 'http:' or 'https:'
      const hostname = this.document.location.hostname;

      // Media files are served by the web server (same origin) without explicit port
      url = `${protocol}//${hostname}/ostmedia/${mediaPath}`;
    }

    // Add timestamp for cache busting if provided
    if (timestamp) {
      url += `?t=${timestamp}`;
    }

    return url;
  }

  /**
   * Build URL for any other OST server endpoint
   * In HTTPS (reverse proxy): https://www.ostserver.fr/endpoint/path (port 443 implicit)
   * In HTTP (direct): http://hostname/endpoint/path (port 80 implicit)
   * On mobile: uses ServerConfigService to get the configured server
   */
  buildServerUrl(endpoint: string): string {
    // On mobile, use ServerConfigService
    if (this.isNativePlatform) {
      return this.serverConfigService.buildImageUrl(endpoint);
    }

    // On web, use document location (same origin as web page)
    const protocol = this.document.location.protocol; // 'http:' or 'https:'
    const hostname = this.document.location.hostname;

    // Both HTTP and HTTPS use implicit ports (80 and 443)
    // This matches same-origin policy for web deployments
    return `${protocol}//${hostname}${endpoint}`;
  }
}
