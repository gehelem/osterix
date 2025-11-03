import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * Service for building URLs dynamically based on the protocol (HTTP/HTTPS)
 * When using HTTPS with a reverse proxy (port 443), the reverse proxy path is used.
 * When using HTTP without SSL, the direct port (default 9624) is used.
 */
@Injectable({
  providedIn: 'root'
})
export class UrlBuilderService {

  constructor(@Inject(DOCUMENT) private document: Document) { }

  /**
   * Build URL for media files (/ostmedia/)
   * In HTTPS (reverse proxy): https://www.ostserver.fr/ostmedia/image.jpg
   * In HTTP (direct): http://localhost/ostmedia/image.jpg (served by web server on port 80)
   */
  buildMediaUrl(mediaPath: string, timestamp?: number): string {
    const protocol = this.document.location.protocol; // 'http:' or 'https:'
    const hostname = this.document.location.hostname;

    // Media files are served by the web server (same origin) without explicit port
    let url: string = `${protocol}//${hostname}/ostmedia/${mediaPath}`;

    // Add timestamp for cache busting if provided
    if (timestamp) {
      url += `?t=${timestamp}`;
    }

    return url;
  }

  /**
   * Build URL for any other OST server endpoint
   * In HTTPS (reverse proxy): https://www.ostserver.fr/endpoint/path
   * In HTTP (direct): http://hostname:9624/endpoint/path
   */
  buildServerUrl(endpoint: string): string {
    const protocol = this.document.location.protocol; // 'http:' or 'https:'
    const hostname = this.document.location.hostname;

    if (protocol === 'https:') {
      // Reverse proxy: use HTTPS without explicit port
      return `https://${hostname}${endpoint}`;
    } else {
      // Direct connection: use HTTP with explicit port
      return `http://${hostname}:9624${endpoint}`;
    }
  }
}
