# ISRC Spotify Backend API

Backend REST API for looking up Spotify tracks by ISRC code or text search.

## Features

- 🔐 Spotify OAuth authentication with automatic token caching
- ✅ ISRC format validation
- 🔍 Search by ISRC or text query
- 🚀 Deployed on Vercel as serverless function
- 🐳 Docker support for local development

## Prerequisites

- Node.js 18+
- Spotify Developer Account ([Get credentials](https://developer.spotify.com/dashboard))

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` and add your Spotify credentials:

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
PORT=5000
NODE_ENV=development
```

### 3. Start the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check

Check if the server is running.

```bash
GET /api/health
```

**Example:**
```bash
curl http://localhost:5000/api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": 1702345678901,
  "environment": "development",
  "version": "1.0.0"
}
```

---

### Search by ISRC

Find a track by its ISRC code.

```bash
GET /api/search-isrc?isrc=<CODE>
```

**Parameters:**
- `isrc` (required): 12-character ISRC code (e.g., USUM71505639)

**Example:**
```bash
curl "http://localhost:5000/api/search-isrc?isrc=USUM71505639"
```

**Response:**
```json
{
  "id": "3qm86nIvCmVrRSHezMqD4v",
  "name": "Blinding Lights",
  "artists": ["The Weeknd"],
  "album": "After Hours",
  "album_image": "https://i.scdn.co/image/...",
  "popularity": 95,
  "preview_url": "https://p.scdn.co/mp3-preview/...",
  "spotify_url": "https://open.spotify.com/track/3qm86nIvCmVrRSHezMqD4v",
  "isrc": "USUM71505639",
  "duration_ms": 200040,
  "release_date": "2020-03-20",
  "explicit": false
}
```

**Error Responses:**

- `400 Bad Request`: Invalid or missing ISRC
- `404 Not Found`: Track not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

### Search by Text

Search tracks by title, artist, or keywords.

```bash
GET /api/search?q=<QUERY>&limit=<NUMBER>
```

**Parameters:**
- `q` (required): Search query
- `limit` (optional): Number of results (1-50, default: 10)

**Example:**
```bash
curl "http://localhost:5000/api/search?q=blinding%20lights&limit=5"
```

**Response:**
```json
{
  "total": 127,
  "limit": 5,
  "items": [
    {
      "id": "3qm86nIvCmVrRSHezMqD4v",
      "name": "Blinding Lights",
      "artists": ["The Weeknd"],
      "album": "After Hours",
      ...
    },
    ...
  ]
}
```

## Docker Usage

### Build and Run

```bash
# Build image
docker build -t isrc-spotify-backend .

# Run container
docker run -p 5000:5000 --env-file .env isrc-spotify-backend
```

### Docker Compose

See root `docker-compose.yml` for full-stack orchestration.

## Deployment to Vercel

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Deploy

```bash
vercel
```

### 3. Set Environment Variables

In Vercel dashboard, add:
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `NODE_ENV=production`

### 4. Test Production

```bash
curl "https://your-backend.vercel.app/api/health"
```

## Test ISRCs

Use these for testing:

- `USUM71505639` - Blinding Lights (The Weeknd)
- `GBUM72206000` - Shape of You (Ed Sheeran)
- `USTH91918251` - Levitating (Dua Lipa)
- `USUM71900245` - Don't Start Now (Dua Lipa)

## Error Handling

All errors return JSON with this format:

```json
{
  "error": "Error type",
  "message": "User-friendly message",
  "details": "Technical details (development only)"
}
```

## CORS Configuration

The API allows requests from:
- `http://localhost:3000` (React default)
- `http://localhost:5173` (Vite default)
- `*.vercel.app` domains
- Custom frontend URL (set via `FRONTEND_URL` env variable)

## Token Caching

Spotify access tokens are cached in memory and automatically refreshed 5 minutes before expiry. This reduces API calls and improves performance.

## Rate Limiting

Spotify API has rate limits. The server handles 429 responses and returns appropriate error messages to clients.

## Troubleshooting

### "Cannot find module" error

```bash
npm install
```

### "SPOTIFY_CLIENT_ID must be set" error

Check your `.env` file exists and contains valid credentials.

### CORS errors

Ensure your frontend URL is whitelisted in the CORS configuration (server.js line 148).

### Token errors

Delete cached token by restarting the server. The new token will be fetched automatically.

## License

ISC

## Support

For issues or questions, contact Distrify.me
