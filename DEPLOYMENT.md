# Doduo Deployment Checklist

## Pre-Deployment

### 1. Assets
- [ ] Create app icons (192x192 and 512x512 PNG)
  - Replace `public/icon-192.png.txt` with actual `icon-192.png`
  - Replace `public/icon-512.png.txt` with actual `icon-512.png`
  - Use the Doduo logo (blue MessageSquare icon with gradient)

### 2. Configuration
- [ ] Update `public/manifest.webmanifest` with production URLs
- [ ] Set appropriate theme colors in manifest
- [ ] Configure relay URLs in `src/App.tsx` if needed
- [ ] Review CSP headers in `index.html`

### 3. SEO & Meta Tags
- [ ] Add Open Graph image URL in `index.html`
- [ ] Add Twitter Card meta tags
- [ ] Verify all meta descriptions are accurate
- [ ] Add favicon.ico to public folder

### 4. Testing
- [x] All tests passing
- [ ] Test on mobile devices
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test with different Nostr extensions (nos2x, Alby, Flamingo)
- [ ] Test offline functionality
- [ ] Test file uploads
- [ ] Test NIP-17 message encryption/decryption

### 5. Performance
- [ ] Run Lighthouse audit
- [ ] Optimize bundle size
- [ ] Enable compression (gzip/brotli)
- [ ] Configure caching headers
- [ ] Lazy load images if any

## Build & Deploy

### Build for Production

```bash
npm run build
```

This creates optimized files in the `dist/` directory.

### Deploy Options

#### Option 1: Netlify
1. Connect your Git repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add `_redirects` file (already in public/)

#### Option 2: Vercel
1. Import your Git repository
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`

#### Option 3: GitHub Pages
1. Update `vite.config.ts` with base path
2. Build and deploy to gh-pages branch
3. Enable GitHub Pages in repository settings

#### Option 4: Self-Hosted
1. Build the project: `npm run build`
2. Copy `dist/` contents to web server
3. Configure web server for SPA routing
4. Set up HTTPS certificate
5. Configure CSP and security headers

### Post-Deployment

- [ ] Verify all pages load correctly
- [ ] Test login with Nostr extension
- [ ] Send test messages
- [ ] Upload test file
- [ ] Check PWA installation
- [ ] Monitor error logs
- [ ] Test on production relay

## Environment Variables

Currently, Doduo doesn't require environment variables. All configuration is in:
- `src/App.tsx` - Default relay and theme
- `public/manifest.webmanifest` - PWA configuration

## Security Considerations

### Content Security Policy
The app includes a strict CSP in `index.html`:
- Scripts: Only from same origin
- Styles: Same origin + inline (for Tailwind)
- Connections: HTTPS and WSS only
- Images: Same origin, data URIs, HTTPS

### HTTPS
- **Always use HTTPS in production**
- Nostr extensions require secure context
- WebCrypto API requires HTTPS

### Relay Security
- Use trusted relays only
- Monitor relay uptime and reliability
- Consider running your own relay

## Monitoring

### Recommended Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Monitor relay connectivity
- [ ] Track message delivery success rate
- [ ] Monitor file upload success

### Analytics (Optional)
Doduo is privacy-focused and includes no analytics by default. If you need analytics:
- Use privacy-respecting tools (Plausible, Fathom)
- Clearly disclose in privacy policy
- Make it opt-in

## Maintenance

### Regular Updates
- Keep dependencies updated
- Monitor Nostr protocol changes (NIPs)
- Update Nostrify library
- Review security advisories

### Backup Strategy
- Users control their own keys (no backup needed)
- Messages stored locally in IndexedDB
- Recommend users backup their nsec

## Support

### User Support Channels
- GitHub Issues for bug reports
- Nostr for community support
- Documentation in GUIDE.md

### Common Issues
1. **Can't login**: Check browser extension, refresh page
2. **Messages not sending**: Check relay connection, internet
3. **Messages not loading**: Clear cache, try different relay
4. **File upload fails**: Check file size, try different Blossom server

## Performance Targets

- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] Lighthouse Performance Score > 90
- [ ] Lighthouse Accessibility Score > 95
- [ ] Bundle size < 500KB (gzipped)

## Compliance

### Privacy
- No data collection
- No cookies
- No tracking
- No third-party scripts
- Full GDPR compliance (no data stored)

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast ratios met

## Launch Checklist

- [ ] All pre-deployment items complete
- [ ] Build successful
- [ ] Deployed to production
- [ ] HTTPS enabled
- [ ] PWA installable
- [ ] All tests passing on production
- [ ] Documentation updated
- [ ] README.md accurate
- [ ] GUIDE.md accessible
- [ ] Social media ready (screenshots, demo)

## Post-Launch

- [ ] Announce on Nostr
- [ ] Share on social media
- [ ] Submit to Nostr app directories
- [ ] Gather user feedback
- [ ] Monitor for issues
- [ ] Plan future updates

---

**Note**: This is a privacy-focused, decentralized app. There's no backend to maintain, no database to manage, and no user data to protect. The simplicity is a feature!
