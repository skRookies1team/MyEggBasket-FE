import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Node 18+ has fetch; if not available, require('node-fetch') can be used.
// Keep using global fetch so no extra dependency required in modern Node.

dotenv.config();

const REST_BASE_URL = 'https://openapi.koreainvestment.com:9443';
const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

app.post('/api/approval', async (req, res) => {
  try {
    const appkey = process.env.VITE_APP_KEY || process.env.APP_KEY;
    const secret = process.env.VITE_APP_SECRET || process.env.APP_SECRET;

    if (!appkey || !secret) {
      return res.status(500).json({ error: 'Missing server-side credentials' });
    }

    const url = `${REST_BASE_URL}/oauth2/Approval`;
    const payload = {
      grant_type: 'client_credentials',
      appkey,
      secretkey: secret,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: 'Approval request failed', detail: text });
    }

    const data = await response.json();
    return res.json({ approval_key: data.approval_key });
  } catch (err) {
    console.error('Approval proxy error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});

