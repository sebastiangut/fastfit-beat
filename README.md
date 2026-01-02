# FastFit Beat 🎵

Your workout music companion - Energize your fitness routine with curated radio stations designed for every workout.

## Features

- 🎧 **HLS Streaming** - High-quality audio streaming with HLS.js support
- 📱 **PWA Support** - Install as a native app on mobile devices
- 🌙 **Dark Mode Only** - Sleek, modern dark interface
- 📊 **Admin Dashboard** - Manage stations and view analytics
- 💾 **Offline Support** - IndexedDB for data persistence
- 🔐 **Secure Admin** - Password-protected admin panel
- 📈 **Analytics** - Track plays, favorites, and engagement
- 📱 **Mobile Optimized** - iPhone notch support with safe areas

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Audio**: HLS.js for adaptive streaming
- **Database**: IndexedDB (via idb)
- **Deployment**: Netlify
- **PWA**: Vite PWA Plugin

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment to Netlify

### Connect GitHub Repository

1. Go to [Netlify](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and authorize Netlify
4. Select the repository: `sebastiangut/fastfit-beat`
5. Netlify will auto-detect build settings from `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 18
6. Click **"Deploy site"**

### Netlify CLI (Alternative)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

## Admin Panel

Access the admin panel at `/admin` to:
- Add/Edit/Delete radio stations
- Upload custom cover images
- View analytics (plays, favorites)
- Manage station metadata

**First-time setup**: Create an admin password on first visit.

## Project Structure

```
src/
├── assets/          # Station cover images
├── components/      # React components
│   ├── admin/      # Admin panel components
│   └── ui/         # shadcn/ui components
├── lib/            # Utilities (db, migration)
├── pages/          # Route pages
├── types/          # TypeScript types
└── index.css       # Global styles + design system
```

## Browser Support

- Chrome/Edge: Full support (HLS via hls.js)
- Firefox: Full support (HLS via hls.js)
- Safari: Full support (Native HLS)
- Mobile Safari: Optimized with safe area insets

## License

MIT

---

Built with ❤️ using [Claude Code](https://claude.com/claude-code)
