# OstErix Android - Test Instructions

## Quick Start Testing

### Install on Device/Emulator
```bash
# From project root
cd android
./gradlew installDebug

# Or manually
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Launch App
- Open OstErix app from app drawer
- Or: `adb shell am start -n com.osterix.app/com.osterix.app.MainActivity`

---

## What You Should See

### First Launch (Mobile)
```
Dialog Title: "Configuration du Serveur (Configuration requise)"

Form Fields:
  ✓ Adresse du serveur   [____________________]
  ✓ Port                  [9624________________]
  ✓ Connexion sécurisée   [Toggle OFF]

Preview:
  WebSocket URL: ws://localhost:9624
  HTTP URL:     http://localhost:9624

Buttons:
  ✓ Tester la connexion
  ✓ Démarrer

Note: NO Cancel or Réinitialiser buttons visible
```

### Configuration Steps
1. **Clear the default localhost** in address field
2. **Enter your server IP**:
   - Example: `192.168.1.100`
   - Or: `ostserver.local` (if using mDNS)
   - Or: `your.server.com` (if remote)

3. **Keep port 9624** (or adjust if needed)

4. **Leave Secure OFF** (unless your server uses HTTPS)

5. **Preview should update** in real-time:
   - If you entered `192.168.1.100`, preview shows:
   - WebSocket: `ws://192.168.1.100:9624`
   - HTTP: `http://192.168.1.100:9624`

6. **Optional: Test Connection**
   - Click "Tester la connexion" button
   - Should show: "Connexion réussie au serveur"
   - If fails, verify server IP and port

7. **Click "Démarrer"** to save and start app

### After Configuration
- Dialog closes
- App connects to your server
- Header shows:
  - "Connecté" (green) if connected
  - Module count: e.g., "(6 modules)"
- If not connecting:
  - Check server is running
  - Check firewall allows port 9624
  - Try test button again

---

## Troubleshooting

### Dialog Never Appears
- **On Desktop?** Dialog is skipped on desktop (expected)
- **Already configured?** Configuration saved, dialog skipped (expected)
- **On Android?** Check if Capacitor.isNativePlatform() is true

### Can't Type in Address Field
- Field should be editable
- Try clicking directly on input
- Check if keyboard appears

### Test Connection Shows Error
- **Server not running?** Start your OST server first
- **Wrong IP/port?** Verify correct server address
- **Firewall blocking?** Check firewall rules on server

### App Won't Connect After Configuration
- Check header shows red "Déconnecté"
- Click settings (⚙️) to verify saved configuration
- Try changing to different IP and save again
- Check server logs for connection attempts

### Configuration Not Saved
- Check localStorage in browser DevTools
- Key should be: `osterix_server_config`
- Value should be JSON like: `{"host":"192.168.1.100","port":9624,"secure":false}`

---

## Testing Checklist

### First Launch
- [ ] Dialog appears with title "(Configuration requise)"
- [ ] Address field is empty or has default
- [ ] Port field shows 9624
- [ ] Secure toggle is OFF
- [ ] Cancel button is HIDDEN
- [ ] Réinitialiser button is HIDDEN
- [ ] Button says "Démarrer" (not "Enregistrer")

### User Input
- [ ] Can type in address field
- [ ] Can change port number
- [ ] Can toggle secure on/off
- [ ] URL preview updates in real-time

### Connection Testing
- [ ] Click "Tester la connexion" shows loading spinner
- [ ] Shows success message if server reachable
- [ ] Shows error message if server unreachable
- [ ] Can test multiple times

### Saving Configuration
- [ ] Click "Démarrer" after entering config
- [ ] Dialog closes
- [ ] App attempts to connect
- [ ] Header shows connection status

### Second Launch
- [ ] Dialog does NOT appear
- [ ] App connects to saved server immediately
- [ ] Configuration is remembered

### Reconfiguration (Settings)
- [ ] Navigate to Home page
- [ ] Click settings (⚙️) button
- [ ] Dialog opens with previous config visible
- [ ] Cancel button is VISIBLE
- [ ] Réinitialiser button is VISIBLE
- [ ] Button says "Enregistrer" (not "Démarrer")
- [ ] Can change address
- [ ] Click "Enregistrer"
- [ ] App reconnects to new server

---

## Example Test Scenarios

### Scenario 1: Configure Localhost (for debugging)
```
Address: localhost
Port: 9624
Secure: OFF

Expected: App connects to local development server
```

### Scenario 2: Configure Local Network
```
Address: 192.168.1.100
Port: 9624
Secure: OFF

Expected: App connects to server on local network
```

### Scenario 3: Configure Remote Server with HTTPS
```
Address: ostserver.example.com
Port: 443
Secure: ON

Expected: App connects via wss://ostserver.example.com:443
```

### Scenario 4: Configure mDNS/Avahi
```
Address: ostserver.local
Port: 9624
Secure: OFF

Expected: App resolves hostname and connects
```

---

## Expected Behavior Summary

| Event | Expected Result |
|-------|-----------------|
| **First app launch (mobile)** | Dialog shows with "Configuration requise" |
| **User enters server address** | Preview updates in real-time |
| **User clicks test button** | Shows connection result |
| **User clicks Démarrer** | Dialog closes, app connects |
| **App connects successfully** | Header shows "Connecté (X modules)" |
| **Second app launch** | No dialog, connects to saved server |
| **Click settings on home page** | Dialog opens with saved config |
| **Change config and click Enregistrer** | App reconnects to new server |
| **Desktop/web launch** | Dialog never appears, connects immediately |

---

## Quick Test Commands

```bash
# Build everything
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug

# Install on emulator
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Launch
adb shell am start -n com.osterix.app/com.osterix.app.MainActivity

# View logs
adb logcat -s OstErix

# Remove and reinstall (fresh test)
adb uninstall com.osterix.app
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Success Criteria

✅ **Test Passes If**:
1. Configuration dialog appears on first mobile launch
2. User can enter server address
3. URL preview updates in real-time
4. Test button shows connection result
5. App connects to configured server
6. Modules load and display content
7. Second launch skips dialog
8. Settings allow reconfiguration
9. Desktop version works unchanged

---

## Performance Notes

- Dialog appears within 100ms of app start
- Connection test takes 1-2 seconds
- Module loading takes 2-5 seconds (depends on server)
- Reconfiguration reconnects within 500ms

---

## Next Steps After Testing

1. **If successful**: App is ready for production
2. **If issues**: Check troubleshooting section
3. **For remote testing**: Use Ngrok or similar to forward port
4. **For documentation**: Update with your server setup

---

**APK File**: `android/app/build/outputs/apk/debug/app-debug.apk`
**Status**: Ready to test! 🚀
