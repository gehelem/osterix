# URL Construction Logic - WebSocket and Image URLs

## Overview

The OstErix app uses specific URL construction logic depending on whether SSL/TLS is enabled or not.

---

## Non-SSL Configuration (secure: false)

### WebSocket
```
Protocol: ws://
Host: user-specified
Port: 9624 (WebSocket port, specified by user)
Path: (none)

Full URL: ws://192.168.1.100:9624
```

### Images
```
Protocol: http://
Host: user-specified
Port: 80 (implicit, not in URL)
Path: /ostmedia/...

Full URL: http://192.168.1.100/ostmedia/image.jpg
```

### Example Configuration
```
Host: 192.168.1.100
Port: 9624
Secure: OFF

Result:
  WebSocket: ws://192.168.1.100:9624
  Images:   http://192.168.1.100/ostmedia/...
```

---

## SSL/TLS Configuration (secure: true)

### WebSocket
```
Protocol: wss://
Host: user-specified
Port: 443 (implicit, NOT in URL)
Path: /ws/

Full URL: wss://192.168.1.100/ws/
```

### Images
```
Protocol: https://
Host: user-specified
Port: 443 (implicit, NOT in URL)
Path: /ostmedia/...

Full URL: https://192.168.1.100/ostmedia/image.jpg
```

### Example Configuration
```
Host: ostserver.example.com
Port: 9624 (ignored when SSL enabled)
Secure: ON

Result:
  WebSocket: wss://ostserver.example.com/ws/
  Images:   https://ostserver.example.com/ostmedia/...
```

---

## Key Differences

| Aspect | Non-SSL | SSL |
|--------|---------|-----|
| **WebSocket Protocol** | `ws://` | `wss://` |
| **WebSocket Port** | `:9624` (explicit) | implicit 443 (not in URL) |
| **WebSocket Path** | (none) | `/ws/` |
| **Image Protocol** | `http://` | `https://` |
| **Image Port** | implicit 80 (not in URL) | implicit 443 (not in URL) |

---

## Implementation in Code

### ServerConfigService

```typescript
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
```

---

## Port Behavior

### Port Field Behavior

**When Secure = OFF**
- Port field is used for WebSocket connection
- Default: 9624
- User can specify custom port if needed

**When Secure = ON**
- Port field is IGNORED
- WebSocket uses implicit port 443 (standard HTTPS port)
- Image HTTP also uses implicit port 443
- User sees hint: "Port ignoré en SSL (port 443 implicite)"

### Why This Design?

1. **Non-SSL**: Direct connection to WebSocket port (9624) on the server
2. **SSL**: Connection through reverse proxy (typically nginx) on standard HTTPS port (443)
   - The reverse proxy handles HTTPS/WSS termination
   - The proxy directs `/ws/` to the WebSocket server
   - The proxy directs everything else to the HTTP image server

---

## Reverse Proxy Example

When using SSL with a reverse proxy (nginx):

```nginx
server {
    listen 443 ssl http2;
    server_name ostserver.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # WebSocket reverse proxy
    location /ws/ {
        proxy_pass ws://localhost:9624;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Image server reverse proxy
    location /ostmedia/ {
        proxy_pass http://localhost:8080;
    }

    # Other endpoints
    location / {
        proxy_pass http://localhost:8080;
    }
}
```

With this setup:
- Client connects to `wss://ostserver.example.com/ws/` (port 443 implicit)
- Nginx terminates SSL and routes to `ws://localhost:9624`
- Client requests images from `https://ostserver.example.com/ostmedia/...`
- Nginx routes to `http://localhost:8080/ostmedia/...`

---

## Configuration Dialog Display

The configuration dialog shows hints about the port logic:

```
Port WebSocket: [9624_________________]
Non-SSL:  Port WebSocket (défaut: 9624, ignoré si SSL)
SSL:      Port ignoré en SSL (port 443 implicite)

☐ Connexion sécurisée (SSL/TLS)
  Non-SSL: ws://host:9624 (images: http://host:80)
  SSL:     wss://host/ws/ (images: https://host:443)
```

---

## Test Connection

The test connection button uses the HTTP endpoint:

```typescript
async testConnection(): Promise<boolean> {
  const testUrl = this.buildImageUrl('/');
  // Tests: http://host or https://host
  const response = await fetch(testUrl, {
    method: 'HEAD',
    mode: 'no-cors'
  });
  return response.ok || response.status === 0;  // 0 for CORS no-cors mode
}
```

---

## Real-World Examples

### Example 1: Home Network (Non-SSL)
```
Configuration:
  Host: 192.168.1.100
  Port: 9624
  Secure: OFF

Generated URLs:
  WebSocket: ws://192.168.1.100:9624
  Images:   http://192.168.1.100/ostmedia/...
  Test URL: http://192.168.1.100/
```

### Example 2: Remote Server (SSL)
```
Configuration:
  Host: ostserver.example.com
  Port: 9624 (ignored)
  Secure: ON

Generated URLs:
  WebSocket: wss://ostserver.example.com/ws/
  Images:   https://ostserver.example.com/ostmedia/...
  Test URL: https://ostserver.example.com/
```

### Example 3: Local mDNS (Non-SSL)
```
Configuration:
  Host: ostserver.local
  Port: 9624
  Secure: OFF

Generated URLs:
  WebSocket: ws://ostserver.local:9624
  Images:   http://ostserver.local/ostmedia/...
  Test URL: http://ostserver.local/
```

---

## Port Ranges and Standards

| Service | Protocol | Default Port | Notes |
|---------|----------|--------------|-------|
| WebSocket | ws:// | 9624 | Custom astronomy port |
| WebSocket Secure | wss:// | 443 | Standard HTTPS port |
| HTTP | http:// | 80 | Standard HTTP port (implicit) |
| HTTPS | https:// | 443 | Standard HTTPS port (implicit) |

---

## Summary

**Non-SSL (direct connection)**:
- WebSocket on port 9624: `ws://host:9624`
- Images on port 80: `http://host`

**SSL (via reverse proxy)**:
- WebSocket on port 443: `wss://host/ws/`
- Images on port 443: `https://host`
- Both use standard HTTPS port (no explicit port in URL)
