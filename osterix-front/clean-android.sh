#!/bin/bash

# Clean Android build artifacts for OstErix
# Usage: ./clean-android.sh [all]

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANDROID_DIR="$PROJECT_DIR/android"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}OstErix Android Clean Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Clean Angular build
echo -e "${GREEN}Cleaning Angular build artifacts...${NC}"
rm -rf "$PROJECT_DIR/dist"
echo -e "${GREEN}✓ Angular dist cleaned${NC}"

# Clean Capacitor build
echo -e "${GREEN}Cleaning Capacitor sync artifacts...${NC}"
if [ "$1" = "all" ]; then
    cd "$ANDROID_DIR"
    echo "Running: gradlew clean"
    ./gradlew clean
    cd "$PROJECT_DIR"
    echo -e "${GREEN}✓ Gradle clean completed${NC}"
fi

# Clean generated files
echo -e "${GREEN}Cleaning generated files...${NC}"
rm -f "$PROJECT_DIR/osterix-development.apk"
rm -f "$PROJECT_DIR/osterix-production.apk"
rm -f "$PROJECT_DIR/osterix-release.aab"
echo -e "${GREEN}✓ Generated APK/AAB files removed${NC}"

# Clean node_modules if requested
if [ "$1" = "all" ]; then
    echo -e "${YELLOW}Warning: Use 'npm install' to reinstall dependencies${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Clean completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}To do a complete clean and rebuild:${NC}"
echo "  ./clean-android.sh all"
echo "  npm install"
echo "  ./build-android.sh production apk"
