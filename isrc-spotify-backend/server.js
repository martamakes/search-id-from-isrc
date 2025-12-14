require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Validate environment variables
if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
  console.error('❌ Error: SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set in .env file');
  console.error('   Get your credentials from: https://developer.spotify.com/dashboard');
  process.exit(1);
}

// In-memory token cache
let spotifyToken = null;
let tokenExpiry = null;

// ============================================================================
// Spotify OAuth - Client Credentials Flow
// ============================================================================

/**
 * Get Spotify access token using Client Credentials flow
 * Implements automatic token caching and refresh
 */
async function getSpotifyToken() {
  // Return cached token if still valid
  if (spotifyToken && tokenExpiry && Date.now() < tokenExpiry) {
    return spotifyToken;
  }

  try {
    const authString = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    spotifyToken = response.data.access_token;
    // Set expiry to 5 minutes before actual expiry for safety margin
    tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

    console.log('✅ Spotify token obtained successfully');
    return spotifyToken;
  } catch (error) {
    console.error('❌ Error obtaining Spotify token:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Spotify API');
  }
}

// ============================================================================
// ISRC Validation
// ============================================================================

/**
 * Validate ISRC format
 * Format: CC-XXX-YY-NNNNN (12 characters without hyphens)
 * - CC: 2-letter country code
 * - XXX: 3-character registrant code (alphanumeric)
 * - YY: 2-digit year
 * - NNNNN: 5-digit designation code
 */
function isValidISRC(isrc) {
  if (!isrc || typeof isrc !== 'string') {
    return false;
  }

  // Remove hyphens and convert to uppercase
  const cleanISRC = isrc.replace(/-/g, '').toUpperCase();

  // Check format: 2 letters, 3 alphanumeric, 7 digits
  const isrcPattern = /^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}$/;
  return isrcPattern.test(cleanISRC);
}

/**
 * Normalize ISRC by removing hyphens and converting to uppercase
 */
function normalizeISRC(isrc) {
  return isrc.replace(/-/g, '').toUpperCase();
}

// ============================================================================
// Spotify API Helper Functions
// ============================================================================

/**
 * Format track data from Spotify API response
 */
function formatTrackData(track) {
  return {
    id: track.id,
    name: track.name,
    artists: track.artists.map(artist => artist.name),
    album: track.album.name,
    album_image: track.album.images[0]?.url || null,
    popularity: track.popularity,
    preview_url: track.preview_url,
    spotify_url: track.external_urls.spotify,
    isrc: track.external_ids?.isrc || null,
    duration_ms: track.duration_ms,
    release_date: track.album.release_date,
    explicit: track.explicit
  };
}

/**
 * Search Spotify API
 */
async function searchSpotify(query, type = 'track', limit = 10) {
  try {
    const token = await getSpotifyToken();

    const response = await axios.get('https://api.spotify.com/v1/search', {
      params: {
        q: query,
        type: type,
        limit: limit
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // Token expired, clear cache and retry once
      spotifyToken = null;
      tokenExpiry = null;

      const token = await getSpotifyToken();
      const response = await axios.get('https://api.spotify.com/v1/search', {
        params: {
          q: query,
          type: type,
          limit: limit
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    }
    throw error;
  }
}

// ============================================================================
// Middleware Configuration
// ============================================================================

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// API Routes
// ============================================================================

/**
 * Health check endpoint
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

/**
 * Search track by ISRC
 * GET /api/search-isrc?isrc=USUM71505639
 */
app.get('/api/search-isrc', async (req, res) => {
  try {
    const { isrc } = req.query;

    // Validate ISRC parameter
    if (!isrc) {
      return res.status(400).json({
        error: 'Missing ISRC parameter',
        message: 'Please provide an ISRC code in the query string: ?isrc=CODE'
      });
    }

    // Validate ISRC format
    if (!isValidISRC(isrc)) {
      return res.status(400).json({
        error: 'Invalid ISRC format',
        message: 'ISRC must be 12 characters: 2 letters, 3 alphanumeric, 7 digits (e.g., USUM71505639)',
        provided: isrc
      });
    }

    // Normalize ISRC
    const normalizedISRC = normalizeISRC(isrc);

    // Search Spotify
    const searchQuery = `isrc:${normalizedISRC}`;
    const data = await searchSpotify(searchQuery, 'track', 1);

    // Check if track found
    if (!data.tracks || data.tracks.items.length === 0) {
      return res.status(404).json({
        error: 'Track not found',
        message: `No track found with ISRC: ${normalizedISRC}`,
        isrc: normalizedISRC
      });
    }

    // Format and return track data
    const track = formatTrackData(data.tracks.items[0]);
    res.json(track);

  } catch (error) {
    console.error('Error in /api/search-isrc:', error.message);

    if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests to Spotify API. Please try again later.'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while searching for the track',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Search tracks by text query
 * GET /api/search?q=blinding+lights
 */
app.get('/api/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    // Validate query parameter
    if (!q) {
      return res.status(400).json({
        error: 'Missing query parameter',
        message: 'Please provide a search query: ?q=YOUR_SEARCH'
      });
    }

    // Validate limit
    const parsedLimit = parseInt(limit);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
      return res.status(400).json({
        error: 'Invalid limit parameter',
        message: 'Limit must be between 1 and 50'
      });
    }

    // Search Spotify
    const data = await searchSpotify(q, 'track', parsedLimit);

    // Check if tracks found
    if (!data.tracks || data.tracks.items.length === 0) {
      return res.status(404).json({
        error: 'No tracks found',
        message: `No tracks found for query: "${q}"`,
        query: q
      });
    }

    // Format and return tracks
    const tracks = data.tracks.items.map(formatTrackData);
    res.json({
      total: data.tracks.total,
      limit: parsedLimit,
      items: tracks
    });

  } catch (error) {
    console.error('Error in /api/search:', error.message);

    if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests to Spotify API. Please try again later.'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while searching for tracks',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================================================
// Error Handling Middleware
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.path} does not exist`,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/search-isrc?isrc=CODE',
      'GET /api/search?q=QUERY'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ============================================================================
// Server Start
// ============================================================================

app.listen(PORT, () => {
  const env = process.env.NODE_ENV || 'development';
  console.log('\n' + '='.repeat(60));
  console.log('🎵  ISRC Spotify API Server');
  console.log('='.repeat(60));
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${env}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log('\n📋 Available endpoints:');
  console.log(`   GET /api/health`);
  console.log(`   GET /api/search-isrc?isrc=USUM71505639`);
  console.log(`   GET /api/search?q=blinding%20lights`);
  console.log('='.repeat(60) + '\n');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;
