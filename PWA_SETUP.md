# PWA (Progressive Web App) Setup - Deutsche Master

## Overview
Progressive Web App support has been successfully added to the Deutsche Master project. This allows the app to be installed on devices and work offline.

## Changes Made

### 1. Dependencies Installed
- `vite-plugin-pwa` (v1.2.0) - Automatically generates PWA manifest and service worker

### 2. Updated Configuration Files

#### vite.config.js
- Imported and configured `VitePWA` plugin
- Set `registerType: 'autoUpdate'` for automatic service worker updates
- Configured manifest with app metadata:
  - Name: "Deutsche Master"
  - Short name: "DeutscheMaster"
  - Description: "Impara il tedesco gratis - App completa per italiani"
  - Theme color: #1a1a2e (dark)
  - Background color: #1a1a2e (dark)
  - Display: standalone (full-screen app mode)
  - Start URL: /
  - Icons: 192x192 and 512x512 SVG

#### index.html
- Added PWA meta tags:
  - `theme-color` - Dark theme (#1a1a2e)
  - `mobile-web-app-capable` - Enable standalone mode on Android
  - `apple-mobile-web-app-capable` - Enable PWA on iOS
  - `apple-mobile-web-app-status-bar-style` - Black translucent status bar
  - `apple-mobile-web-app-title` - App name on home screen
  - `apple-touch-icon` - Icon for iOS home screen
  - `manifest` - Link to web app manifest

### 3. PWA Icons Generated
Created two SVG icons in `/public/`:
- `icon-192x192.svg` - For device home screens (192x192 pixels)
- `icon-512x512.svg` - For splash screens and larger displays (512x512 pixels)

Design:
- Dark background (#1a1a2e)
- Gold text (#e6b800) with "DE" letters
- Decorative gold border circle
- Scalable SVG format (works at any resolution)

### 4. Service Worker & Manifest
The build process automatically generates:
- `dist/sw.js` - Service worker for offline caching
- `dist/manifest.webmanifest` - PWA manifest file
- `dist/registerSW.js` - Service worker registration script

### 5. Caching Strategy
Configured via Workbox (built into vite-plugin-pwa):
- **Static assets** - Cached and served from cache
- **Google Fonts** - Cached with 1-year expiration (CacheFirst strategy)
- **Google Font files** - Cached with 1-year expiration (CacheFirst strategy)
- **Navigation** - Always tries to load from network first, falls back to cached version

## Features Enabled

✓ Install to home screen (Android, iOS, Windows)
✓ Offline functionality with service worker caching
✓ Standalone app mode (no browser UI)
✓ Dark theme support
✓ Automatic service worker updates
✓ Push notification ready
✓ Custom app icons

## Testing the PWA

### Installation
1. **Android**: Open in Chrome/Edge, tap menu → "Install app"
2. **iOS**: Open in Safari, tap Share → "Add to Home Screen"
3. **Desktop (Chrome)**: Click the install icon in the address bar

### Testing Offline
1. Install the app
2. Go offline (airplane mode or disable network)
3. The app will continue to work with cached content
4. Google Fonts and other resources will load from cache

## Build Output
Latest build (npm run build) includes:
- Service Worker: 1.8 KB
- Manifest: 561 bytes
- Icon assets: 192x192.svg, 512x512.svg
- Total PWA precache: 905 KB (9 entries)

## Additional Notes
- The app currently has a chunk size warning (index-BzaNIfTW.js ~891 KB)
- Consider code-splitting for better performance on slow networks
- Icons are in SVG format for scalability and small file size
- Service worker auto-updates on app launch

## Files Modified
- `/vite.config.js` - PWA plugin configuration
- `/index.html` - PWA meta tags
- `/public/icon-192x192.svg` - Home screen icon
- `/public/icon-512x512.svg` - Splash screen icon
- `/package.json` - Added vite-plugin-pwa dependency (automatic)

