# Deployment Guide

This guide will help you deploy your Progressive Web App to various hosting platforms.

## Prerequisites

Before deploying, make sure you:
1. Have generated PNG icons from the SVG templates (or use SVG icons directly)
2. Updated all personal information in `index.html`
3. Configured your domain name in `manifest.json`
4. Tested the PWA locally
5. Enabled HTTPS (required for PWA features)

## Quick Deployment Options

### 1. Netlify (Recommended for Beginners)

**Via Netlify Drop**
1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag and drop the `portfolio-pwa` folder
3. Your site is live instantly!

**Via Netlify CLI**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Navigate to project
cd portfolio-pwa

# Deploy
netlify deploy --prod --dir .
```

**Via Git**
1. Push your code to GitHub
2. Connect repository to Netlify
3. Deploy settings:
   - Build command: (leave empty)
   - Publish directory: `.`

**Custom Domain**
- Go to Domain settings
- Add your custom domain
- Netlify will handle HTTPS automatically

### 2. Vercel

**Via Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to project
cd portfolio-pwa

# Deploy
vercel --prod
```

**Via GitHub**
1. Push to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Deploy automatically

**Configuration**
Create `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    }
  ]
}
```

### 3. GitHub Pages

**Setup**
```bash
# Create gh-pages branch
git checkout -b gh-pages

# Add your files
git add .
git commit -m "Deploy PWA"

# Push to GitHub
git push origin gh-pages
```

**Enable GitHub Pages**
1. Go to repository Settings
2. Navigate to Pages section
3. Select `gh-pages` branch
4. Your site will be at: `https://username.github.io/repository-name/`

**Custom Domain**
1. Add `CNAME` file with your domain:
   ```
   yourdomain.com
   ```
2. Configure DNS settings at your domain registrar
3. Add A records:
   - 185.199.108.153
   - 185.199.109.153
   - 185.199.110.153
   - 185.199.111.153

### 4. Firebase Hosting

**Setup**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting
```

**Configuration**
Select:
- Public directory: `.` (current directory)
- Configure as single-page app: `No`
- Automatic builds: Optional

**Deploy**
```bash
firebase deploy --only hosting
```

**firebase.json**
```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "headers": [
      {
        "source": "/sw.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      }
    ]
  }
}
```

### 5. AWS S3 + CloudFront

**S3 Setup**
```bash
# Install AWS CLI
pip install awscli

# Configure AWS credentials
aws configure

# Create S3 bucket
aws s3 mb s3://your-bucket-name

# Upload files
aws s3 sync . s3://your-bucket-name --exclude ".git/*"

# Make bucket public
aws s3 website s3://your-bucket-name --index-document index.html
```

**CloudFront Setup**
1. Create CloudFront distribution
2. Point origin to S3 bucket
3. Enable HTTPS
4. Configure custom domain

### 6. Azure Static Web Apps

**Via Azure CLI**
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login
az login

# Create static web app
az staticwebapp create \
  --name my-pwa-portfolio \
  --resource-group my-resource-group \
  --source ./ \
  --location "East US 2" \
  --branch main
```

**Via GitHub Actions**
Azure will auto-generate a workflow file for continuous deployment.

### 7. Cloudflare Pages

**Setup**
1. Push code to GitHub
2. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
3. Connect GitHub repository
4. Deploy settings:
   - Build command: (leave empty)
   - Build output directory: `/`

**Custom Domain**
- Add custom domain in Cloudflare Pages dashboard
- DNS configuration handled automatically

## Pre-Deployment Checklist

### Content
- [ ] Update personal information (name, bio, contact)
- [ ] Replace placeholder projects with real work
- [ ] Add actual portfolio images
- [ ] Update service descriptions
- [ ] Add real social media links
- [ ] Update meta tags and descriptions

### Technical
- [ ] Generate proper PWA icons (72px to 512px)
- [ ] Update `manifest.json` with your domain
- [ ] Test service worker registration
- [ ] Verify offline functionality
- [ ] Test on multiple devices and browsers
- [ ] Run Lighthouse audit (aim for 90+ scores)
- [ ] Validate HTML/CSS
- [ ] Check all links work
- [ ] Test form submission
- [ ] Verify HTTPS is enabled

### SEO
- [ ] Update page title and meta descriptions
- [ ] Add canonical URL
- [ ] Update Open Graph tags
- [ ] Add Twitter Card data
- [ ] Create sitemap.xml (optional)
- [ ] Add robots.txt (optional)
- [ ] Submit to Google Search Console
- [ ] Verify structured data

### Performance
- [ ] Minify HTML, CSS, JS (optional but recommended)
- [ ] Compress images (WebP format preferred)
- [ ] Enable Brotli/Gzip compression
- [ ] Add CDN for static assets (optional)
- [ ] Test page load speed
- [ ] Verify Core Web Vitals

## Post-Deployment

### Testing
1. **PWA Installation Test**
   - Visit your site on mobile
   - Try installing the app
   - Verify it opens in standalone mode

2. **Offline Test**
   - Open your PWA
   - Turn off network connection
   - Verify pages still load
   - Test navigation

3. **Cross-Browser Test**
   - Chrome (Desktop & Mobile)
   - Firefox
   - Safari (iOS)
   - Edge
   - Samsung Internet

4. **Performance Test**
   - Run [PageSpeed Insights](https://pagespeed.web.dev/)
   - Check [web.dev Measure](https://web.dev/measure/)
   - Use Chrome DevTools Lighthouse
   - Test on slow 3G connection

### Monitoring
1. **Analytics Setup**
   - Google Analytics
   - Plausible Analytics
   - Cloudflare Analytics

2. **Error Tracking**
   - Sentry
   - LogRocket
   - Bugsnag

3. **Uptime Monitoring**
   - UptimeRobot
   - Pingdom
   - StatusCake

## Domain Configuration

### DNS Settings
For most providers, add these records:

**A Records** (for root domain)
```
@ -> Your hosting provider's IP
```

**CNAME Record** (for www subdomain)
```
www -> your-site.hosting-provider.com
```

### SSL/TLS
- Most hosting providers offer free SSL via Let's Encrypt
- HTTPS is **required** for PWA features (service workers)
- Enable automatic SSL renewal

## Continuous Deployment

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy PWA

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: './portfolio-pwa'
          production-branch: main
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## Troubleshooting

### Service Worker Issues
**Problem**: Service worker not registering
**Solution**:
- Ensure HTTPS is enabled
- Check browser console for errors
- Verify `sw.js` is in the root directory
- Clear browser cache

### Icons Not Showing
**Problem**: PWA icons don't appear
**Solution**:
- Verify icon paths in `manifest.json`
- Ensure icons are properly sized
- Clear browser cache
- Check file permissions

### Install Prompt Not Appearing
**Problem**: "Add to Home Screen" doesn't show
**Solution**:
- Verify manifest.json is linked correctly
- Ensure service worker is registered
- Check manifest validation
- Try on Chrome/Edge (best support)

### Offline Mode Not Working
**Problem**: App doesn't work offline
**Solution**:
- Check service worker installation
- Verify caching strategies
- Test in DevTools (Application > Service Workers)
- Clear cache and re-register service worker

## Support

For deployment help:
- Check hosting provider documentation
- Visit hosting provider support forums
- Search Stack Overflow for specific issues

## Resources

- [PWA Deployment Guide](https://web.dev/pwa-checklist/)
- [Netlify Documentation](https://docs.netlify.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [GitHub Pages](https://pages.github.com/)

---

Happy Deploying! 🚀
