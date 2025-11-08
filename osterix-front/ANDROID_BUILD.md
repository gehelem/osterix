# Building OstErix for Android with Capacitor

This guide explains how to build and deploy the OstErix application to Android devices using Capacitor and Gradle.

## Prerequisites

### Required Software
- **Node.js** (14.x or higher)
- **npm** (6.x or higher)
- **Java Development Kit** (JDK 11 or higher)
- **Android SDK** (API 23 minimum, tested on 35)
- **Gradle** (8.1.1 or higher, included in Android Gradle plugin)
- **Git** (for version control)

### Environment Setup

```bash
# Install Android SDK
# On macOS with Homebrew:
brew install android-sdk

# On Linux:
sudo apt-get install android-sdk

# Set ANDROID_SDK_ROOT environment variable
export ANDROID_SDK_ROOT=$HOME/Library/Android/sdk  # macOS
export ANDROID_SDK_ROOT=$HOME/Android/Sdk          # Linux
```

### IDE (Optional)
- Android Studio (recommended for development/debugging)
- Visual Studio Code with Android extensions

## Quick Start

### Build Development APK

```bash
# 1. Install dependencies
npm install

# 2. Build development APK
./build-android.sh development apk

# 3. Install on device
adb install -r osterix-development.apk

# 4. Run app and check logs
adb logcat | grep osterix
```

### Build Production APK

```bash
# 1. Install dependencies
npm install

# 2. Build production APK
./build-android.sh production apk

# 3. Install on device
adb install -r osterix-production.apk
```

### Build for Google Play Store (AAB)

```bash
# 1. Generate signing key (first time only)
keytool -genkey -v -keystore osterix.keystore \
  -keyalg RSA -keysize 2048 -validity 10000

# 2. Configure signing in gradle.properties
# (Store keystore path and passwords securely)

# 3. Build release AAB
./build-android.sh production aab

# 4. Upload to Google Play Console
# Navigate to: Release > App bundles > Upload
```

## Detailed Build Process

### Step 1: Angular App Build

The build script compiles the Angular application to static files:

```bash
npm run build -- --configuration production
```

This creates optimized production files in `dist/osterix-front/`.

### Step 2: Capacitor Sync

Synchronizes the web app with Android native code:

```bash
npx cap sync android
```

This copies the dist files to the Android app's assets directory.

### Step 3: Android Build

Compiles the Android project using Gradle:

```bash
cd android
./gradlew assembleDebug    # Debug APK
./gradlew assembleRelease  # Release APK
./gradlew bundleRelease    # AAB for Play Store
cd ..
```

## Configuration Files

### capacitor.config.ts
Defines app metadata and Capacitor configuration:
```typescript
const config: CapacitorConfig = {
  appId: 'com.osterix.app',
  appName: 'OstErix',
  webDir: 'dist/osterix-front',
  android: {
    useLegacyBridge: false,
  },
  server: {
    androidScheme: 'https',
  },
};
```

### android/app/build.gradle
Android-specific build configuration:
- Namespace: `com.osterix.app`
- Min SDK: 23 (Android 6.0)
- Target SDK: 35 (Android 15)
- Version: 1.0.0

### AndroidManifest.xml
Defines app permissions:
- INTERNET (for WebSocket connection)
- CAMERA (for image capture)
- LOCATION (for GPS coordinates)
- STORAGE (for saving images/logs)

## Development Workflow

### Hot Reload (Live Reload)
For faster development iteration:

```bash
# Terminal 1: Start Angular dev server
npm start

# Terminal 2: Sync and run on device
npx cap sync android
npx cap run android
```

### Debugging

#### Using Chrome DevTools
```bash
# Open Chrome and navigate to:
chrome://inspect/#devices

# Your device should appear if connected via USB
```

#### Using Android Studio
1. Open `android/` folder as project in Android Studio
2. Run > Run 'app'
3. Select your device
4. Use built-in debugger

#### Command Line Debugging
```bash
# View logs
adb logcat

# Filter to OstErix logs
adb logcat | grep -i osterix

# Install and run with logging
adb shell am start -n com.osterix.app/.MainActivity
adb logcat -s "osterix-front"
```

## Connecting to OST Server

### Local Network Connection
1. Get your server IP: `hostname -I` (on server)
2. In app settings, enter:
   - Host: `<server-ip>`
   - Port: `9624`
   - Secure: `false` (for local development)

### Remote Connection
1. Set up reverse proxy (nginx/Apache) with SSL
2. Configure domain name
3. In app settings:
   - Host: `your-domain.com`
   - Port: `443` (or your reverse proxy port)
   - Secure: `true`

## Building for Different Configurations

### Environment Files
- `environment.ts` - Development
- `environment.prod.ts` - Production

Both include mobile-specific configuration:
```typescript
export const environment = {
  isNative: Capacitor.isNativePlatform(),
  platform: Capacitor.getPlatform(),
  serverHost: 'localhost',
  serverPort: 9624,
  useSecureConnection: false
};
```

### Build Configurations
```bash
# Development build (unoptimized, debug symbols)
./build-android.sh development apk

# Production build (optimized, minified)
./build-android.sh production apk
```

## Troubleshooting

### Build Fails

#### Gradle Sync Error
```bash
# Clean Gradle cache
cd android
./gradlew clean
cd ..

# Rebuild
./build-android.sh production apk
```

#### Node Modules Issues
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
./build-android.sh production apk
```

### Device Connection Issues

#### Device Not Detected
```bash
# Check if device is connected
adb devices

# If offline, reconnect via USB
# Enable USB debugging on device: Settings > Developer Options > USB Debugging

# Reconnect
adb kill-server
adb start-server
adb devices
```

#### WebSocket Connection Fails
1. Verify server is running: `ps aux | grep ostserver`
2. Check port: `netstat -tlnp | grep 9624`
3. Test from device: ping server IP
4. Try connecting with different protocol (ws vs wss)

### Performance Issues

#### App Is Slow
- Build in production mode: `./build-android.sh production apk`
- Check WebSocket connection latency
- Monitor device memory: `adb shell dumpsys meminfo`

#### High Memory Usage
- Clear device cache: `adb shell pm clear com.osterix.app`
- Reduce log verbosity in dev tools
- Restart device if necessary

## Release Checklist

Before releasing to Google Play:

- [ ] Update version in `android/app/build.gradle`
- [ ] Update `CHANGELOG.md`
- [ ] Test on multiple devices (API 23+)
- [ ] Test offline behavior
- [ ] Generate signed APK/AAB
- [ ] Create release branch in Git
- [ ] Tag release version
- [ ] Upload to Play Store
- [ ] Monitor crash reports

## Advanced Topics

### Custom Plugins
To add native Android features:

1. Create plugin directory:
```bash
mkdir -p android/capacitor-plugins/myplugin/src/main/java
```

2. Implement plugin class extending Cordova or Capacitor
3. Add to `capacitor.config.ts`
4. Build and test

### Keystore Management
```bash
# Create keystore
keytool -genkey -v -keystore osterix.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias osterix

# Store password securely (use environment variable or secrets manager)
# Never commit keystore to version control
```

### App Signing
Configure in `android/app/build.gradle`:
```gradle
signingConfigs {
    release {
        storeFile file(System.getenv("KEYSTORE_PATH"))
        storePassword System.getenv("KEYSTORE_PASSWORD")
        keyAlias System.getenv("KEY_ALIAS")
        keyPassword System.getenv("KEY_PASSWORD")
    }
}
```

## Performance Optimization

### Bundle Size
```bash
# Analyze bundle size
ng build --prod --stats-json
npm install -g webpack-bundle-analyzer
webpack-bundle-analyzer dist/osterix-front/stats.json
```

### Runtime Performance
- Enable production mode
- Use OnPush change detection in components
- Lazy load routes
- Minimize WebSocket message frequency

## Documentation

- [Capacitor Documentation](https://capacitorjs.com)
- [Android Developer Guide](https://developer.android.com)
- [Angular Performance Guide](https://angular.io/guide/performance)
- [Google Play Console Help](https://support.google.com/googleplay)

## Support

For issues or questions:
1. Check app logs: `adb logcat`
2. Review error messages in Chrome DevTools
3. Check OST server logs
4. Consult Capacitor documentation
5. File issue on GitHub repository
