# Server Configuration Setup for OstErix Android App

## Overview

The OstErix Android app now includes a comprehensive server configuration system that allows users to specify the server host, port, and connection security without hardcoding values. This is essential for mobile deployments where the server address may vary between development, testing, and production environments.

## Features

### 1. Server Configuration Dialog
- **Location**: Accessible via the settings button (⚙️) in the header
- **Routes**: Available on Home and Messages pages
- **Form Fields**:
  - **Server Address**: Hostname or IP address (required)
  - **Port**: Server port number (1-65535, default: 9624)
  - **Secure Connection**: Toggle for HTTPS/WSS (SSL/TLS)

### 2. Configuration Persistence
- Configuration is stored in browser's localStorage (or mobile app's equivalent)
- Automatically loaded on app startup
- Survives app restarts and page reloads
- Default configuration: `localhost:9624` (non-secure)

### 3. URL Preview
- Real-time preview of WebSocket URL (e.g., `ws://192.168.1.10:9624`)
- Real-time preview of HTTP URL (e.g., `http://192.168.1.10:9624`)
- Updates as user types

### 4. Connection Testing
- **Test Connection Button**: Validates server connectivity before saving
- Tests both WebSocket and HTTP protocols
- Provides visual feedback (success/error messages)
- Helps users verify configuration before saving

### 5. Automatic Reconnection
- When configuration is saved, the app automatically reconnects to the new server
- Disconnects from old server and connects to new one
- User sees status update in the header connection indicator

## Components

### ServerConfigService (`src/app/services/server-config.service.ts`)
Central service for managing server configuration:

```typescript
interface ServerConfig {
  host: string;      // Hostname or IP address
  port: number;      // Port number (1-65535)
  secure: boolean;   // Use HTTPS/WSS if true
}
```

**Key Methods**:
- `getConfig()`: Returns current configuration
- `saveConfig(config)`: Save to localStorage and update subject
- `buildWebSocketUrl()`: Construct WebSocket URL (ws:// or wss://)
- `buildImageUrl(path)`: Construct HTTP URL for images
- `testConnection()`: Async test connectivity to server
- `resetToDefaults()`: Reset to default localhost:9624

### ServerConfigDialogComponent (`src/app/dialogs/server-config-dialog.component.ts`)
Dialog UI for editing server configuration:

**Features**:
- Form validation (required fields, port range)
- Real-time URL preview
- Connection testing with loading state
- Save/Cancel/Reset actions
- Integration with WebsocketService for reconnection

### Updated Services

#### WebsocketService
- Now uses `ServerConfigService` on mobile platforms
- Mobile platforms use `buildWebSocketUrl()` from ServerConfigService
- Web platforms continue using document location for backward compatibility
- New `reconnect()` method to reconnect with new configuration
- `setServerHost()` now also updates ServerConfigService

#### UrlBuilderService
- Now detects mobile platform and uses ServerConfigService
- `buildMediaUrl()`: Uses ServerConfigService on mobile
- `buildServerUrl()`: Uses ServerConfigService on mobile
- Web platforms continue using document location

## Usage

### User Workflow

1. **Open Server Config Dialog**:
   - Navigate to Home or Messages page
   - Click settings button (⚙️) in header
   - Server Configuration dialog opens

2. **Enter Server Details**:
   - Type server hostname (e.g., `192.168.1.100` or `ostserver.local`)
   - Enter port number (default: 9624)
   - Toggle secure connection if server uses HTTPS/WSS

3. **Test Connection** (optional):
   - Click "Tester la connexion" button
   - Wait for test to complete
   - Success/error message displays

4. **Save Configuration**:
   - Click "Enregistrer" button
   - Configuration saved to localStorage
   - App automatically reconnects to new server
   - Header shows connection status

### Default Configuration
```typescript
{
  host: 'localhost',
  port: 9624,
  secure: false
}
```

## Technical Details

### Storage
- Uses browser's `localStorage` API
- Key: `osterix_server_config`
- Format: JSON serialized ServerConfig object
- Mobile apps: Same API available via Capacitor

### Fallback Behavior
- If localStorage is unavailable, uses in-memory config
- Default config loaded if stored config is invalid
- Graceful error handling for malformed JSON

### Platform Detection
- Capacitor `isNativePlatform()` detects mobile builds
- Mobile: Uses ServerConfigService exclusively
- Web: Uses document location (backward compatible)

### URL Construction

**WebSocket URLs**:
- Non-secure: `ws://hostname:port`
- Secure: `wss://hostname:port`

**HTTP URLs**:
- Non-secure: `http://hostname:port`
- Secure: `https://hostname:port`

## Integration Points

### AppComponent
- Opens ServerConfigDialog when settings button clicked on home/messages
- New method: `openServerConfigDialog()`

### Module Parameters Dialogs
- Can also be enhanced to use ServerConfigService if needed
- Currently only available on home/messages pages

## Testing

### Manual Testing Steps

1. **Build the app**:
   ```bash
   npm run build
   npx cap sync android
   ./gradlew assembleDebug
   ```

2. **Test on Android Device/Emulator**:
   - Install APK: `./gradlew installDebug`
   - Open app on device
   - Navigate to Home page
   - Click settings button (⚙️)
   - Enter server details
   - Click "Tester la connexion"
   - Verify success/error message
   - Click "Enregistrer"
   - Verify header shows connected status

3. **Verify Persistence**:
   - Close app
   - Reopen app
   - Configuration should still be loaded
   - Server details should match previous input

4. **Test Different Scenarios**:
   - Local network server (e.g., `192.168.1.10:9624`)
   - Different ports (e.g., `hostname:8080`)
   - Secure connections (toggle SSL checkbox)

## Common Scenarios

### Scenario 1: Local Network Server
```
Host: 192.168.1.100
Port: 9624
Secure: false
Result: ws://192.168.1.100:9624
```

### Scenario 2: Remote Server with SSL
```
Host: ostserver.example.com
Port: 443
Secure: true
Result: wss://ostserver.example.com:443
```

### Scenario 3: Local Development
```
Host: localhost
Port: 9624
Secure: false
Result: ws://localhost:9624
```

## Troubleshooting

### App Won't Connect
1. Check configuration in settings
2. Verify server hostname/IP is reachable
3. Verify port is correct
4. Check if secure toggle matches server configuration
5. Test connection in dialog before saving

### Configuration Lost on App Restart
1. Check if localStorage is enabled
2. Check app permissions for storage
3. Try resetting configuration to defaults
4. Check device storage space

### Test Connection Button Shows Error
1. Verify server is running
2. Verify hostname/IP is correct
3. Check firewall allows connections on the port
4. Try connecting from another device to verify
5. Check server logs for connection errors

## Future Enhancements

1. **Server Discovery**: Automatic discovery via Avahi/ZeroConf
2. **Connection History**: Save multiple server configurations
3. **SSL Certificate Validation**: Option to skip/validate certificates
4. **Connection Timeout**: Configurable timeout for connection tests
5. **Advanced Settings**: Custom paths, proxy configuration, etc.

## API Reference

### ServerConfigService

```typescript
// Get current configuration
getConfig(): ServerConfig

// Save configuration to localStorage
saveConfig(config: ServerConfig): void

// Build WebSocket URL from config
buildWebSocketUrl(): string
// Returns: "ws://localhost:9624" or "wss://hostname:port"

// Build HTTP URL for images and files
buildImageUrl(path: string): string
// Returns: "http://localhost:9624/path" or "https://hostname:port/path"

// Test server connectivity
async testConnection(): Promise<boolean>

// Reset to default configuration
resetToDefaults(): void
```

### WebsocketService

```typescript
// Reconnect with new server configuration
reconnect(): void

// Set custom server host (also updates ServerConfigService)
setServerHost(host: string, port?: number, useSecure?: boolean): void

// Get current WebSocket URL
getWebSocketUrl(): string
```

### UrlBuilderService

```typescript
// Build media file URL
buildMediaUrl(mediaPath: string, timestamp?: number): string

// Build any server endpoint URL
buildServerUrl(endpoint: string): string
```

## Files Modified/Created

### Created
- `src/app/dialogs/server-config-dialog.component.ts`
- `src/app/dialogs/server-config-dialog.component.html`
- `src/app/dialogs/server-config-dialog.component.css`
- `src/app/services/server-config.service.ts`

### Modified
- `src/app/app.component.ts` - Added ServerConfigDialog import and method
- `src/app/app.module.ts` - Declared ServerConfigDialogComponent
- `src/app/services/websocket.service.ts` - Integrated ServerConfigService
- `src/app/services/url-builder.service.ts` - Integrated ServerConfigService

## Build Status

✅ **Build Successful** (1.59 MB initial bundle)
- All TypeScript compilation passes
- No critical errors
- Minor warnings only (style fixes, optional chaining)
- Ready for Android deployment
