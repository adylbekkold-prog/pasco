# PASCO Lab Offline Lockdown

This workspace was updated to harden SPARKvue for offline use and to remove external URL strings from bundled assets.

## What changed

- `index.html`
- `chrome_webview.html`
- `filepicker_chromeapp.html`
- `javascripts/offline_guard.js`
- `javascripts/analytics/google_analytics.js`
- `javascripts/analytics/google_analytics.offline.js`
- `spark.js`
- `javascripts/sparklibrary.js`
- `javascripts/Workbox.js`
- `javascripts/chunks/*.js`
- `whatsnew/*.htm`
- `whatsnew/**/stylesheets/*.css`
- `stylesheets/**/*.css`
- selected SVG and helper bundles that contained external URL literals

## Hardening summary

- Added strict CSP headers to the HTML entry points and the portal/Nginx responses.
- Replaced external analytics bootstrap with a local no-op stub.
- Replaced the old external filepicker loader with a local offline stub.
- Added an offline guard to block external navigation, fetch, XHR, beacon, WebSocket, EventSource, Worker, and service-worker registration paths.
- Vendor bundles may still contain external URL strings as inert code/data, so the guarantee is enforced by CSP plus runtime network guards rather than text removal alone.

## Verification

- `spark.js` parses successfully after the cleanup.
- `javascripts/sparklibrary.js` parses successfully.
- `javascripts/Workbox.js` parses successfully.
- Local startup on `http://127.0.0.1:57528/` returns `200`.
- The UI renders the offline start menu.
- No external requests were observed during startup.

## Notes

- The workspace does not contain usable Git metadata, so this is an applied source cleanup rather than a generated `git diff`.
- Some help and reference links were intentionally removed to keep the build fully offline.

## Added Lab Package

- `data/Work and Kinetic Energy - Presentation and Test.spklab`
- Copied into `C:\Users\user\Documents\My SPARK Data\Saved Work\Work and Kinetic Energy - Presentation and Test.spklab`
- Also copied into `C:\Users\user\Documents\My SPARK Data\Saved Work\iTunes\Work and Kinetic Energy - Presentation and Test.spklab`

### Page Order

1. `Теория: работа и кинетическая энергия`
2. `Подготовка и датчики`
3. `График 1: сила и скорость во времени`
4. `График 2: сила и скорость по положению`
5. `Мини-тест`
6. `Ключ ответов`

### Sensor Setup

- Smart Cart Force Sensor
- Smart Cart Position Sensor
- Velocity measurement from the cart position sensor
- 50 Hz sampling
