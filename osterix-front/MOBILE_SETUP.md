# OstErix Mobile Setup Guide

This guide explains how to set up and run the OstErix mobile application on Android devices.

## What is OstErix?

OstErix is a modern, web-based interface for the Observatoire Sans Tête (OST) headless observatory control system. The mobile version allows you to control your astronomy equipment from anywhere on your local network.

## Features

- ✓ Real-time telescope control and tracking
- ✓ Focus module for automatic focusing
- ✓ Guider for telescope autoguiding
- ✓ Sequencer for automated imaging sequences
- ✓ Navigator for sky mapping and object selection
- ✓ Dark mode support for night observation
- ✓ WebSocket-based real-time communication
- ✓ Works on Android 6.0 and higher

## Installation

### From APK (Quick Install)

1. Download the APK file to your Android device
2. Open file manager and navigate to Downloads
3. Tap the APK file to install
4. Follow on-screen prompts

**Note**: You may need to enable "Unknown Sources" in Settings > Security

### From Google Play Store (When Available)

1. Open Google Play Store
2. Search for "OstErix"
3. Tap Install
4. Grant requested permissions

## First Time Setup

### 1. Network Requirements

Ensure your device is on the same network as your OST server:

- Home WiFi network where OST server is running
- Same subnet (e.g., 192.168.x.x)
- No VPN blocking port 9624

### 2. Find Your Server

On your OST server, get its IP address:

```bash
# Linux/macOS
hostname -I

# Windows
ipconfig
```

Example: `192.168.1.100`

### 3. Connect in App

Launch OstErix on your Android device:

1. Open app
2. Look for "Connection Settings" or similar
3. Enter server details:
   - **Host**: The IP address from step 2 (e.g., `192.168.1.100`)
   - **Port**: `9624`
   - **Secure**: OFF (for local networks)
4. Tap "Connect" or similar

### 4. Grant Permissions

The app may request permissions:
- **Camera**: For capturing telescope images
- **Location**: For GPS coordinates (optional)
- **Storage**: For saving logs and images
- **Internet**: Required for server communication

Grant all requested permissions for full functionality.

## Using the App

### Main Screens

#### Home
Overview of all connected modules and current status

#### Navigator
- Search for celestial objects by name
- Manual telescope slewing
- Sky map with star chart
- Add targets to planner

#### Focus
- Automatic focus adjustment
- Real-time HFR (Half Flux Radius) monitoring
- Focus curve visualization
- Save/load focus positions

#### Guider
- Autoguiding control
- RMS tracking data
- Guide correction visualization
- Calibration management

#### Sequencer
- Create automated imaging sequences
- Multiple filter/exposure combinations
- Real-time progress monitoring
- Auto-focus between filter changes

#### Planner
- Manage observation schedule
- Automated object observation
- Progress tracking
- Sequence execution

#### Messages
- Real-time notifications
- Warning/error log
- Connection status

### Settings

Access via the "Paramètres" (Settings) button in the header:

- **Module Parameters**: Configure each module individually
- **Device Selection**: Choose CCD, focuser, telescope, etc.
- **Profile Management**: Save and load configurations

## Network Troubleshooting

### "Cannot Connect to Server"

**Check 1: Is server running?**
```bash
# On server machine
ps aux | grep ostserver

# Or check systemd status
systemctl status ostserver
```

**Check 2: Is port 9624 open?**
```bash
# On server
netstat -tlnp | grep 9624
```

**Check 3: Network connectivity**
- Ping server from device: Open Terminal Emulator on Android and `ping 192.168.1.100`
- Both devices on same WiFi network?
- Any firewall blocking port 9624?

### Connection Timeout

- Increase timeout in app settings (if available)
- Check server load: `top` or `htop` on server
- Try wired Ethernet instead of WiFi
- Reduce distance to WiFi router

### App Crashes on Connect

1. Update app to latest version
2. Clear app cache: Settings > Apps > OstErix > Storage > Clear Cache
3. Force stop and restart app
4. Check device storage is not full
5. View logs: Enable developer mode and check logcat

## Device Requirements

### Minimum Specifications
- **OS**: Android 6.0 (API 23) or higher
- **RAM**: 2 GB minimum (4 GB+ recommended)
- **Storage**: 100 MB free space
- **Network**: 4G/5G or WiFi with stable connection
- **Screen**: Any size (optimized for 4" - 6.7")

### Recommended
- Android 10 or higher
- 4GB+ RAM
- WiFi 5GHz network for lower latency
- Phone with GPS for location-based observations

## Battery and Performance

### Optimize Battery Life
- Enable "Adaptive Battery" in device settings
- Lower screen brightness when outdoors
- Disable WiFi when not observing
- Close background apps

### Improve Performance
- Close unused applications
- Reboot device before long sessions
- Check available storage (>500MB recommended)
- Use WiFi instead of cellular data

## Security Considerations

### Local Network
- Only for trusted networks
- Default connection is **unencrypted**
- Suitable for home observatory

### Remote Access
For controlling observatory remotely:
1. Set up reverse proxy with SSL (nginx)
2. Use domain name with valid certificate
3. Enable "Secure" option in app
4. Use strong authentication on server

### Data Privacy
- No data is sent to cloud services
- All communication is local to your network
- Location data (if enabled) is only used locally

## Offline Operation

The app **requires** a working connection to the OST server:
- Cannot function in offline mode
- No cached data available
- Reconnect when server is available

## Advanced Features

### Server Discovery (Future)
Planned feature to automatically discover OST servers on local network via Avahi/mDNS

### Mobile-Specific Plugins
- Extended gesture controls
- Device orientation handling
- Touch-optimized interface
- Mobile notification system

## Updating the App

### From APK
1. Download newer APK version
2. Install (older version automatically removed)
3. Grant permissions again if prompted

### From Google Play
1. Open Play Store
2. Search for OstErix
3. Tap Update if available
4. Wait for installation to complete

## Uninstalling

### Via Settings
Settings > Apps > OstErix > Uninstall > Confirm

### Via Google Play
Open app in Play Store > Uninstall > Confirm

## Getting Help

### Before Contacting Support

1. Check app version: Settings > About > Version
2. Collect error message or crash report
3. Check server logs on OST machine
4. Try basic troubleshooting above

### Support Resources

- GitHub Issues: Report bugs and request features
- Wiki Documentation: Detailed guides and tutorials
- Community Forum: Ask questions and share tips
- Server Logs: `/var/log/ostserver.log` on server

## Tips and Tricks

### Night Mode
- Enable system-wide dark theme for comfortable night observation
- Automatic theme switching based on sunset/sunrise (with GPS)
- Red light filter available in some phones (Settings > Display)

### Landscape Mode
- Rotate device for better view of charts and graphs
- Use split-screen with other apps (Android 7+)
- Full-screen image viewing by rotating while on Focus/Sequencer

### Keyboard Shortcuts (External Keyboard)
- Tab: Navigate between fields
- Enter: Submit/Confirm
- Escape: Close dialogs

### Performance Tips
- Disable live updates when not observing
- Reduce chart refresh rate in settings
- Use lower resolution image display for slow networks
- Close other apps during critical operations

## FAQ

**Q: Can I control multiple telescopes?**
A: Yes, if your OST server manages multiple mounts, you can switch between them in the app.

**Q: Will this work on a rooted device?**
A: Yes, but rooting may cause issues with Google Play Protect.

**Q: Can I use this app without WiFi?**
A: Only if you have cellular data and the server is accessible over the internet (requires VPN/SSL setup).

**Q: How much data does it use?**
A: Depends on image quality settings. Typically 10-50 MB per hour of observation.

**Q: Can I use it with an older server version?**
A: Check compatibility with your server version. Update server if necessary.

**Q: What happens if the connection drops?**
A: App automatically attempts to reconnect. Current command may be interrupted.

## Feedback and Improvements

Your feedback helps improve OstErix! Share:
- Feature requests
- Bug reports
- Usage suggestions
- Interface improvements

File issues on GitHub or contact the development team.

---

**Version**: 1.0.0
**Last Updated**: 2025-01-08
**Compatibility**: Android 6.0+
