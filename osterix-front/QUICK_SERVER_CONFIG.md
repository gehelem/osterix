# Quick Server Configuration Guide

## TL;DR - Get Started in 2 Minutes

### For Users

1. **Open the app** on your Android device
2. **Go to Home page** and click settings ⚙️
3. **Enter server details**:
   - Host: `192.168.1.100` (your server IP)
   - Port: `9624` (default)
   - Secure: OFF (unless your server uses HTTPS)
4. **Click "Enregistrer"** to save
5. **Done!** App connects to your server

### For Developers

```bash
# Build
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug

# Install on device
./gradlew installDebug

# APK location
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Common Server Configurations

### Local Network
```
Host: 192.168.1.10
Port: 9624
Secure: OFF
```

### Using Hostname
```
Host: ostserver
Port: 9624
Secure: OFF
```

### Using mDNS
```
Host: ostserver.local
Port: 9624
Secure: OFF
```

### Remote Server (HTTPS)
```
Host: ostserver.example.com
Port: 443
Secure: ON
```

---

## Troubleshooting

**Can't connect?**
1. Open settings ⚙️
2. Click "Tester la connexion"
3. Fix any issues shown
4. Click "Enregistrer"

**Lost configuration?**
- It's saved automatically in device storage
- Open settings ⚙️ to see current config

**Wrong server?**
- Open settings ⚙️
- Change the address
- Click "Enregistrer"
- App reconnects automatically

---

## Files to Know About

**Configuration Service**:
- `src/app/services/server-config.service.ts` - Handles storage & URLs

**Dialog UI**:
- `src/app/dialogs/server-config-dialog.component.ts` - Settings interface

**Integration Points**:
- `src/app/app.component.ts` - Opens dialog from header button
- `src/app/services/websocket.service.ts` - Uses config for connection
- `src/app/services/url-builder.service.ts` - Uses config for image URLs

---

## Key Features

✅ **Easy Configuration** - GUI dialog, no coding required
✅ **Persistence** - Settings saved automatically
✅ **Connection Testing** - Verify before saving
✅ **Automatic Reconnection** - Switches server without restarting
✅ **Mobile-Friendly** - Responsive design works on all devices

---

## What Changed?

**Before**: Server hardcoded to localhost:9624
**After**: Server configurable at runtime via settings dialog

The configuration system seamlessly integrates with:
- WebSocket connections (ws:// or wss://)
- Image/media URLs (http:// or https://)
- Auto-reconnection on server change

---

## API (For Developers)

```typescript
// Get/save configuration
serverConfigService.getConfig()
serverConfigService.saveConfig({ host, port, secure })

// Build URLs
serverConfigService.buildWebSocketUrl()  // ws://host:port
serverConfigService.buildImageUrl(path)  // http://host:port/path

// Test connection
await serverConfigService.testConnection()

// Reconnect to new server
websocketService.reconnect()
```

---

## Build & Deploy

**Requirements**:
- Node.js & npm installed
- Android SDK configured
- Java 17+ installed

**Steps**:
```bash
# From project root
npm run build
npx cap sync android
cd android
./gradlew assembleDebug

# Install on device
./gradlew installDebug

# Or transfer APK manually
adb install app/build/outputs/apk/debug/app-debug.apk
```

**APK Ready**:
```
android/app/build/outputs/apk/debug/app-debug.apk (12 MB)
```

---

## Summary

The server configuration feature allows Android users to:
1. Specify which server to connect to
2. Test the connection before saving
3. Save the configuration permanently
4. Switch servers without app restart

Everything works on mobile, web is unchanged and backward compatible.

**Status**: ✅ Ready to use
