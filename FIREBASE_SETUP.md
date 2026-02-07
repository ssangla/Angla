# Firebase Setup Guide - Invoice Scanner (Dfabrik-dev)

## 1. Firebase Console Setup

### Create the app in Firebase Console

1. Go to https://console.firebase.google.com/project/dfabrik-dev
2. Click **Add app** > **Web** (</> icon)
3. Register app name: `invoice-scanner`
4. Copy the config values into `.env.local` (see `.env.example`)

### Enable Firebase Storage

1. Go to **Build** > **Storage** in the Firebase Console
2. Click **Get started**
3. Select **production mode** (our `storage.rules` will handle permissions)
4. Choose location: `europe-west1` (for French restaurants)
5. The bucket will be created as `dfabrik-dev.firebasestorage.app`

### Enable Authentication

1. Go to **Build** > **Authentication**
2. Click **Get started**
3. Enable **Email/Password** provider
4. Enable **Google** provider (for employee sign-in)

## 2. Custom Domain Setup

### Connect your domain to Firebase Hosting

1. Go to **Hosting** in Firebase Console
2. Click **Add custom domain**
3. Enter your domain: `app.dfabrik.dev` (or your chosen domain)
4. Firebase will provide DNS records to add:

```
Type    Host                    Value
A       app.dfabrik.dev         151.101.1.195
A       app.dfabrik.dev         151.101.65.195
TXT     app.dfabrik.dev         hosting-site=dfabrik-dev
```

5. Add these records in your domain registrar (OVH, Gandi, Cloudflare, etc.)
6. Wait for DNS propagation (up to 24h, usually 1-2h)
7. Firebase will auto-provision an SSL certificate

### Multiple domains (optional)

You can also add:
- `invoice.dfabrik.dev` - dedicated invoice scanner subdomain
- `dfabrik-dev.web.app` - default Firebase domain (always available)
- `dfabrik-dev.firebaseapp.com` - legacy Firebase domain

## 3. Storage Structure

```
dfabrik-dev.firebasestorage.app/
├── invoices/
│   └── {restaurantId}/
│       └── {invoiceId}/
│           └── {timestamp}.jpg        # Original scanned images
├── extractions/
│   └── {restaurantId}/
│       └── {invoiceId}.json           # LLM extraction results
└── reports/
    └── {restaurantId}/
        └── {report-name}.pdf          # Generated reports
```

### Storage Rules Summary

| Path | Read | Create | Update | Delete |
|------|------|--------|--------|--------|
| `/invoices/{rid}/**` | Auth + same restaurant | Auth + same restaurant + <10MB + image/* | Never (immutable) | Manager/Owner only |
| `/extractions/{rid}/**` | Auth + same restaurant | Auth + same restaurant + <1MB + JSON | Manager/Owner | Owner only |
| `/reports/{rid}/**` | Manager/Owner | Auth + same restaurant + <25MB | N/A | Owner only |

## 4. GitHub Secrets Configuration

Go to your Dfabrik GitHub repo > **Settings** > **Secrets and variables** > **Actions**

Add these secrets:

| Secret Name | How to get it |
|-------------|--------------|
| `FIREBASE_SERVICE_ACCOUNT_DFABRIK_DEV` | Firebase Console > Project Settings > Service accounts > Generate new private key > paste entire JSON |
| `FIREBASE_API_KEY` | Firebase Console > Project Settings > General > Web API Key |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase Console > Project Settings > General > Sender ID |
| `FIREBASE_APP_ID` | Firebase Console > Project Settings > General > App ID |
| `FIREBASE_MEASUREMENT_ID` | Firebase Console > Project Settings > General > Measurement ID (if Analytics enabled) |

## 5. Local Development

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Verify project connection
firebase projects:list

# Set active project
firebase use dfabrik-dev

# Deploy hosting only
npm run deploy

# Deploy storage rules only
npm run deploy:storage

# Deploy everything
npm run deploy:all

# Preview channel (temporary URL for testing)
firebase hosting:channel:deploy preview-test --expires 7d
```

## 6. Deploy Commands

```bash
# Build + Deploy to production
npm run predeploy && npm run deploy

# Or all in one
npm run deploy   # predeploy runs automatically

# Deploy storage rules after editing storage.rules
npm run deploy:storage
```

## 7. CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/firebase-deploy.yml`) handles:

- **On PR**: Deploys to a preview channel (`pr-{number}.dfabrik-dev.web.app`)
- **On push to main**: Deploys to production + updates storage rules

### Pipeline steps:
1. Checkout code
2. Install dependencies (`npm ci`)
3. Run tests
4. Build Expo web (`npx expo export --platform web`)
5. Deploy to Firebase Hosting
6. Deploy Storage rules (main branch only)
