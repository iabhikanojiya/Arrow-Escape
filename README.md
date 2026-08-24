# Arrow Escape — Developer Website

Production website for **Arrow Escape** (`com.arrow.escape.arrow_escape`).
Static, zero-dependency, Firebase Hosting ready.

## Quick replace

Edit `public/config.js` — all placeholders in one place:

```js
APP_NAME, GOOGLE_PLAY_URL, SUPPORT_EMAIL, DEVELOPER_NAME, WEBSITE_DOMAIN, PRIVACY_EFFECTIVE_DATE, ADMOB_APP_ADS_TXT_LINE
```

Then search codebase for the same tokens (also set as meta placeholders in each HTML file and `public/app-ads.txt`).

## Deploy to Firebase Hosting

```bash
npm i -g firebase-tools
firebase login
firebase use --add   # select your Firebase project
firebase deploy --only hosting
```

Verify after deploy:
- https://YOUR_DOMAIN/
- https://YOUR_DOMAIN/privacy
- https://YOUR_DOMAIN/terms
- https://YOUR_DOMAIN/support
- https://YOUR_DOMAIN/app-ads.txt  (must be text/plain, HTTP 200)
- https://YOUR_DOMAIN/robots.txt
- https://YOUR_DOMAIN/sitemap.xml

## Google Play Console

Use this as:
- Developer website
- Support URL
- Privacy Policy URL → https://YOUR_DOMAIN/privacy

## AdMob app-ads.txt

Replace `public/app-ads.txt` contents with the exact line from AdMob (App settings → App-ads.txt). Keep it at the site root. Do not wrap in HTML.

## Structure

```
public/
  index.html          → /
  privacy/index.html  → /privacy
  terms/index.html    → /terms
  support/index.html  → /support
  app-ads.txt         → /app-ads.txt (plain text)
  robots.txt
  sitemap.xml
  config.js           → central placeholders
  assets/
    styles.css
    app.js
firebase.json         → hosting rewrites + app-ads.txt content-type
```
