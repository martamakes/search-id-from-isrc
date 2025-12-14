# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ISRC Spotify Lookup Tool - A full-stack application that searches for Spotify tracks by their ISRC (International Standard Recording Code) and returns Spotify IDs, metadata, and direct links. Built for Distrify.me to verify ISRCs, map catalogs to Spotify, and analyze track data.

## Architecture

This is a monorepo containing two separate applications that will be deployed independently:

### Backend (`isrc-spotify-backend/`)
- **Stack**: Node.js + Express
- **Purpose**: REST API for ISRC lookup via Spotify Web API
- **Key Features**:
  - Automatic Spotify OAuth authentication with token caching
  - ISRC validation
  - Three main endpoints: `/api/search-isrc`, `/api/search`, `/api/health`
- **Deployment**: Vercel (serverless functions)

### Frontend (`isrc-spotify-frontend/`)
- **Stack**: React (create-react-app)
- **Purpose**: Web UI for ISRC lookup
- **Key Features**:
  - ISRC search interface
  - Text-based search (title/artist)
  - Metadata visualization (popularity charts, audio preview)
  - Direct links to Spotify
- **Deployment**: Vercel (static hosting)

## Common Commands

### Backend Development
```bash
cd isrc-spotify-backend
npm install
npm run dev          # Start development server with nodemon
npm start            # Start production server
```

### Frontend Development
```bash
cd isrc-spotify-frontend
npm install
npm start            # Start React dev server (port 3000)
npm run build        # Build for production
npm test             # Run tests
```

### Docker (Full Stack)
```bash
# From repository root
docker-compose up --build    # Build and run both services
```

### API Testing
```bash
# ISRC lookup
curl "http://localhost:5000/api/search-isrc?isrc=USUM71505639"

# Text search
curl "http://localhost:5000/api/search?q=blinding%20lights"

# Health check
curl "http://localhost:5000/api/health"
```

### Test ISRCs
- `USUM71505639` - Blinding Lights (The Weeknd)
- `GBUM72206000` - Shape of You (Ed Sheeran)
- `USTH91918251` - Levitating (Dua Lipa)
- `USUM71900245` - Don't Start Now (Dua Lipa)

## Environment Configuration

### Backend `.env`
```
SPOTIFY_CLIENT_ID=<your_client_id>
SPOTIFY_CLIENT_SECRET=<your_client_secret>
PORT=5000
NODE_ENV=development
```

### Frontend `.env.production`
```
REACT_APP_API_URL=https://isrc-spotify-api.vercel.app
```

Get Spotify credentials at: https://developer.spotify.com/dashboard

## Deployment (Vercel)

Both backend and frontend deploy separately to Vercel:

1. **Backend**: Deploy from `isrc-spotify-backend/` directory
   - Add environment variables in Vercel dashboard
   - Vercel uses `vercel.json` to configure serverless function

2. **Frontend**: Deploy from `isrc-spotify-frontend/` directory
   - Update `.env.production` with backend URL after backend deployment
   - Vercel auto-detects React app and builds accordingly

Auto-deploys on push to main branch.

## Key Implementation Details

### Spotify API Integration
- Uses Client Credentials flow (no user authentication needed)
- Token caching to minimize API calls
- ISRC search via `/v1/search?type=track&q=isrc:CODE`

### CORS Configuration
Backend must allow frontend origin in CORS headers for local development and production deployments.

### Error Handling
- ISRC validation before API calls
- Spotify API error responses (404, 401, rate limits)
- Network timeouts and connection errors

## File Structure Notes

When the project is fully implemented, the structure will be:

```
search-id-from-isrc/
├── isrc-spotify-backend/
│   ├── server.js              # Main Express server
│   ├── package.json
│   ├── vercel.json            # Vercel serverless config
│   ├── Dockerfile
│   └── .env.example
│
├── isrc-spotify-frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ISRCSearcher.jsx    # Main search component
│   │   │   └── ISRCSearcher.css
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   └── index.css
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── vercel.json            # Vercel React config
│   └── Dockerfile
│
├── docs/                      # Project documentation
├── docker-compose.yml         # Full stack orchestration
└── .gitignore
```

## Security

- Never commit `.env` files (already in `.gitignore`)
- Store `SPOTIFY_CLIENT_SECRET` only in Vercel environment variables
- ISRC validation prevents injection attacks
- CORS restricted to known origins in production
