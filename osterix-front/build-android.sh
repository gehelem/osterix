#!/bin/bash

# Build Android APK/AAB for OstErix
# Usage: ./build-android.sh [production|development] [apk|aab]

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
BUILD_TYPE="${1:-development}"
ARTIFACT_TYPE="${2:-apk}"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="$PROJECT_DIR/dist/osterix-front"
ANDROID_DIR="$PROJECT_DIR/android"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}OstErix Android Build Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Validate input
if [[ "$BUILD_TYPE" != "production" && "$BUILD_TYPE" != "development" ]]; then
    echo -e "${RED}Error: Invalid build type. Use 'production' or 'development'${NC}"
    exit 1
fi

if [[ "$ARTIFACT_TYPE" != "apk" && "$ARTIFACT_TYPE" != "aab" ]]; then
    echo -e "${RED}Error: Invalid artifact type. Use 'apk' or 'aab'${NC}"
    exit 1
fi

echo -e "${GREEN}Build Configuration:${NC}"
echo "  Build Type: $BUILD_TYPE"
echo "  Artifact Type: ${ARTIFACT_TYPE^^}"
echo "  Project Directory: $PROJECT_DIR"
echo ""

# Step 1: Build Angular app
echo -e "${GREEN}Step 1: Building Angular application...${NC}"
if [ "$BUILD_TYPE" = "production" ]; then
    npm run build -- --configuration production
else
    npm run build
fi

if [ ! -d "$DIST_DIR" ]; then
    echo -e "${RED}Error: Build failed - dist directory not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Angular build completed${NC}"
echo ""

# Step 2: Sync with Capacitor
echo -e "${GREEN}Step 2: Syncing with Capacitor...${NC}"
npx cap sync android

if [ ! -d "$ANDROID_DIR/app/src/main/assets/public" ]; then
    echo -e "${RED}Warning: Assets directory not properly synced${NC}"
fi
echo -e "${GREEN}✓ Capacitor sync completed${NC}"
echo ""

# Step 3: Build Android project
echo -e "${GREEN}Step 3: Building Android ${ARTIFACT_TYPE^^}...${NC}"
cd "$ANDROID_DIR"

if [ "$ARTIFACT_TYPE" = "apk" ]; then
    if [ "$BUILD_TYPE" = "production" ]; then
        echo "Building release APK..."
        ./gradlew assembleRelease
        APK_PATH="app/build/outputs/apk/release/app-release.apk"
    else
        echo "Building debug APK..."
        ./gradlew assembleDebug
        APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    fi

    if [ -f "$APK_PATH" ]; then
        echo -e "${GREEN}✓ APK built successfully${NC}"
        echo -e "${GREEN}  Output: $APK_PATH${NC}"
        cp "$APK_PATH" "$PROJECT_DIR/osterix-${BUILD_TYPE}.apk"
        echo -e "${GREEN}  Copied to: $PROJECT_DIR/osterix-${BUILD_TYPE}.apk${NC}"
    else
        echo -e "${RED}Error: APK not found at expected location${NC}"
        exit 1
    fi
else
    if [ "$BUILD_TYPE" = "production" ]; then
        echo "Building release AAB..."
        ./gradlew bundleRelease
        AAB_PATH="app/build/outputs/bundle/release/app-release.aab"
    else
        echo -e "${RED}Debug AAB is not recommended. Use APK for testing.${NC}"
        exit 1
    fi

    if [ -f "$AAB_PATH" ]; then
        echo -e "${GREEN}✓ AAB built successfully${NC}"
        echo -e "${GREEN}  Output: $AAB_PATH${NC}"
        cp "$AAB_PATH" "$PROJECT_DIR/osterix-release.aab"
        echo -e "${GREEN}  Copied to: $PROJECT_DIR/osterix-release.aab${NC}"
    else
        echo -e "${RED}Error: AAB not found at expected location${NC}"
        exit 1
    fi
fi

cd "$PROJECT_DIR"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Build completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

if [ "$ARTIFACT_TYPE" = "apk" ]; then
    echo -e "${BLUE}Next steps:${NC}"
    echo "  1. Install on device: adb install -r osterix-${BUILD_TYPE}.apk"
    echo "  2. Run app from home screen"
    echo ""
    echo -e "${BLUE}For debugging:${NC}"
    echo "  adb logcat | grep osterix"
else
    echo -e "${BLUE}Next steps:${NC}"
    echo "  1. Upload osterix-release.aab to Google Play Console"
    echo "  2. Create a new release with the AAB"
fi
