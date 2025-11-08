# Quick Start: Building and Running OstErix on Android

This is the shortest path to get OstErix running on your Android device.

## Prerequisites (5 minutes)

1. **Android Device**
   - Android 6.0 or higher
   - USB debugging enabled: Settings > Developer Options > USB Debugging
   - Connected via USB to your computer

2. **Build Environment**
   ```bash
   node --version  # Should be 14+
   npm --version   # Should be 6+
   java -version   # Should be 11+
   ```

3. **Install Android SDK (if not already installed)**
   - Download Android Studio
   - Or use: `sudo apt-get install android-sdk` (Linux)

## One-Command Build (10 minutes)

```bash
cd /home/gilles/claude/OST/OstErix/osterix-front
npm install
./build-android.sh development apk
```

✓ Done! Your APK is ready at: `osterix-development.apk`

## Install on Device (2 minutes)

```bash
adb install -r osterix-development.apk
```

Wait for installation to complete, then:

```bash
adb logcat | grep osterix  # Optional: watch logs
```

## Configure Server Connection (1 minute)

1. Get your server IP:
   ```bash
   hostname -I  # On server machine
   ```
   Example: `192.168.1.100`

2. Open OstErix app on device

3. Connect to server:
   - Host: `192.168.1.100`
   - Port: `9624`
   - Secure: `OFF`

4. Tap Connect

## You're Ready! 🎉

Your OstErix mobile app is now connected and ready to control your telescope.

---

## Common Issues & Quick Fixes

### "Device not found"
```bash
adb devices  # List connected devices
# If offline:
adb kill-server && adb start-server
```

### "Cannot connect to server"
```bash
# On server, verify it's running:
ps aux | grep ostserver

# Check port is open:
netstat -tlnp | grep 9624

# From device, try pinging:
ping 192.168.1.100
```

### "Build fails"
```bash
./clean-android.sh all
npm install
./build-android.sh development apk
```

### "App crashes on startup"
```bash
adb logcat -c  # Clear logs
# Launch app again and check:
adb logcat | head -100
```

---

## Next Steps

- **Full Documentation**: See `ANDROID_BUILD.md`
- **User Guide**: See `MOBILE_SETUP.md`
- **Production Build**: `./build-android.sh production apk`
- **Play Store**: See `ANDROID_BUILD.md` > Building for Google Play Store

---

## Directory Structure

```
osterix-front/
├── build-android.sh        ← Run this!
├── QUICK_START_ANDROID.md  ← You are here
├── ANDROID_BUILD.md        ← Full guide
├── MOBILE_SETUP.md         ← User guide
└── android/
    ├── app/
    │   └── build.gradle    ← Android config
    └── gradlew             ← Build tool
```

## Useful Commands

```bash
# List available devices
adb devices -l

# View app logs in real-time
adb logcat | grep osterix

# Open Android debugger in Chrome
chrome://inspect/#devices

# Uninstall app from device
adb uninstall com.osterix.app

# Clear app data
adb shell pm clear com.osterix.app

# Get device info
adb shell getprop ro.build.version.sdk

# Record device screen
adb shell screenrecord /sdcard/video.mp4
adb pull /sdcard/video.mp4

# Take screenshot
adb shell screencap -p /sdcard/screen.png
adb pull /sdcard/screen.png
```

## Support

If you encounter issues:

1. Check `ANDROID_BUILD.md` > Troubleshooting section
2. View server logs: `journalctl -u ostserver -f`
3. View app logs: `adb logcat`
4. Verify network: `ping <server-ip>`

Happy observing! 🔭✨
