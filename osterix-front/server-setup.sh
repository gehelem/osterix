#!/bin/bash

# Server setup guide for OstErix Android app
# This script provides instructions and helpers for connecting mobile app to OST server

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}OstErix Mobile Server Setup Guide${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${GREEN}Prerequisites:${NC}"
echo "  ✓ OstErix Android app installed on device"
echo "  ✓ OST server running on local network"
echo "  ✓ Server accessible from mobile device"
echo ""

echo -e "${GREEN}Step 1: Get your OST server IP address${NC}"
echo "  On the OST server machine, run:"
echo "    hostname -I"
echo "  Or use:"
echo "    ip addr show"
echo ""

echo -e "${GREEN}Step 2: Verify network connectivity${NC}"
echo "  From your Android device, open:"
echo "    Chrome or Firefox → Developer Console"
echo "  Or ping from command line:"
echo "    ping <server-ip>"
echo ""

echo -e "${GREEN}Step 3: Configure server connection in app${NC}"
echo "  In OstErix app:"
echo "  1. Open Settings (if available)"
echo "  2. Find 'Server Configuration' or similar"
echo "  3. Enter:"
echo "     - Host: <server-ip-address>"
echo "     - Port: 9624"
echo "     - Secure: false (for local network)"
echo "  4. Test connection"
echo ""

echo -e "${GREEN}Step 4: Firewall configuration${NC}"
echo "  Ensure port 9624 is open on firewall:"
echo "    sudo ufw allow 9624/tcp"
echo ""

echo -e "${GREEN}Step 5: SSL/TLS for production${NC}"
echo "  For remote connections:"
echo "  1. Use reverse proxy (nginx/Apache) with SSL"
echo "  2. Update server configuration with domain name"
echo "  3. Set 'Secure: true' in app"
echo ""

echo -e "${BLUE}Troubleshooting:${NC}"
echo ""

echo -e "${YELLOW}Connection refused:${NC}"
echo "  - Check if OST server is running"
echo "  - Verify server IP address is correct"
echo "  - Check firewall rules"
echo ""

echo -e "${YELLOW}Timeout:${NC}"
echo "  - Verify network connectivity between devices"
echo "  - Check if server is listening on all interfaces (0.0.0.0:9624)"
echo "  - Try ping/traceroute to server"
echo ""

echo -e "${YELLOW}WebSocket handshake fails:${NC}"
echo "  - Verify server supports WebSocket"
echo "  - Check proxy configuration if behind NAT"
echo "  - Try insecure connection first (ws://) then move to secure (wss://)"
echo ""

echo -e "${BLUE}Testing from terminal:${NC}"
echo "  wscat -c ws://<server-ip>:9624"
echo ""

echo -e "${BLUE}Server logs:${NC}"
echo "  On server: tail -f /var/log/ostserver.log"
echo "  Or: journalctl -u ostserver -f"
echo ""

echo -e "${GREEN}Configuration file locations:${NC}"
echo "  iOS: ~/Library/Containers/com.osterix.app/Data/Library/Preferences"
echo "  Android: /data/data/com.osterix.app/shared_prefs"
echo ""

echo -e "${GREEN}For development on local machine:${NC}"
echo "  1. Run OST server: ostserver --libpath /usr/lib/ost"
echo "  2. Check listening port: netstat -tlnp | grep 9624"
echo "  3. Connect from Android device using local IP"
echo "     (not localhost, but actual network IP)"
echo ""
