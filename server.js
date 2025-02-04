const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors({ origin: "http://localhost:3000" }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(express.static('public'));

// Proxy endpoint for Steam wishlist data
app.get('/api/wishlist', async (req, res) => {
  const steamid = req.query.steamid;
  if (!steamid) return res.status(400).json({ error: 'Missing steamid' });
  try {
    const response = await fetch(`https://api.steampowered.com/IWishlistService/GetWishlist/v1?steamid=${steamid}`);
    res.json(await response.json());
  } catch (e) {
    res.status(500).json({ error: 'Fetch failed' });
  }
});

// Proxy endpoint for Steam game data
app.get('/api/appdetails', async (req, res) => {
    const appid = req.query.appid;
    if (!appid) return res.status(400).json({ error: 'Missing appid' });
    try {
      const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}`, { method: 'GET' });
      res.json(await response.json());
    } catch (e) {
      res.status(500).json({ error: 'Fetch failed' });
    }
  });

app.listen(3000, () => console.log('Listening on 3000'));
