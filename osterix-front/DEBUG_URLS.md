# URL Debugging Guide

## How to Check URLs in Browser Console

1. **Open your app** in browser (http://localhost:4200)
2. **Open DevTools** (F12)
3. **Go to Console tab**
4. **Type these commands to check the URLs**:

```javascript
// Check WebSocket service
angular.element(document.body).injector().get('WebsocketService').getWebSocketUrl()

// Check current config
angular.element(document.body).injector().get('ServerConfigService').getConfig()

// Check URL builder
angular.element(document.body).injector().get('UrlBuilderService').buildServerUrl('/ostmedia/')
```

## What You Should See

### For Non-SSL (Web on localhost:4200, Server on localhost:9624)

**WebSocket URL**:
```
ws://localhost:9624
```

**Image URLs**:
```
http://localhost/ostmedia/image.jpg
```

## What Might Go Wrong

### Issue 1: Port 9624 in HTTP URL
**Wrong**: `http://localhost:9624/ostmedia/...`
**Right**: `http://localhost/ostmedia/...`

### Issue 2: /ws/ not in WebSocket when SSL
**Wrong**: `wss://example.com`
**Right**: `wss://example.com/ws/`

### Issue 3: Port in HTTPS URL
**Wrong**: `https://example.com:443/ostmedia/...`
**Right**: `https://example.com/ostmedia/...`

## Checking Network Requests

1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Filter by WS** to see WebSocket connections
4. **Filter by XHR** to see API calls
5. **Look for**:
   - WebSocket connection to correct URL
   - HTTP requests to correct endpoints
   - CORS errors (if any)

## Common Issues and Solutions

### Problem: WebSocket fails to connect

**Check**:
1. Is OST server running?
2. What's the exact URL it's trying to connect to?
3. Are there CORS errors in console?
4. Is the port correct?

**Debug**:
```javascript
// Get the exact WebSocket URL
let url = angular.element(document.body).injector().get('WebsocketService').getWebSocketUrl();
console.log('Connecting to:', url);

// Try to connect manually in console
let ws = new WebSocket(url);
ws.onerror = (e) => console.error('Error:', e);
ws.onopen = () => console.log('Connected!');
```

### Problem: Images not loading

**Check**:
1. What URLs are being requested for images?
2. Are there 404 errors?
3. Are there CORS errors?

**Debug**:
```javascript
// Get the image URL
let url = angular.element(document.body).injector().get('UrlBuilderService').buildServerUrl('/ostmedia/test.jpg');
console.log('Image URL:', url);

// Try to fetch
fetch(url).then(r => console.log('Status:', r.status)).catch(e => console.error('Error:', e));
```

## Testing Checklist

- [ ] WebSocket URL is correct
- [ ] Image URL is correct
- [ ] No port specified in HTTP(S) URLs
- [ ] /ws/ is in wss:// URLs
- [ ] Port 9624 is only in ws:// URLs (non-SSL)
- [ ] WebSocket connects successfully
- [ ] Images load successfully
- [ ] No CORS errors in console
- [ ] No 404 errors

## Expected URLs by Configuration

### Web on localhost:4200, Server on localhost:9624 (HTTP)

```
WebSocket: ws://localhost:9624
Images:   http://localhost/ostmedia/...
```

### Web on https://example.com, Server on https://example.com/ws/ (SSL)

```
WebSocket: wss://example.com/ws/
Images:   https://example.com/ostmedia/...
```

## Browser Console Commands

```javascript
// Save reference to services
let ws = angular.element(document.body).injector().get('WebsocketService');
let config = angular.element(document.body).injector().get('ServerConfigService');
let urls = angular.element(document.body).injector().get('UrlBuilderService');

// Check WebSocket URL
console.log('WebSocket URL:', ws.getWebSocketUrl());

// Check config
console.log('Server Config:', config.getConfig());

// Check image URL
console.log('Image URL:', urls.buildServerUrl('/ostmedia/test.jpg'));

// Check media URL
console.log('Media URL:', urls.buildMediaUrl('test.jpg'));
```

## Logs to Look For

In the console, you should see:
```
WebsocketService initialized with URL: ws://localhost:9624
```

or (for SSL):
```
WebsocketService initialized with URL: wss://example.com/ws/
```

## Next Steps

1. **Build and run**: `ng serve`
2. **Open browser**: http://localhost:4200
3. **Open console**: F12 → Console
4. **Run commands** above
5. **Check URLs** match your configuration
6. **Report** what you see
