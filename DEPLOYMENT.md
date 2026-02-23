# Shayfa Way - Android Deployment Guide

This project is a high-performance **Progressive Web App (PWA)** built using **Material 3 (Material You)** design patterns, optimized for Android devices. 

To convert this into a production-ready **APK or AAB** for the Google Play Store, follow these professional methods:

## Method 1: Bubblewrap (CLI) - Recommended for PWAs
Google's official tool to wrap PWAs into native Android Apps (TWA).
1. Install Node.js on your computer.
2. Run `npm i -g @bubblewrap/cli`.
3. Run `bubblewrap init --manifest=https://your-domain.com/manifest.json`.
4. Run `bubblewrap build`.
5. **Output**: Your production-ready APK and AAB will be in the `/build` folder.

## Method 2: Capacitor (Native Bridge)
If you need deeper hardware access (Bluetooth, background geo-fencing).
1. Run `npm install @capacitor/core @capacitor/cli @capacitor/android`.
2. Run `npx cap init ShayfaWay com.shayfaway.app`.
3. Copy your project files into the `www` folder.
4. Run `npx cap add android`.
5. Run `npx cap open android`.
6. Built it directly inside **Android Studio**.

## Architecture Overview
- **Storage**: IndexedDB (V3) for local-first persistence.
- **UI**: Material 3 / Android Optimized.
- **Admin**: Public Web Dashboard (`admin.html`).
- **Sync**: API Simulator (`js/services/api.js`) handles state.
