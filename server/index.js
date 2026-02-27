const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const ytSearch = require('yt-search');
const ytdl = require('@distube/ytdl-core');

const axios = require('axios');
const app = express();
app.use(cors());

// Simple file logger
const log = (msg) => {
  const time = new Date().toISOString();
  const line = `[${time}] ${msg}\n`;
  // Only log to console in production (Vercel filesystem is read-only)
  if (process.env.NODE_ENV !== 'production') {
    try {
      const logFile = path.join(__dirname, 'server.log');
      fs.appendFileSync(logFile, line);
    } catch (e) {}
  }
  console.log(line);
};

app.use((req, res, next) => {
  log(`${req.method} ${req.url}`);
  next();
});

// CACHE OBJECTS
const cache = {
  suggestions: new Map(),
  search: new Map(),
  MAX_SIZE: 100 // Keep only last 100 searches
};

// Helper to keep cache size in check
const addToCache = (cacheMap, key, value) => {
  if (cacheMap.size >= cache.MAX_SIZE) {
    const firstKey = cacheMap.keys().next().value;
    cacheMap.delete(firstKey);
  }
  cacheMap.set(key, value);
};

// ROOT ENDPOINT (Health check)
app.get('/', (req, res) => {
  res.json({ status: 'online', message: 'Music App Backend is running on Vercel!' });
});

// SUGGESTIONS ENDPOINT
app.get('/suggestions', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json([]);

    // Check cache
    if (cache.suggestions.has(query)) {
      return res.json(cache.suggestions.get(query));
    }

    const response = await axios.get(`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
      }
    });

    const suggestions = response.data[1];
    addToCache(cache.suggestions, query, suggestions);
    res.json(suggestions);
  } catch (error) {
    console.error('Suggestions error:', error.message);
    res.json([]);
  }
});

// SEARCH ENDPOINT
app.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Query is missing' });

    // Check cache
    if (cache.search.has(query)) {
      log(`[Cache Hit] Search: ${query}`);
      return res.json(cache.search.get(query));
    }
    
    // Search Youtube via yt-search
    const result = await ytSearch(query);
    const videos = result.videos.slice(0, 15).map(v => ({
      id: v.videoId,
      title: v.title,
      artist: v.author.name,
      artwork: v.image,
      duration: v.timestamp,
      url: v.url
    }));
    
    addToCache(cache.search, query, videos);
    res.json(videos);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// STREAM ENDPOINT: Youtube Streaming via yt-dlp native binary wrapper!
app.get('/stream', async (req, res) => {
  try {
    const trackUrl = req.query.url;
    const isDownload = req.query.download === '1';
    if (!trackUrl) return res.status(400).json({ error: 'Track URL is missing' });
    
    console.log(`[Stream API] Fetching from YouTube via yt-dlp... (Download: ${isDownload}) URL: ${trackUrl}`);
    
    res.header('Content-Type', 'audio/mpeg');
    if (isDownload) {
      res.header('Content-Disposition', `attachment; filename="audio.mp3"`);
    } else {
      res.header('Content-Disposition', `inline; filename="audio.mp3"`);
    }
    res.header('Transfer-Encoding', 'chunked');

    const stream = ytdl(trackUrl, {
        filter: 'audioonly',
        quality: 'highestaudio',
        highWaterMark: 10 * 1024 * 1024 // 10MB chunk for fast response on serverless
    });
    
    stream.on('info', (info) => {
      log(`[Stream] Playing: ${info.videoDetails.title}`);
    });
    
    stream.pipe(res);

    stream.on('error', (err) => {
        log(`[Stream Error] ${err.message}`);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to stream audio' });
        }
    });

    req.on('close', () => {
        // ytdl streams are cleaner to close
        stream.destroy();
    });

  } catch (error) {
    console.error('Stream setup error:', error);
    if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream audio' });
    }
  }
});

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    log(`Music App Backend running on port ${PORT}`);
  });
}

module.exports = app;
