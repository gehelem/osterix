# OstErix Android Deployment Checklist

Use this checklist to ensure your Android app is ready for testing and release.

## Pre-Build Checklist

- [ ] All TypeScript compiles without errors
- [ ] Angular tests pass (if applicable)
- [ ] No console warnings/errors in development build
- [ ] Android SDK installed and updated
- [ ] Android device connected and USB debugging enabled
- [ ] `adb devices` shows your device as online
- [ ] Server IP address confirmed and accessible
- [ ] Port 9624 open on firewall
- [ ] Git changes committed (optional but recommended)

## Build Preparation

### Code Quality
- [ ] No console.log statements left in production code
- [ ] No hardcoded server addresses (except defaults)
- [ ] All commented code removed
- [ ] Linting passes: `ng lint` (if configured)
- [ ] Code follows project style guidelines

### Configuration
- [ ] `capacitor.config.ts` has correct appId: `com.osterix.app`
- [ ] Version number updated in `android/app/build.gradle`
- [ ] Environment variables configured correctly
- [ ] API endpoints point to correct server
- [ ] Build type selected (development vs production)

### Dependencies
- [ ] `npm install` completed successfully
- [ ] No unresolved dependencies
- [ ] Capacitor version matches (7.4.3+)
- [ ] All plugins included

## Build Process

### Angular Build
- [ ] Run: `npm run build` (development) or `npm run build -- --configuration production` (release)
- [ ] Build completes without errors
- [ ] `dist/osterix-front/` directory created
- [ ] Check bundle size is reasonable (<10MB typical)

### Capacitor Sync
- [ ] Run: `npx cap sync android`
- [ ] No sync errors
- [ ] Assets copied to `android/app/src/main/assets/`
- [ ] Verify file count makes sense (hundreds, not thousands)

### Android Build
- [ ] Run: `./build-android.sh development apk` (or production)
- [ ] Gradle build succeeds
- [ ] APK created at expected location
- [ ] APK file size reasonable (5-15MB)
- [ ] No APK signing issues (for release builds)

## Testing Checklist

### Installation
- [ ] APK installs without errors: `adb install -r osterix-*.apk`
- [ ] App appears in device home screen
- [ ] App icon displays correctly
- [ ] App can be launched without crashes

### Initial Launch
- [ ] App starts successfully
- [ ] No splash screen errors
- [ ] No permission dialogs prevent startup
- [ ] Main home page loads

### Permissions
- [ ] Camera permission request appears
- [ ] Location permission request appears
- [ ] Storage permission request appears
- [ ] App functions with permissions granted
- [ ] App handles denied permissions gracefully

### Navigation
- [ ] All menu items are clickable
- [ ] Routes navigate correctly
- [ ] Back button works (returns to previous page)
- [ ] No navigation errors in console

### Module Functionality

#### Focus Module
- [ ] Page loads without errors
- [ ] Status shows current state
- [ ] Start/Stop buttons visible and clickable
- [ ] Settings button opens parameters dialog
- [ ] Image displays when available

#### Guider Module
- [ ] All buttons visible and functional
- [ ] Graphs/charts render correctly
- [ ] Real-time data updates
- [ ] Dialogs open without crashes

#### Sequencer Module
- [ ] Grid displays sequence items
- [ ] Add/Edit/Delete rows work
- [ ] Move up/down buttons function
- [ ] Settings dialog opens

#### Navigator Module
- [ ] Sky chart renders
- [ ] Target input fields work
- [ ] Centring button functions
- [ ] Add to planner button works

#### Planner Module
- [ ] Planning grid displays
- [ ] Add/Edit/Delete operations work
- [ ] Progress bar updates
- [ ] Start/Stop buttons function

### Network & Connection

#### Server Connection
- [ ] WebSocket connects to server
- [ ] Connection status shows "Connected"
- [ ] Data updates in real-time
- [ ] Connection persists during navigation
- [ ] Auto-reconnect works when connection drops

#### Data Display
- [ ] Module states display correctly
- [ ] Property values update in real-time
- [ ] Images load and display
- [ ] Charts/graphs render and animate

### Dark Mode
- [ ] Dark theme applies system-wide
- [ ] All text remains readable
- [ ] Buttons contrast is sufficient
- [ ] Images display correctly in dark mode

### Performance
- [ ] No lag in navigation
- [ ] Charts update smoothly
- [ ] Typing in input fields is responsive
- [ ] Image scrolling is smooth
- [ ] No memory leaks during extended use

### Orientation & Screen
- [ ] Landscape orientation works
- [ ] Portrait orientation works
- [ ] Rotation doesn't crash app
- [ ] Responsive layout adapts correctly
- [ ] Status bar doesn't overlap content

### Edge Cases

#### Connectivity Loss
- [ ] App handles disconnection gracefully
- [ ] Error message displays
- [ ] Auto-reconnect attempts visible
- [ ] Can reconnect when server comes back

#### Server Not Running
- [ ] Clear error message displayed
- [ ] No app crash
- [ ] User can configure new server

#### Slow Network
- [ ] Timeouts handled gracefully
- [ ] No frozen UI during network delays
- [ ] Can cancel pending operations

#### Device Sleep
- [ ] App resumes correctly from sleep
- [ ] Connection restores after wake
- [ ] No data loss

### Logging & Debugging

- [ ] `adb logcat` shows expected logs
- [ ] No error stack traces in logs
- [ ] WebSocket messages logged (development only)
- [ ] Performance metrics available if needed

## Device-Specific Testing

### Minimum Device (API 23)
- [ ] App installs on API 23 device
- [ ] All features work correctly
- [ ] Performance acceptable

### Target Device (API 35)
- [ ] App installs on API 35 device
- [ ] Takes advantage of modern APIs
- [ ] No deprecated features used

### Various Screen Sizes
- [ ] Test on 4" device (small phone)
- [ ] Test on 6" device (standard phone)
- [ ] Test on 6.7"+ device (large phone)
- [ ] UI scales appropriately

### Network Conditions
- [ ] Test on WiFi (fast)
- [ ] Test on 4G/LTE (medium)
- [ ] Test on 3G (slow)
- [ ] App functions at all speeds

## Security Checklist

### Permissions
- [ ] Only necessary permissions requested
- [ ] Permissions marked as required/optional correctly
- [ ] Camera permission only if needed
- [ ] Location permission only if needed

### Network Security
- [ ] WebSocket uses secure protocol (wss://) for remote servers
- [ ] No sensitive data in logs
- [ ] No hardcoded credentials
- [ ] Server host can be configured

### Data Handling
- [ ] No sensitive data stored unencrypted
- [ ] App data cleared on uninstall
- [ ] No world-readable files created

## Release Build Testing

### Before Release Build
- [ ] All development builds tested
- [ ] No hardcoded dev URLs
- [ ] Production environment configured
- [ ] Analytics/logging configured

### Release Build
- [ ] Signing key created and secured
- [ ] Build command: `./build-android.sh production apk`
- [ ] Release APK created successfully
- [ ] Release APK tests passed

### Version Management
- [ ] Version number incremented
- [ ] CHANGELOG updated
- [ ] Git tag created for release
- [ ] Build artifacts backed up

## Play Store Submission (if applicable)

### Preparation
- [ ] App store listing created
- [ ] Screenshots prepared (5 minimum, 8 recommended)
- [ ] Description written (80-4000 chars)
- [ ] Keywords configured
- [ ] Icon and graphics prepared

### Build Preparation
- [ ] Build as AAB: `./build-android.sh production aab`
- [ ] AAB file created successfully
- [ ] APK extracted from AAB and tested
- [ ] Content rating questionnaire completed

### Submission
- [ ] Upload AAB to Play Console
- [ ] Review store listing
- [ ] Select target countries
- [ ] Set pricing (free)
- [ ] Submit for review
- [ ] Monitor for approval (typically 1-4 hours)

## Post-Release

### Monitoring
- [ ] Monitor crash reports in Play Console
- [ ] Check user ratings and reviews
- [ ] Monitor server logs for errors
- [ ] Respond to user feedback

### Updates
- [ ] Create bug fix branch if needed
- [ ] Test fix thoroughly
- [ ] Increment version (patch version for bug fixes)
- [ ] Build and submit updated APK/AAB

### Documentation
- [ ] Keep CHANGELOG updated
- [ ] Document known issues
- [ ] Update README with new features
- [ ] Maintain version history

## Final Sign-Off

- [ ] All checklist items completed
- [ ] No critical bugs identified
- [ ] Performance acceptable
- [ ] User testing passed
- [ ] Ready for deployment

**Date Signed Off**: _______________
**Tester Name**: _______________
**Notes**: ___________________________________________________

---

## Quick Reference Commands

```bash
# Install dependencies
npm install

# Build and deploy (development)
./build-android.sh development apk
adb install -r osterix-development.apk

# Build and deploy (production)
./build-android.sh production apk
adb install -r osterix-production.apk

# View logs
adb logcat | grep osterix

# Uninstall app
adb uninstall com.osterix.app

# Clear cache
adb shell pm clear com.osterix.app

# Full clean and rebuild
./clean-android.sh all
npm install
./build-android.sh production apk
```

## Support Resources

- Server setup: `./server-setup.sh`
- Quick start: `QUICK_START_ANDROID.md`
- Full guide: `ANDROID_BUILD.md`
- User guide: `MOBILE_SETUP.md`
- Migration details: `CAPACITOR_MIGRATION.md`

---

**Version**: 1.0
**Last Updated**: January 2025
**For Version**: OstErix 1.0.0+
